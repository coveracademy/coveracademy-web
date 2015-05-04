'use strict'

var models            = require('../models'),
    entities          = require('../utils/entities'),
    slug              = require('../utils/slug'),
    encrypt           = require('../utils/encrypt'),
    logger            = require('../configs/logger'),
    mailService       = require('./mailService'),
    messages          = require('./messages'),
    uuid              = require('node-uuid'),
    moment            = require('moment'),
    Promise           = require('bluebird'),
    _                 = require('underscore'),
    User              = models.User,
    UserFan           = models.UserFan,
    SocialAccount     = models.SocialAccount,
    VerificationToken = models.VerificationToken,
    Bookshelf         = models.Bookshelf,
    $                 = this;

var userWithSocialAccountsRelated = {withRelated: ['socialAccounts']};
var networksToConnect = ['facebook', 'twitter', 'google', 'youtube', 'soundcloud'];
var networksToDisconnect = ['twitter', 'google', 'youtube', 'soundcloud'];
var networksWithPicture = ['facebook', 'twitter', 'google'];
var getAccountAttribute = function(network) {
  if(!_.contains(networksToConnect, network)) {
    return null;
  }
  return network + '_account';
};
var getPictureAttribute = function(network) {
  if(!_.contains(networksWithPicture, network)) {
    return null;
  }
  return network + '_picture';
};
var findUserOptions = function(relations) {
  var options = {}; // TODO: add option {require: true}
  if(relations === true) {
    options = _.extend(options, userWithSocialAccountsRelated);
  }
  return options;
};

exports.forge = function(userData) {
  return User.forge(userData);
};

exports.createTemporaryFacebookAccount = function(facebookAccount, facebookPicture, name, gender) {
  var temporary = $.forge({
    name: name,
    gender: gender,
    profile_picture: 'facebook',
    facebook_account: facebookAccount,
    facebook_picture: facebookPicture
  });
  return temporary;
};

exports.connectNetwork = function(user, network, account, picture, url) {
  return new Promise(function(resolve, reject) {
    if(!_.contains(networksToConnect, network)) {
      reject(messages.apiError('user.auth.unsupportedNetworkAssociation', 'Association with network ' + network + ' is not supported'));
      return;
    }
    Bookshelf.transaction(function(transaction) {
      var accountAttribute = getAccountAttribute(network);
      user.set(accountAttribute, account);
      var pictureAttribute = getPictureAttribute(network);
      if(pictureAttribute) {
        user.set(pictureAttribute, picture);
      }

      var userPromise;
      if(user.isNew()) {
        userPromise = user.save(null, {transacting: transaction});
      } else {
        var updatedAttributes = {};
        updatedAttributes[accountAttribute] = user.get(accountAttribute);
        if(pictureAttribute) {
          updatedAttributes[pictureAttribute] = user.get(pictureAttribute);
        }
        userPromise = user.save(updatedAttributes, {patch: true, transacting: transaction});
      }

      return userPromise.then(function(user) {
        var socialAccount = SocialAccount.forge({user_id: user.id, network: network, url: url, show_link: 0});
        return socialAccount.save(null, {transacting: transaction});
      });
    }).then(function(socialAccount) {
      user.related('socialAccounts').add(socialAccount);
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
};

exports.disconnectNetwork = function(user, network) {
  return new Promise(function(resolve, reject) {
    if(!_.contains(networksToDisconnect, network)) {
      reject(messages.apiError('user.auth.unsupportedNetworkDisassociation', 'Disassociation with network ' + network + ' is not supported'));
    }

    var updatedAttributes = {}

    var accountAttribute = getAccountAttribute(network);
    user.set(accountAttribute, null);
    updatedAttributes[accountAttribute] = null;

    var pictureAttribute = getPictureAttribute(network);
    if(pictureAttribute) {
      user.set(pictureAttribute, null);
      updatedAttributes[pictureAttribute] = null;
    }

    if(user.get('profile_picture') === network) {
      user.set('profile_picture', 'facebook');
      updatedAttributes['profile_picture'] = user.get('profile_picture');
    }

    Bookshelf.transaction(function(transaction) {
      return user.save(updatedAttributes, {patch: true, transacting: transaction}).then(function(user) {
        return SocialAccount.where({user_id: user.id, network: network}).destroy({transacting: transaction});
      });
    }).then(function() {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
};

exports.showNetwork = function(user, network, showLink) {
  return new Promise(function(resolve, reject) {
    SocialAccount.forge({user_id: user.id, network: network}).fetch().then(function(socialAccount) {
      return socialAccount.save({show_link: showLink === true ? 1 : 0}, {patch: true});
    }).then(function(socialAccount) {
      resolve();
    }).catch(function(err) {
      reject(err);
    });
  });
};

exports.create = function(userData) {
  return new Promise(function(resolve, reject) {
    Promise.resolve().then(function() {
      if(!userData.email || userData.email.trim().length === 0) {
        throw messages.apiError('user.auth.emailRequired', 'The email is required');
      }
      if(userData.username && !slug.isValidUsername(userData.username)) {
        throw messages.apiError('user.edit.invalidUsername', 'The username is invalid');
      }
      var user = $.forge(userData);
      user.set('permission', 'user');
      user.set('verified', 1);
      if(userData.verifyEmail === true) {
        user.set('verified', 0);
      }
      return user.save(null, {scenario: 'creation'});
    }).then(function(user) {
      return $.connectNetwork(user, 'facebook', userData.facebook_account, userData.facebook_picture);
    }).then(function(userConnected) {
      if(userConnected.get('verified') === 0) {
        $.sendVerificationEmail(userConnected, true).catch(function(err) {
          logger.error('Error sending "user verification" email to user %d.', userConnected.id, err);
        });
      } else {
        mailService.userRegistration(userConnected).catch(function(err) {
          logger.error('Error sending "user registration" email to user %d.', userConnected.id, err);
        });
      }
      resolve(userConnected);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      reject(messages.apiError('user.auth.errorCreatingAccount', 'Unexpected error creating account', err));
    });
  });
};

exports.save = function(user, attributes) {
  return attributes ? user.save(user.pick(attributes), {patch: true}) : user.save();
};

exports.update = function(user, edited) {
  return new Promise(function(resolve, reject) {
    Promise.resolve().then(function() {
      if(user.id !== edited.id && user.permission !== 'admin') {
        throw messages.apiError('user.edit.noPermission', 'The user informations cannot be edited because user has no permission');
      }
      return $.forge({id: edited.id}).fetch();
    }).then(function(userFetched) {
      if(userFetched.get('username') && userFetched.get('username') !== edited.get('username')) {
        throw messages.apiError('user.edit.cannotEditUsernameAnymore', 'The user can not edit username anymore');
      }
      if(edited.get('username') && !slug.isValidUsername(edited.get('username'))) {
        throw messages.apiError('user.edit.invalidUsername', 'The username is invalid');
      }
      if(userFetched.get('email') !== edited.get('email')) {
        edited.set('verified', 0);
      }
      return edited.save(null, {patch: true, scenario: 'edition'});
    }).then(function(userEdited) {
      if(userEdited.get('verified') === 0) {
        $.sendVerificationEmail(userEdited).catch(function(err) {
          logger.error('Error sending "user verification" email to user %d.', userEdited.id, err);
        });
      }
      resolve(userEdited);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      reject(messages.unexpectedError('Error editing user', err));
    });
  });
};


exports.findById = function(id, relations) {
  return $.forge({id: id}).fetch(findUserOptions(relations));
};

exports.findByEmail = function(email, relations) {
  return $.forge({email: email}).fetch(findUserOptions(relations));
};

exports.findByUsername = function(username, relations) {
  return $.forge({username: username}).fetch(findUserOptions(relations));
};

exports.findBySocialAccount = function(network, account, relations) {
  if(!_.contains(networksToConnect, network)) {
    reject(messages.apiError('user.unsupportedNetwork', 'Network ' + network + ' is not supported'));
  }
  var accountAttribute = getAccountAttribute(network);
  if(accountAttribute) {
    var search = {};
    search[accountAttribute] = account;
    return $.forge(search).fetch(findUserOptions(relations));
  } else {
    return Promise.resolve();
  }
}

exports.verifyEmail = function(token) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      return VerificationToken.forge({token: token}).fetch({withRelated: ['user'], require: true}).bind({}).then(function(activationToken) {
        this.user = activationToken.related('user');
        return activationToken.destroy({transacting: transaction});
      }).then(function() {
        this.user.set('verified', 1);
        return this.user.save({verified: this.user.get('verified')}, {patch: true, transacting: transaction});
      }).then(function(user) {
        return user;
      });
    }).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
};

exports.sendVerificationEmail = function(user, registration) {
  return VerificationToken.forge({user_id: user.id, token: uuid.v1(), expiration_date: moment().add(7, 'days').toDate()}).save(null, {method: 'insert'}).then(function(token) {
    return mailService.userVerification(user, token, registration).catch(function(err) {
      throw messages.apiError('user.verification.errorSendingVerificationEmail', 'Error sending verification email to ' + user.get('email'));
    });
  });
};

exports.resendVerificationEmail = function(user) {
  return user.fetch().then(function(userFetched) {
    if(userFetched.get('verified') === 1) {
      throw messages.apiError('user.verification.emailAlreadyVerified', 'The user is already verified');
    }
    return $.sendVerificationEmail(userFetched);
  });
};

exports.disableEmails = function(token) {
  return new Promise(function(resolve, reject) {
    var email = encrypt.decrypt(token);
    $.findByEmail(email).then(function(user) {
      return user.save({emails_enabled: 0}, {patch: true});
    }).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
};

exports.listAllUsers = function() {
  return User.collection().fetch();
};

exports.totalFans = function(user) {
  return new Promise(function(resolve, reject) {
    var qb = Bookshelf.knex('user_fan')
    .count('id as total_fans')
    .where('user_id', user.id)
    .then(function(rows) {
      resolve(rows[0].total_fans);
    }).catch(function(err) {
      reject(err);
    });
  });
};

exports.isFan = function(fan, user) {
  if(!fan || !user) {
    return Promise.resolve(false);
  } else {
    return UserFan.forge({user_id: user.id, fan_id: fan.id}).fetch().then(function(fan) {
      return fan ? true  : false;
    });
  }
}

exports.fan = function(userFan, user) {
  return new Promise(function(resolve, reject) {
    Promise.resolve().bind({}).then(function() {
      if(userFan.id === user.id) {
        throw messages.apiError('user.fan.canNotFanYourSelf', 'You can not fan yourself.');
      }
      var fan = UserFan.forge({user_id: user.id, fan_id: userFan.id});
      this.fan = fan;
      return fan.save();
    }).then(function(fan) {
      resolve(fan);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      if(err.code === 'ERR_DUP_ENTRY') {
        resolve(this.fan);
      } else {
        reject(err);
      }
    });
  });
};

exports.unfan = function(fan, user) {
  return UserFan.forge({user_id: user.id, fan_id: fan.id}).fetch().then(function(fan) {
    return !fan ? Promise.resolve() : fan.destroy();
  });
};

exports.latestFans = function(user, page, pageSize) {
  return User.collection().query(function(qb) {
    qb.join('user_fan', 'user.id', 'user_fan.fan_id');
    qb.where('user_fan.user_id', user.id);
    qb.orderBy('user_fan.registration_date', 'desc');
    if(page && pageSize) {
      qb.offset((page - 1) * pageSize);
      qb.limit(pageSize);
    }
  }).fetch();
};