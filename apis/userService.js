var User         = require('../models/models').User,
    modelUtils   = require('../utils/modelUtils'),
    encryptUtils = require('../utils/encryptUtils'),
    messages     = require('./messages'),
    Promise      = require('bluebird'),
    _            = require('underscore'),
    $            = this;

exports.forge = function(userData) {
  return User.forge(userData);
}

exports.createTemporaryFacebookAccount = function(facebookAccount, name, gender) {
  return $.forge({permission: 'user', name: name, gender: gender, primary_network: 'facebook', facebook_account: facebookAccount});
}

exports.createTemporaryTwitterAccount = function(twitterAccount, name, gender, picture) {
  return $.forge({permission: 'user', name: name, gender: gender, primary_network: 'twitter', twitter_account: twitterAccount, twitter_picture: picture});
}

exports.createTemporaryGoogleAccount = function(googleAccount, name, gender, picture) {
  return $.forge({permission: 'user', name: name, gender: gender, primary_network: 'google', google_account: googleAccount, google_picture: picture});
}

exports.createTemporaryYouTubeAccount = function(youTubeAccount, name) {
  return $.forge({permission: 'user', name: name, youtube_account: youTubeAccount});
}

exports.connectNetwork = function(email, password, user, networkType, networkAccount) {
  return new Promise(function(resolve, reject) {
    var association = null;
    if(networkType === 'facebook') {
      association = {facebook_account: networkAccount};
    } else if(networkType === 'twitter') {
      association = {twitter_account: networkAccount};
    } else if(networkType === 'google') {
      association = {google_account: networkAccount};
    }
    if(association) {
      $.authenticate(email, password).then(function(userAuthenticated) {
        if(userAuthenticated) {
          resolve(user.save(association, {patch: true}));
        } else {
          reject(messages.apiError('user.auth.accountNotFound', 'Account with email ' + email + ' and password was not found'));
        }
      }).catch(function(err) {
        reject(messages.apiError('user.auth.errorAuthenticating', 'Error authenticating user with email ' + email));
      });
    } else {
      reject(messages.apiError('user.auth.unsupportedNetworkAssociation', 'Association with network ' + networkType + ' is not supported'));
    }
  });
}

exports.connectFacebookAccount = function(email, password, user, facebookAccount) {
  return $.connectNetwork('facebook', facebookAccount);
}

exports.connectTwitterAccount = function(email, password, user, twitterAccount) {
  return $.connectNetwork('twitter', twitterAccount);
}

exports.connectGoogleAccount = function(email, password, user, googleAccount) {
  return $.connectNetwork('google', googleAccount);
}

exports.connectYouTubeAccount = function(user, youTubeAccount) {
  user.set('youtube_account', youTubeAccount);
  return user.save();
}

exports.authenticate = function(email, password) {
  return new Promise(function(resolve, reject) {
    $.forge({email: email}).fetch().then(function(user) {
      encryptUtils.comparePassword(password, user.get('password')).then(function(equals) {
        resolve(equals ? user : null);
      });
    }).catch(function(err) {
      reject(messages.unexpectedError('Error authenticating user', err));
    });
  });
}

exports.create = function(userData) {
  return new Promise(function(resolve, reject) {
    if(!userData.email) {
      reject(messages.apiError('user.auth.emailRequired', 'The email is required'));
    } else if(!userData.password || userData.password.length < 6) {
      reject(messages.apiError('user.auth.passwordWithFewerCharacters', 'The password must contains at least 6 characteres'));
    } else {
      var user = $.forge(modelUtils.filterAttributes(userData, 'UserCreationAttributes'));
      encryptUtils.hashPassword(user.get('password')).then(function(hash) {
        user.set('password', hash);
        resolve(user.save());
      }).catch(function(err) {
        reject(messages.apiError('user.auth.errorCreatingAccount', 'Unexpected error creating account'));
      });
    }
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
      edited.save(edited.pick(modelUtils.modelsAttributes.UserEditableAttributes), {patch: true}).then(function(userEdited) {
        resolve(userEdited);
      }).catch(function(err) {
        reject(err);
      });
    } else {
      reject(messages.apiError('user.edit.noPermission', 'The user informations cannot be edited because has no permission'));
    }
  });
}

exports.getUser = function(id) {
  return $.findById(id, true).then(function(user) {
    return user;
  }).catch(function(err) {
    return $.findByUsername(id);
  }).then(function(user) {
    return user;
  });
}

exports.findById = function(id, required) {
  return $.forge({id: id}).fetch({require: required});
}

exports.findByFacebookAccount = function(facebookAccount) {
  return $.forge({facebook_account: facebookAccount}).fetch();
}

exports.findByTwitterAccount = function(twitterAccount) {
  return $.forge({twitter_account: twitterAccount}).fetch();
}

exports.findByGoogleAccount = function(googleAccount, required) {
  return $.forge({google_account: googleAccount}).fetch({require: required || false});
}

exports.findByEmail = function(email) {
  return $.forge({email: email}).fetch();
}

exports.findByUsername = function(username) {
  return $.forge({username: username}).fetch();
}