var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy,
    YoutubeStrategy  = require('passport-youtube-v3').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy  = require('passport-twitter').Strategy,
    userService      = require('../apis/userService'),
    mailService      = require('../apis/mailService'),
    fileUtils        = require('../utils/fileUtils'),
    settings         = require('./settings'),
    messages         = require('../apis/messages'),
    _                = require('underscore');

exports.configure = function(app, passport) {

  var CustomDone = function(originalDone) {
    this.done = function(err, obj) {
      if(err) {
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
    userService.findByFacebookAccount(profileInfos.id).then(function(user) {
      if(user) {
        return user;
      } else {
        return userService.createTemporaryFacebookAccount(profileInfos.id, profileInfos.name, profileInfos.gender);
      }
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new TwitterStrategy(settings.twitter,
    function(accessToken, refreshToken, profile, done) {
      var profileInfos = {
        id: profile.id,
        email: null,
        name: profile.displayName,
        gender: null,
        picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value.replace('_normal', '') : null
      };
      userService.findByTwitterAccount(profileInfos.id).then(function(user) {
        if(user) {
          if(user.get('twitter_picture') !== profileInfos.picture) {
            user.set('twitter_picture', profileInfos.picture);
            return userService.save(user, ['twitter_picture']);
          } else {
            return user;
          }
        } else {
          return userService.createTemporaryTwitterAccount(profileInfos.id, profileInfos.name, profileInfos.gender, profileInfos.picture);
        }
      }).nodeify(new CustomDone(done).done);
    }
  ));

  passport.use(new GoogleStrategy(settings.google, function(accessToken, refreshToken, profile, done) {
    var profileInfos = {
      id: profile.id,
      email: profile.emails ? profile.emails[0].value : null,
      name: profile.displayName,
      gender: profile._json.gender,
      picture: profile._json.picture
    };
    userService.findByGoogleAccount(profileInfos.id).then(function(user) {
      if(user) {
        if(user.get('google_picture') !== profileInfos.picture) {
          user.set('google_picture', profileInfos.picture);
          return userService.save(user, ['google_picture']);
        } else {
          return user;
        }
      } else {
        return userService.createTemporaryGoogleAccount(profileInfos.id, profileInfos.name, profileInfos.gender, profileInfos.picture);
      }
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new YoutubeStrategy(settings.youtube, function(accessToken, refreshToken, profile, done) {
    var account = profile._json.items[0];
    new CustomDone(done).done(null, userService.createTemporaryYouTubeAccount(account.id, account.snippet.title));
  }));

}