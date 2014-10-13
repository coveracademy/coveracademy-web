var User       = require('../models/models').User,
    modelUtils = require('../utils/modelUtils'),
    Promise    = require('bluebird'),
    _          = require('underscore'),
    $          = this;

exports.createByFacebookAccount = function(name, gender, email, facebook_account) {
  return User.forge(modelUtils.filterAttributes('User', {name: name, gender: gender, email: email, facebook_account: facebook_account})).save();
}

exports.createByTwitterAccount = function(name, gender, email, twitter_account) {
  return User.forge(modelUtils.filterAttributes('User', {name: name, gender: gender, email: email, twitter_account: twitter_account})).save();
}

exports.createByGoogleAccount = function(name, gender, email, google_account) {
  return User.forge(modelUtils.filterAttributes('User', {name: name, gender: gender, email: email, google_account: google_account})).save();
}

exports.associateYoutubeAccount = function(google_account, youtube_account) {
  return new Promise(function(resolve, reject) {
    $.findByGoogleAccount(google_account, true).then(function(user) {
      user.set('youtube_account', youtube_account);
      return user.save();
    }).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      reject(new Error('Error associating Youtube account with Google Account'));
    });
  });
}

exports.update = function(user, attributes) {
  return user.save(user.pick(attributes), {patch: true});
}

exports.getUser = function(id) {
  return $.findById(id, true).then(function(user) {
    return user;
  }).catch(function(err) {
    return $.findByUsername(id);
  }).then(function(user) {
    return user;
  })
}

exports.findAll = function() {
  return User.forge().fetch();
}

exports.findById = function(id, required) {
  return User.forge({id: id}).fetch({require: required});
}

exports.findByFacebookAccount = function(facebook_account) {
  return User.forge({facebook_account: facebook_account}).fetch();
}

exports.findByTwitterAccount = function(twitter_account) {
  return User.forge({twitter_account: twitter_account}).fetch();
}

exports.findByGoogleAccount = function(google_account, required) {
  return User.forge({google_account: google_account}).fetch({require: required || false});
}

exports.findByEmail = function(email) {
  return User.forge({email: email}).fetch();
}

exports.findByUsername = function(username) {
  return User.forge({username: username}).fetch();
}