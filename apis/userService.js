'use strict'

var models            = require('../models'),
    entities          = require('../utils/entities'),
    slug              = require('../utils/slug'),
    encrypt           = require('../utils/encrypt'),
    logger            = require('../configs/logger'),
    mailService       = require('./internal/mailService'),
    messages          = require('./internal/messages'),
    ValidationError   = require('bookshelf-filteration').ValidationError,
    uuid              = require('node-uuid'),
    moment            = require('moment'),
    Promise           = require('bluebird'),
    _                 = require('underscore'),
    User              = models.User,
    UserFan           = models.UserFan,
    SocialAccount     = models.SocialAccount,
    Bookshelf         = models.Bookshelf,
    NotFoundError     = Bookshelf.NotFoundError,
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
var getFindUserOptions = function(relations) {
  var options = {require: true};
  if(relations === true) {
    options = _.extend(options, userWithSocialAccountsRelated);
  }
  return options;
};

exports.createTemporaryFacebookAccount = function(facebookAccount, facebookPicture, name, gender) {
  var temporary = User.forge({
    name: name,
    gender: gender,
    profile_picture: 'facebook',
    facebook_account: facebookAccount,
    facebook_picture: facebookPicture
  });
  return temporary;
};

exports.create = function(data) {
  return new Promise(function(resolve, reject) {
    var user = User.forge(data);
    user.set('permission', 'user');
    user.set('verified', 1);
    if(data.verifyEmail === true) {
      user.set('verified', 0);
    }
    user.save(null, {scenario: 'creation'}).then(function(user) {
      return $.connectNetwork(user, 'facebook', data.facebook_account, data.facebook_picture);
    }).then(function(user) {
      if(user.get('verified') === 0) {
        mailService.userVerification(user, true).catch(function(err) {
          logger.error('Error sending "user verification" email to user %d.', user.id, err);
        });
      } else {
        mailService.userRegistration(user).catch(function(err) {
          logger.error('Error sending "user registration" email to user %d.', user.id, err);
        });
      }
      resolve(user);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(ValidationError, function(err) {
      reject(messages.validationError('user.new', err));
    }).catch(function(err) {
      reject(messages.unexpectedError('user.new.error', 'Error creating user account.', err));
    });
  });
};

exports.update = function(user, edited) {
  return new Promise(function(resolve, reject) {
    Promise.all([$.findById(user.id), $.findById(edited.id)]).spread(function(userFetched, editedFetched) {
      if(userFetched.id !== editedFetched.id && userFetched.get('permission') !== 'admin') {
        throw messages.apiError('user.update.noPermission', 'The user account cannot be updated because user has no permission.');
      }
      return editedFetched;
    }).then(function(editedFetched) {
      if(editedFetched.get('username') && editedFetched.get('username') !== edited.get('username')) {
        throw messages.apiError('user.update.username.cannotEditAnymore', 'The user can not update username anymore.');
      }
      if(edited.get('email') && edited.get('email') !== editedFetched.get('email')) {
        edited.set('verified', 0);
      }
      return edited.save(null, {scenario: 'edition'});
    }).then(function(userEdited) {
      if(userEdited.get('verified') === 0) {
        mailService.userVerification(user, false).catch(function(err) {
          logger.error('Error sending "user verification" email to user %d.', userEdited.id, err);
        });
      }
      resolve(userEdited);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(ValidationError, function(err) {
      reject(messages.validationError('user.update', err));
    }).catch(function(err) {
      reject(messages.unexpectedError('user.update.error', 'Error updating user account,', err));
    });
  });
};

exports.connectNetwork = function(user, network, account, picture, url) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      var accountAttribute = getAccountAttribute(network);
      if(!accountAttribute) {
        throw messages.apiError('user.connectNetwork.unsupportedNetwork', 'Connection with this network is not supported.');
      }
      var updatedAttributes = {};
      user.set(accountAttribute, account);
      updatedAttributes[accountAttribute] = user.get(accountAttribute);
      var pictureAttribute = getPictureAttribute(network);
      if(pictureAttribute) {
        user.set(pictureAttribute, picture);
        updatedAttributes[pictureAttribute] = user.get(pictureAttribute);
      }
      if(!user.get('profile_picture')) {
        user.set('profile_picture', 'facebook');
        updatedAttributes['profile_picture'] = user.get('profile_picture');
      }
      return user.save(updatedAttributes, {patch: true, transacting: transaction}).then(function(user) {
        var socialAccount = SocialAccount.forge({user_id: user.id, network: network, url: url, show_link: 0});
        return socialAccount.save(null, {transacting: transaction});
      });
    }).then(function(socialAccount) {
      user.related('socialAccounts').add(socialAccount);
      resolve(user);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      reject(messages.unexpectedError('user.connectNetwork.error', 'Error connecting user with network.', err));
    });
  });
};

exports.disconnectNetwork = function(user, network) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      if(!_.contains(networksToDisconnect, network)) {
        throw messages.apiError('user.disconnectNetwork.unsupportedNetwork', 'Disconnection with this network is not supported');
      }
      var accountAttribute = getAccountAttribute(network);
      var updatedAttributes = {}
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
      return user.save(updatedAttributes, {patch: true, transacting: transaction}).then(function(user) {
        return SocialAccount.where({user_id: user.id, network: network}).destroy({transacting: transaction});
      });
    }).then(function() {
      resolve(user);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      reject(messages.unexpectedError('user.disconnectNetwork.error', 'Error disconnecting user of network.', err));
    });
  });
};

exports.showNetwork = function(user, network, show) {
  return new Promise(function(resolve, reject) {
    if(!_.contains(networksToConnect, network)) {
      reject(messages.apiError('user.showNetwork.unsupportedNetwork', 'This network is not supported.'));
      return;
    }
    SocialAccount.forge({user_id: user.id, network: network}).fetch({require: true}).then(function(socialAccount) {
      return socialAccount.save({show_link: show === true ? 1 : 0}, {patch: true});
    }).then(function(socialAccount) {
      resolve(socialAccount);
    }).catch(NotFoundError, function(err) {
      reject(messages.notFoundError('user.showNetwork.userNotConnected', 'The user is not connected to this network', err));
    }).catch(function(err) {
      reject(messages.unexpectedError('user.showNetwork.error', 'Error setting network to show user link.', err));
    });
  });
};

exports.findById = function(id, relations) {
  return User.forge({id: id}).fetch(getFindUserOptions(relations)).catch(NotFoundError, function(err) {
    throw messages.notFoundError('user.notFound', 'User not found', err);
  });
};

exports.findByEmail = function(email, relations) {
  return User.forge({email: email}).fetch(getFindUserOptions(relations)).catch(NotFoundError, function(err) {
    throw messages.notFoundError('user.notFound', 'User not found', err);
  });
};

exports.findByUsername = function(username, relations) {
  return User.forge({username: username}).fetch(getFindUserOptions(relations)).catch(NotFoundError, function(err) {
    throw messages.notFoundError('user.notFound', 'User not found', err);
  });
};

exports.findBySocialAccount = function(network, account, relations) {
  if(!_.contains(networksToConnect, network)) {
    reject(messages.apiError('user.find.unsupportedNetwork', 'This network is not supported.'));
  }
  var accountAttribute = getAccountAttribute(network);
  if(accountAttribute) {
    var search = {};
    search[accountAttribute] = account;
    return User.forge(search).fetch(getFindUserOptions(relations)).catch(NotFoundError, function(err) {
      throw messages.notFoundError('user.notFound', 'User not found', err);
    });
  } else {
    return Promise.resolve();
  }
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

exports.verifyEmail = function(token) {
  return new Promise(function(resolve, reject) {
    var email = encrypt.decrypt(token);
    $.findByEmail(email).then(function(user) {
      return user.save({verified: 1}, {patch: true});
    }).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
};

exports.resendVerificationEmail = function(user) {
  return user.fetch().then(function(user) {
    if(user.get('verified') === 1) {
      throw messages.apiError('user.verification.emailAlreadyVerified', 'The user is already verified.');
    }
    return mailService.userVerification(user, false).catch(function(err) {
      throw messages.unexpectedError('user.verification.errorSendingEmail', 'Error sending verification email.', err);
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
};

exports.fan = function(userFan, user) {
  return new Promise(function(resolve, reject) {
    Promise.resolve().bind({}).then(function() {
      if(userFan.id === user.id) {
        throw messages.apiError('user.fan.canNotFanYourself', 'You can not fan yourself.');
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
        reject(messages.unexpectedError('user.fan.error', 'Error adding user as a fan.', err));
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