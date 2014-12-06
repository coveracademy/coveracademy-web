var User         = require('../models/models').User,
    modelUtils   = require('../utils/modelUtils'),
    encryptUtils = require('../utils/encryptUtils'),
    slug         = require('../utils/slug'),
    mailService  = require('./mailService'),
    messages     = require('./messages'),
    Promise      = require('bluebird'),
    _            = require('underscore'),
    $            = this;

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
  return $.connectNetwork('twitter', twitterAccount);
}

exports.connectGoogleAccount = function(user, googleAccount) {
  return $.connectNetwork('google', googleAccount);
}

exports.connectYouTubeAccount = function(user, youTubeAccount) {
  return $.connectNetwork('youtube', youTubeAccount);
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
    var user = $.forge(modelUtils.filterAttributes(userData, 'UserCreationAttributes'));
    user.set('permission', 'user');
    if(!userData.facebook_email || user.get('email') === userData.facebook_email) {
      user.set('confirmed', 1);
    }
    user.save().then(function(userSaved) {
      resolve(userSaved);
      mailService.userRegistration(userSaved).catch(function(err) {
        console.log('Error sending "user registration" email to user ' + userSaved.id + ': ' + err.message);
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
          edited.set('confirmed', 0);
        }
        edited.save(edited.pick(modelUtils.modelsAttributes.UserEditableAttributes), {patch: true}).then(function(userEdited) {
          resolve(userEdited);
          if(userEdited.get('confirmed') === 0) {
            mailService.userConfirmation(userEdited).catch(function(err) {
              console.log('Error sending "user confirmation" email to user ' + userEdited.id + ': ' + err.message);
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