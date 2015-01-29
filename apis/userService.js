var User              = require('../models/models').User,
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

var userRelated = {withRelated: ['socialAccounts']};
var socialAccountRelated = {withRelated: ['user']};
var networksToConnect = ['facebook', 'youtube', 'twitter', 'google', 'soundcloud'];
var networksToDisconnect = ['youtube', 'twitter', 'google', 'soundcloud'];

exports.forge = function(userData) {
  return User.forge(userData);
}

exports.createTemporaryFacebookAccount = function(facebookAccount, facebookPicture, name, gender, email) {
  return $.forge({name: name, gender: gender, email: email, facebook_email: email, profile_picture: 'facebook', facebook_account: facebookAccount, facebook_picture: facebookPicture});
}

exports.connectNetwork = function(user, network, account, url, transaction) {
  return new Promise(function(resolve, reject) {
    if(!_.contains(networksToConnect, network)) {
      reject(messages.apiError('user.auth.unsupportedNetworkAssociation', 'Association with network ' + network + ' is not supported'));
    }
    var socialAccount = SocialAccount.forge({user_id: user.id, network: network, account: account, url: url});
    resolve(
      socialAccount.save(null, {transacting: transaction}).then(function(socialAccount) {
        if(!transaction) {
          return socialAccount.load(socialAccountRelated.withRelated).then(function(socialAccountLoaded) {
            return socialAccountLoaded.related('user');
          });
        } else {
          user.related('socialAccounts').add(socialAccount);
          return user;
        }
      })
    );
  });
}

exports.disconnectNetwork = function(user, network) {
  return new Promise(function(resolve, reject) {
    if(!_.contains(networksToDisconnect, network)) {
      reject(messages.apiError('user.auth.unsupportedNetworkDisassociation', 'Disassociation with network ' + network + ' is not supported'));
    }
    SocialAccount.forge({user_id: user.id, network: network}).fetch().then(function(socialAccount) {
      if(!socialAccount) {
        return null;
      }
      return socialAccount.destroy();
    }).then(function() {
      resolve();
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.showNetwork = function(user, network, show) {
  return new Promise(function(resolve, reject) {
    SocialAccount.forge({user_id: user.id, network: network}).fetch().then(function(socialAccount) {
      return socialAccount.save({show: show === true ? 1 : 0}, {patch: true});
    }).then(function(socialAccount) {
      resolve();
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.isConnectedWithNetwork = function(user, network) {
  return new Promise(function(resolve, reject) {
    if(!user) {
      resolve(false);
      return;
    }
    resolve(SocialAccount.forge({user_id: user.id, network: network}).fetch().then(function(socialAccount) {
      return socialAccount ? true : false;
    }));
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

    Bookshelf.transaction(function(transaction) {
      return user.save(null, {transacting: transaction}).then(function(userSaved) {
        return $.connectNetwork(userSaved, 'facebook', userData.facebook_account, null, transaction);
      }).then(function(userConnected) {
        return userConnected;
      });
    }).then(function(userConnected) {
      resolve(userConnected);
      if(userConnected.get('verified') === 0) {
        $.sendVerificationEmail(userConnected, true).catch(function(err) {
          logger.error('Error sending "user verification" email to user %d: ' + err, userConnected.id);
        });
      } else {
        mailService.userRegistration(userConnected).catch(function(err) {
          logger.error('Error sending "user registration" email to user %d: ' + err, userConnected.id);
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
    if(user.permission === 'admin' || user.id === edited.id) {
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
              logger.error('Error sending "user verification" email to user %d: ' + err, userEdited.id);
            });
          }
        }).catch(function(err) {
          reject(messages.unexpectedError('Error editing user', err));
        });
      }).catch(function(err) {
        reject(messages.unexpectedError('Error editing user', err));
      });
    } else {
      reject(messages.apiError('user.edit.noPermission', 'The user informations cannot be edited because has no permission'));
    }
  });
}

exports.findById = function(id, relations) {
  return $.forge({id: id}).fetch(relations === false ? null : userRelated);
}

exports.findByFacebookAccount = function(facebookAccount) {
  return $.forge({facebook_account: facebookAccount}).fetch(userRelated);
}

exports.findByEmail = function(email) {
  return $.forge({email: email}).fetch(userRelated);
}

exports.findByUsername = function(username) {
  return $.forge({username: username}).fetch(userRelated);
}

exports.findBySocialAccount = function(network, account) {
  return SocialAccount.forge({network: network, account: account}).fetch(socialAccountRelated).then(function(socialAccount) {
    if(!socialAccount) {
      return null;
    } else {
      return socialAccount.related('user');
    }
  });
}

exports.verifyEmail = function(token) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      return VerificationToken.forge({token: token}).fetch({withRelated: ['user'], require: true}).then(function(activationToken) {
        this.user = activationToken.related('user');
        return activationToken.destroy({transacting: transaction});
      }).then(function() {
        this.user.set('verified', 1);
        return this.user.save({verified: this.user.get('verified')}, {patch: true, transacting: transaction});
      }).then(function(user) {
        return user;
      }).bind({});
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