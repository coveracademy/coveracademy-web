"use strict"

var userService        = require('../apis/userService'),
    mailService        = require('../apis/mailService'),
    messages           = require('../apis/messages'),
    settings           = require('./settings'),
    logger             = require('./logger'),
    YoutubeStrategy    = require('passport-youtube-v3').Strategy,
    FacebookStrategy   = require('passport-facebook').Strategy,
    TwitterStrategy    = require('passport-twitter').Strategy,
    SoundCloudStrategy = require('passport-soundcloud').Strategy,
    GoogleStrategy     = require('passport-google-oauth').OAuth2Strategy,
    _                  = require('underscore');

exports.configure = function(app, passport) {
  logger.info('Configuring authentication');

  var CustomDone = function(originalDone) {
    this.done = function(err, obj) {
      if(err) {
        logger.error('Error authenticating user %j.', obj, err);
        originalDone(null, false, {message: messages.getErrorKey(err)});
      } else {
        originalDone(null, obj);
      }
    };
  }

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    if(user.id) {
      done(null, user.id);
    } else {
      done(null, user);
    }
  });

  passport.deserializeUser(function(user, done) {
    if(_.isObject(user)) {
      done(null, user);
    } else {
      userService.findById(user).then(function(userFound) {
        if(userFound) {
          return userFound;
        }
        throw messages.apiError('user.auth.errorDeserializingUserFromSession', 'Error deserializing user with id ' + user.id);
      }).nodeify(done);
    }
  });

  passport.use(new FacebookStrategy(settings.facebook, function(accessToken, refreshToken, profile, done) {
    var profileInfos = {
      id: profile.id,
      name: profile.displayName,
      gender: profile.gender,
      email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
      picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
    };
    userService.findBySocialAccount('facebook', profileInfos.id).then(function(user) {
      if(user) {
        return user;
      } else {
        if(profileInfos.email) {
          return userService.create({facebook_account: profileInfos.id, facebook_picture: null, name: profileInfos.name, gender: profileInfos.gender, email: profileInfos.email, profile_picture: 'facebook'});
        } else {
          return userService.createTemporaryFacebookAccount(profileInfos.id, profileInfos.picture, profileInfos.name, profileInfos.gender);
        }
      }
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new TwitterStrategy(_.extend(settings.twitter, {passReqToCallback: true}), function(req, accessToken, refreshToken, profile, done) {
    if(!req.user) {
      throw messages.apiError('user.connect.notAuthenticated', 'The user must be authenticated to connect with Twitter');
    }
    var profileInfos = {
      id: profile.id,
      url: profile.username,
      picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value.replace('_normal', '') : null
    };
    userService.findBySocialAccount('twitter', profileInfos.id).then(function(user) {
      if(user) {
        throw messages.apiError('user.connect.alreadyConnected', 'Was already exists an user connected with this Twitter account');
      }
      return userService.connectNetwork(req.user, 'twitter', profileInfos.id, profileInfos.picture, profileInfos.url);
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new GoogleStrategy(_.extend(settings.google, {passReqToCallback: true}), function(req, accessToken, refreshToken, profile, done) {
    if(!req.user) {
      throw messages.apiError('user.connect.notAuthenticated', 'The user must be authenticated to connect with Google');
    }
    var profileInfos = {
      id: profile.id,
      picture: profile._json.picture
    };
    userService.findBySocialAccount('google', profileInfos.id).then(function(user) {
      if(user) {
        throw messages.apiError('user.connect.alreadyConnected', 'Was already exists an user connected with this Google account');
      }
      return userService.connectNetwork(req.user, 'google', profileInfos.id, profileInfos.picture);
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new SoundCloudStrategy(_.extend(settings.soundcloud, {passReqToCallback: true}), function(req, accessToken, refreshToken, profile, done) {
    if(!req.user) {
      throw messages.apiError('user.connect.notAuthenticated', 'The user must be authenticated to connect with SoundCloud');
    }
    var profileInfos = {
      id: profile.id,
      url: profile._json.permalink
    };
    userService.findBySocialAccount('soundcloud', profileInfos.id).then(function(user) {
      if(user) {
        throw messages.apiError('user.connect.alreadyConnected', 'Was already exists an user connected with this SoundCloud account');
      }
      return userService.connectNetwork(req.user, 'soundcloud', profileInfos.id, null, profileInfos.url);
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new YoutubeStrategy(_.extend(settings.youtube, {passReqToCallback: true}), function(req, accessToken, refreshToken, profile, done) {
    if(!req.user) {
      throw messages.apiError('user.connect.notAuthenticated', 'The user must be authenticated to connect with YouTube');
    }
    var profileInfos = {
      id: profile._json.items[0].id,
    };
    userService.findBySocialAccount('youtube', profileInfos.id).then(function(user) {
      if(user) {
        throw messages.apiError('user.connect.alreadyConnected', 'Was already exists an user connected with this YouTube account');
      }
      return userService.connectNetwork(req.user, 'youtube', profileInfos.id);
    }).nodeify(new CustomDone(done).done);
  }));

}