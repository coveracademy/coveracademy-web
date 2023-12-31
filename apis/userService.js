'use strict';

var models            = require('../models'),
    entities          = require('../utils/entities'),
    slug              = require('../utils/slug'),
    encrypt           = require('../utils/encrypt'),
    logger            = require('../configs/logger'),
    mailService       = require('./internal/mailService'),
    messages          = require('./internal/messages'),
    ValidationError   = require('bookshelf-filteration').ValidationError,
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

exports.create = function(facebookAccount, name, email, gender) {
  return new Promise(function(resolve, reject) {
    var user = User.forge();
    user.set('facebook_account', facebookAccount);
    user.set('name', name);
    user.set('email', email);
    user.set('gender', gender);
    user.set('permission', 'user');
    if(user.get('email')) {
      user.set('verified', 1);
    } else {
      user.set('verified', 0);
    }
    user.save(null, {scenario: 'creation'}).then(function(user) {
      return $.connectNetwork(user, 'facebook', facebookAccount, null);
    }).then(function(user) {
      mailService.userRegistration(user).catch(function(err) {
        logger.error('Error sending "user registration" email to user %d.', user.id, err);
      });
      resolve(user);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(ValidationError, function(err) {
      reject(messages.validationError('user.new', err));
    }).catch(function(err) {
      reject(messages.unexpectedError('user.new.error', 'Error creating user account', err));
    });
  });
};

exports.update = function(user, edited) {
  return new Promise(function(resolve, reject) {
    Promise.all([$.findById(user.id), $.findById(edited.id)]).spread(function(userFetched, editedFetched) {
      if(userFetched.id !== editedFetched.id && userFetched.get('permission') !== 'admin') {
        throw messages.apiError('user.update.noPermission', 'The user account cannot be updated because user has no permission');
      }
      return editedFetched;
    }).then(function(editedFetched) {
      if(editedFetched.get('username') && editedFetched.get('username') !== edited.get('username')) {
        throw messages.apiError('user.update.username.cannotEditAnymore', 'The user can not update username anymore');
      }
      if(edited.get('email') && edited.get('email') !== editedFetched.get('email')) {
        edited.set('verified', 0);
      }
      return edited.save(null, {scenario: 'edition'});
    }).then(function(userEdited) {
      if(userEdited.get('verified') === 0) {
        mailService.userVerification(user).catch(function(err) {
          logger.error('Error sending "user verification" email to user %d.', userEdited.id, err);
        });
      }
      resolve(userEdited);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(ValidationError, function(err) {
      reject(messages.validationError('user.update', err));
    }).catch(function(err) {
      if(messages.isDupEntryError(err)) {
        reject(messages.apiError('user.update.emailOrUsernameAlreadyExists', 'Already exists an user with the email or username', err));
      } else {
        reject(messages.unexpectedError('user.update.error', 'Error updating user account', err));
      }
    });
  });
};

exports.connectNetwork = function(user, network, account, picture, url) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      var accountAttribute = getAccountAttribute(network);
      if(!accountAttribute) {
        throw messages.apiError('user.connectNetwork.unsupportedNetwork', 'Connection with this network is not supported');
      }
      var updatedAttributes = {};
      updatedAttributes[accountAttribute] = account;
      var pictureAttribute = getPictureAttribute(network);
      if(pictureAttribute) {
        updatedAttributes[pictureAttribute] = picture
      }
      if(!user.get('profile_picture')) {
        updatedAttributes['profile_picture'] = 'facebook'
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
      reject(messages.unexpectedError('user.connectNetwork.error', 'Error connecting user with network', err));
    });
  });
};

exports.disconnectNetwork = function(user, network) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      if(!_.contains(networksToDisconnect, network)) {
        throw messages.apiError('user.disconnectNetwork.unsupportedNetwork', 'Disconnection with this network is not supported');
      }
      var updatedAttributes = {}
      var accountAttribute = getAccountAttribute(network);
      updatedAttributes[accountAttribute] = null;
      var pictureAttribute = getPictureAttribute(network);
      if(pictureAttribute) {
        updatedAttributes[pictureAttribute] = null;
      }
      if(user.get('profile_picture') === network) {
        updatedAttributes['profile_picture'] = 'facebook';
      }
      return user.save(updatedAttributes, {patch: true, transacting: transaction}).then(function(user) {
        return SocialAccount.where({user_id: user.id, network: network}).destroy({transacting: transaction});
      });
    }).then(function() {
      resolve(user);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      reject(messages.unexpectedError('user.disconnectNetwork.error', 'Error disconnecting user of network', err));
    });
  });
};

exports.showNetwork = function(user, network, show) {
  return new Promise(function(resolve, reject) {
    if(!_.contains(networksToConnect, network)) {
      reject(messages.apiError('user.showNetwork.unsupportedNetwork', 'This network is not supported'));
      return;
    }
    SocialAccount.forge({user_id: user.id, network: network}).fetch({require: true}).then(function(socialAccount) {
      return socialAccount.save({show_link: show === true ? 1 : 0}, {patch: true});
    }).then(function(socialAccount) {
      resolve(socialAccount);
    }).catch(NotFoundError, function(err) {
      reject(messages.notFoundError('user.showNetwork.userNotConnected', 'The user is not connected to this network', err));
    }).catch(function(err) {
      reject(messages.unexpectedError('user.showNetwork.error', 'Error setting network to show user link', err));
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
    reject(messages.apiError('user.find.unsupportedNetwork', 'This network is not supported'));
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
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      reject(messages.unexpectedError('user.disableEmails.error', 'Error disabling periodic emails', err));
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
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      reject(messages.unexpectedError('user.verifyEmail.error', 'Error verifying email', err));
    });
  });
};

exports.resendVerificationEmail = function(user) {
  return new Promise(function(resolve, reject) {
    $.findById(user.id).then(function(user) {
      if(user.get('verified') === 1) {
        throw messages.apiError('user.verification.emailAlreadyVerified', 'The user is already verified');
      }
      return mailService.userVerification(user);
    }).then(function() {
      resolve();
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      reject(messages.unexpectedError('user.verification.errorSendingEmail', 'Error sending verification email', err));
    });
  });
};

exports.listUsers = function() {
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

exports.fan = function(fan, user) {
  return new Promise(function(resolve, reject) {
    Promise.resolve().bind({}).then(function() {
      if(fan.id === user.id) {
        throw messages.apiError('user.fan.canNotFanYourself', 'You can not fan yourself');
      }
      var userFan = UserFan.forge({user_id: user.id, fan_id: fan.id});
      this.userFan = userFan;
      return userFan.save();
    }).then(function(userFan) {
      resolve(userFan);
    }).catch(messages.APIError, function(err) {
      reject(err);
    }).catch(function(err) {
      if(messages.isDupEntryError(err) === true) {
        resolve(this.userFan);
      } else {
        reject(messages.unexpectedError('user.fan.error', 'Error adding user as a fan', err));
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