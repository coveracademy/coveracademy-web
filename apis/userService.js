"use strict"

var User              = require('../models/models').User,
    UserFan           = require('../models/models').UserFan,
    SocialAccount     = require('../models/models').SocialAccount,
    VerificationToken = require('../models/models').VerificationToken,
    Bookshelf         = require('../models/models').Bookshelf,
    entities          = require('../utils/entities'),
    slug              = require('../utils/slug'),
    logger            = require('../configs/logger'),
    mailService       = require('./mailService'),
    messages          = require('./messages'),
    uuid              = require('node-uuid'),
    moment            = require('moment'),
    Promise           = require('bluebird'),
    _                 = require('underscore'),
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

exports.forge = function(userData) {
  return User.forge(userData);
}

exports.createTemporaryFacebookAccount = function(facebookAccount, facebookPicture, name, gender) {
  var temporary = $.forge({
    name: name,
    gender: gender,
    profile_picture: 'facebook',
    facebook_account: facebookAccount,
    facebook_picture: facebookPicture
  });
  return temporary;
}

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
}

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
}

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
}

exports.create = function(userData) {
  return new Promise(function(resolve, reject) {
    if(!userData.email || userData.email.trim().length === 0) {
      reject(messages.apiError('user.auth.emailRequired', 'The email is required'));
      return;
    }
    if(userData.username && !slug.isValidUsername(userData.username)) {
      reject(messages.apiError('user.edit.invalidUsername', 'The username is invalid'));
      return;
    }
    var user = $.forge(entities.filterAttributes(userData, 'UserCreationAttributes'));
    user.set('permission', 'user');
    user.set('verified', 1);
    if(userData.verifyEmail === true) {
      user.set('verified', 0);
    }
    $.connectNetwork(user, 'facebook', userData.facebook_account, userData.facebook_picture).then(function(userConnected) {
      resolve(userConnected);
      if(userConnected.get('verified') === 0) {
        $.sendVerificationEmail(userConnected, true).catch(function(err) {
          logger.error('Error sending "user verification" email to user %d.', userConnected.id, err);
        });
      } else {
        mailService.userRegistration(userConnected).catch(function(err) {
          logger.error('Error sending "user registration" email to user %d.', userConnected.id, err);
        });
      }
    }).catch(function(err) {
      reject(messages.apiError('user.auth.errorCreatingAccount', 'Unexpected error creating account', err));
    });
  });
}

exports.save = function(user, attributes) {
  if(attributes) {
    return user.save(user.pick(attributes), {patch: true});
  } else {
    return user.save();
  }
}

exports.update = function(user, edited) {
  return new Promise(function(resolve, reject) {
    if(user.id !== edited.id && user.permission !== 'admin') {
      reject(messages.apiError('user.edit.noPermission', 'The user informations cannot be edited because user has no permission'));
      return;
    }
    $.forge({id: edited.id}).fetch().then(function(userFetched) {
      if(userFetched.get('username') && userFetched.get('username') !== edited.get('username')) {
        reject(messages.apiError('user.edit.cannotEditUsernameAnymore', 'The user can not edit username anymore'));
        return;
      }
      if(edited.get('username') && !slug.isValidUsername(edited.get('username'))) {
        reject(messages.apiError('user.edit.invalidUsername', 'The username is invalid'));
        return;
      }
      if(userFetched.get('email') !== edited.get('email')) {
        edited.set('verified', 0);
      }
      edited.save(edited.pick(entities.modelsAttributes.UserEditableAttributes), {patch: true}).then(function(userEdited) {
        resolve(userEdited);
        if(userEdited.get('verified') === 0) {
          $.sendVerificationEmail(userEdited).catch(function(err) {
            logger.error('Error sending "user verification" email to user %d.', userEdited.id, err);
          });
        }
      }).catch(function(err) {
        reject(messages.unexpectedError('Error editing user', err));
      });
    }).catch(function(err) {
      reject(messages.unexpectedError('Error editing user', err));
    });
  });
}

exports.findById = function(id, relations) {
  return $.forge({id: id}).fetch(relations === true ? userWithSocialAccountsRelated: null);
}

exports.findByEmail = function(email, relations) {
  return $.forge({email: email}).fetch(relations === true ? userWithSocialAccountsRelated: null);
}

exports.findByUsername = function(username, relations) {
  return $.forge({username: username}).fetch(relations === true ? userWithSocialAccountsRelated: null);
}

exports.findBySocialAccount = function(network, account, relations) {
  if(!_.contains(networksToConnect, network)) {
    reject(messages.apiError('user.unsupportedNetwork', 'Network ' + network + ' is not supported'));
  }
  var accountAttribute = getAccountAttribute(network);
  if(accountAttribute) {
    var search = {};
    search[accountAttribute] = account;
    return $.forge(search).fetch(relations === true ? userWithSocialAccountsRelated: null);
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
}

exports.sendVerificationEmail = function(user, registration) {
  return VerificationToken.forge({user_id: user.id, token: uuid.v1(), expiration_date: moment().add(7, 'days').toDate()}).save(null, {method: 'insert'}).then(function(token) {
    return mailService.userVerification(user, token, registration).catch(function(err) {
      throw messages.apiError('user.verification.errorSendingVerificationEmail', 'Error sending verification email to ' + user.get('email'));
    });
  });
}

exports.resendVerificationEmail = function(user) {
  return user.fetch().then(function(userFetched) {
    if(userFetched.get('verified') === 1) {
      throw messages.apiError('user.verification.emailAlreadyVerified', 'The user is already verified');
    }
    return $.sendVerificationEmail(userFetched);
  });
}

exports.listAllUsers = function() {
  return User.collection().fetch();
}

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
}

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
    if(userFan.id === user.id) {
      reject(messages.apiError('user.fan.canNotFanYourSelf', 'You can not fan yourself.'));
      return;
    }
    var fan = UserFan.forge({user_id: user.id, fan_id: userFan.id});
    fan.save().then(function(fan) {
      resolve(fan);
    }).catch(function(err) {
      if(err.code === 'ERR_DUP_ENTRY') {
        resolve(fan);
      } else {
        reject(err);
      }
    });
  });
}

exports.unfan = function(fan, user) {
  return new Promise(function(resolve, reject) {
    UserFan.forge({user_id: user.id, fan_id: fan.id}).fetch().then(function(fan) {
      if(!fan) {
        resolve();
      }  else {
        return fan.destroy().then(function() {
          resolve();
        });
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}