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
      logger.debug('CustomDone.done: [err: ' + JSON.stringify(err) + ', obj: ' + JSON.stringify(obj) + ']');
      if(err) {
        logger.debug('CustomDone.done: with error')
        originalDone(null, false, {message: messages.getErrorKey(err)});
      } else {
        logger.debug('CustomDone.done: without error')
        originalDone(null, obj);
      }
    };
  }

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    logger.debug('passport.serializeUser: [user: ' + JSON.stringify(user) + ']');
    if(user.id) {
      logger.debug('passport.serializeUser: user have id');
      done(null, user.id);
    } else {
      logger.debug('passport.serializeUser: user do not have id');
      done(null, user);
    }
  });

  passport.deserializeUser(function(user, done) {
    logger.debug('passport.deserializeUser: [user: ' + JSON.stringify(user) + ']');
    if(_.isObject(user)) {
      logger.debug('passport.deserializeUser: user is object');
      done(null, user);
    } else {
      logger.debug('passport.deserializeUser: user is not object');
      userService.findById(user).then(function(userFound) {
        if(userFound) {
          return userFound;
        }
        logger.debug('passport.deserializeUser: user with id ' + user + ' was not found');
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
        // return userService.createTemporaryFacebookAccount(profileInfos.id, profileInfos.name, profileInfos.gender, profileInfos.email);
        return userService.create({facebook_account: profileInfos.id, name: profileInfos.name, gender: profileInfos.gender, email: profileInfos.email, profile_picture: 'facebook'});
      }
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new YoutubeStrategy(settings.youtube, function(accessToken, refreshToken, profile, done) {
    var account = profile._json.items[0];
    new CustomDone(done).done(null, userService.createTemporaryYouTubeAccount(account.id, account.snippet.title));
  }));

}