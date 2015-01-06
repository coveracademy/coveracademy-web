var User              = require('../models/models').User,
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

exports.forge = function(userData) {
  return User.forge(userData);
}

exports.createTemporaryFacebookAccount = function(facebookAccount, name, gender, email) {
  return $.forge({name: name, gender: gender, email: email, facebook_email: email, profile_picture: 'facebook', facebook_account: facebookAccount});
}

exports.createTemporaryTwitterAccount = function(twitterAccount, picture) {
  return $.forge({twitter_account: twitterAccount, twitter_picture: picture});
}

exports.createTemporaryGoogleAccount = function(googleAccount, picture) {
  return $.forge({google_account: googleAccount, google_picture: picture});
}

exports.createTemporaryYouTubeAccount = function(youTubeAccount) {
  return $.forge({youtube_account: youTubeAccount});
}

exports.connectNetwork = function(user, networkType, networkAccount) {
  return new Promise(function(resolve, reject) {
    var association = null;
    if(networkType === 'twitter') {
      association = {twitter_account: networkAccount};
    } else if(networkType === 'google') {
      association = {google_account: networkAccount};
    } else if(networkType === 'youtube') {
      association = {youtube_account: networkAccount};
    }
    if(association) {
      resolve(user.save(association, {patch: true}));
    } else {
      reject(messages.apiError('user.auth.unsupportedNetworkAssociation', 'Association with network ' + networkType + ' is not supported'));
    }
  });
}

exports.connectTwitterAccount = function(user, twitterAccount) {
  return $.connectNetwork(user, 'twitter', twitterAccount);
}

exports.connectGoogleAccount = function(user, googleAccount) {
  return $.connectNetwork(user, 'google', googleAccount);
}

exports.connectYouTubeAccount = function(user, youTubeAccount) {
  return $.connectNetwork(user, 'youtube', youTubeAccount);
}

exports.create = function(userData) {
  return new Promise(function(resolve, reject) {
    if(!userData.email || userData.email.trim().length === 0) {
      reject(messages.apiError('user.auth.emailRequired', 'The email is required'));
      return;
    }
    if(userData.username && !slug.isValidUsername(userData)) {
      reject(messages.apiError('user.edit.invalidUsername', 'The username is invalid'));
      return;
    }
    var user = $.forge(entities.filterAttributes(userData, 'UserCreationAttributes'));
    user.set('permission', 'user');
    if(!userData.facebook_email || user.get('email') === userData.facebook_email) {
      user.set('verified', 1);
    }
    user.save().then(function(userSaved) {
      resolve(userSaved);
      mailService.userRegistration(userSaved).catch(function(err) {
        logger.error('Error sending "user registration" email to user %d: ' + err, userSaved.id);
      });
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

exports.findById = function(id) {
  return $.forge({id: id}).fetch();
}

exports.findByFacebookAccount = function(facebookAccount) {
  return $.forge({facebook_account: facebookAccount}).fetch();
}

exports.findByTwitterAccount = function(twitterAccount) {
  return $.forge({twitter_account: twitterAccount}).fetch();
}

exports.findByGoogleAccount = function(googleAccount) {
  return $.forge({google_account: googleAccount}).fetch();
}

exports.findByEmail = function(email) {
  return $.forge({email: email}).fetch();
}

exports.findByUsername = function(username) {
  return $.forge({username: username}).fetch();
}

exports.verifyEmail = function(token) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      return VerificationToken.forge({token: token}).fetch({withRelated: ['user'], require: true}).then(function(activationToken) {
        this.user = activationToken.related('user');
        return activationToken.destroy({transacting: transaction});
      }).then(function() {
        this.user.set('verified', 1);
        return this.user.save(null, {transacting: transaction});
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

exports.sendVerificationEmail = function(user) {
  return VerificationToken.forge({user_id: user.id, token: uuid.v1(), expiration_date: moment().add(7, 'days').toDate()}).save(null, {method: 'insert'}).then(function(token) {
    return mailService.userVerification(user, token).catch(function(err) {
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