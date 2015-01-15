var userService      = require('../apis/userService'),
    mailService      = require('../apis/mailService'),
    messages         = require('../apis/messages'),
    settings         = require('./settings'),
    logger           = require('./logger'),
    YoutubeStrategy  = require('passport-youtube-v3').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    _                = require('underscore');

exports.configure = function(app, passport) {
  logger.info('Configuring authentication');

  var CustomDone = function(originalDone) {
    this.done = function(err, obj) {
      if(err) {
        logger.error('Error authenticating user: [err: ' + JSON.stringify(err) + ', obj: ' + JSON.stringify(obj) + ']');
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
        if(profileInfos.email) {
          return userService.create({facebook_account: profileInfos.id, name: profileInfos.name, gender: profileInfos.gender, email: profileInfos.email, profile_picture: 'facebook'});
        } else {
          return userService.createTemporaryFacebookAccount(profileInfos.id, profileInfos.name, profileInfos.gender);
        }
      }
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new YoutubeStrategy(settings.youtube, function(accessToken, refreshToken, profile, done) {
    var account = profile._json.items[0];
    new CustomDone(done).done(null, userService.createTemporaryYouTubeAccount(account.id, account.snippet.title));
  }));

}