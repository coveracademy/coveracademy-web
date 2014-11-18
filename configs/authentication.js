var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy,
    YoutubeStrategy  = require('passport-youtube-v3').Strategy,
    // FacebookStrategy = require('passport-facebook').Strategy,
    // TwitterStrategy  = require('passport-twitter').Strategy,
    userService      = require('../apis/userService'),
    mailService      = require('../apis/mailService'),
    fileUtils        = require('../utils/fileUtils'),
    settings         = require('./settings'),
    messages         = require('../apis/messages');

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
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    userService.findById(id).then(function(user) {
      if(user) {
        return user;
      }
      throw messages.apiError('user.auth.errorDeserializingUserFromSession', 'Error deserializing user with id ' + id);
    }).nodeify(done);
  });

  // passport.use(new FacebookStrategy(settings.facebook, function(accessToken, refreshToken, profile, done) {
  //   var profileInfos = {
  //     id: profile.id,
  //     name: profile.displayName,
  //     gender: profile.gender,
  //     email: profile.emails[0].value,
  //     picture: profile.photos[0].value
  //   };
  //   userService.findByFacebookAccount(profileInfos.id).then(function(user) {
  //     if(user) {
  //       return user;
  //     }
  //     return userService.findByEmail(profileInfos.email).then(function(user) {
  //       if(user) {
  //         user.set('facebook_account', profileInfos.id);
  //         return userService.update(user, ['facebook_account']).then(function(user) {
  //           return user;
  //         }).catch(function(err) {
  //           throw messages.apiError('user.auth.errorAssociatingAccountWithFacebook', 'Error associating existing account with Facebook');
  //         });
  //       } else {
  //         return userService.createByFacebookAccount(profileInfos.name, profileInfos.gender, profileInfos.email, profileInfos.id).then(function(user) {
  //           mailService.userRegistration(user).catch(function(err) {
  //             console.log('Error sending "user registration" email to user ' + user.id);
  //           });
  //           return fileUtils.downloadUserPhoto(profileInfos.picture, user);
  //         }).then(function(user) {
  //           return userService.update(user, ['image']);
  //         }).then(function(user) {
  //           return user;
  //         }).catch(function(err) {
  //           throw messages.apiError('user.auth.errorCreatingAccountAssociatedWithFacebook', 'Error creating account associated with Facebook');
  //         });
  //       }
  //     }).catch(function(err) {
  //       throw messages.apiError('user.auth.errorCreatingAccountAssociatedWithFacebook', 'Error creating account associated with Facebook');
  //     });
  //   }).nodeify(new CustomDone(done).done);
  // }));

  // passport.use(new TwitterStrategy(settings.twitter,
  //   function(accessToken, refreshToken, profile, done) {
  //     var profileInfos = {
  //       id: profile.id,
  //       email: null,
  //       name: profile.displayName,
  //       gender: null,
  //       picture: profile.photos[0].value
  //     };
  //     userService.findByTwitterAccount(profileInfos.id).then(function(user) {
  //       if(user) {
  //         return user;
  //       }
  //       return userService.createByTwitterAccount(profileInfos.name, profileInfos.gender, profileInfos.email, profileInfos.id).then(function(user) {
  //         return fileUtils.downloadUserPhoto(profileInfos.picture, user);
  //       }).then(function(user) {
  //         return userService.update(user, ['image']);
  //       }).then(function(user) {
  //         return user;
  //       }).catch(function(err) {
  //         throw messages.apiError('user.auth.errorCreatingAccountAssociatedWithTwitter', 'Error creating account associated with Twitter');
  //       });
  //     }).nodeify(new CustomDone(done).done);
  //   }
  // ));

  passport.use(new GoogleStrategy(settings.google, function(accessToken, refreshToken, profile, done) {
    var profileInfos = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      gender: profile._json.gender,
      picture: profile._json.picture
    };
    userService.findByGoogleAccount(profileInfos.id).then(function(user) {
      if(user) {
        return user;
      }
      return userService.findByEmail(profileInfos.email).then(function(user) {
        if(user) {
          user.set('google_account', profileInfos.id);
          return userService.update(user, ['google_account']).then(function(user) {
            return user;
          }).catch(function(err) {
            throw messages.apiError('user.auth.errorAssociatingAccountWithGoogle', 'Error associating existing account with Google');
          });
        } else {
          return userService.createByGoogleAccount(profileInfos.name, profileInfos.gender, profileInfos.email, profileInfos.id).then(function(user) {
            mailService.userRegistration(user).catch(function(err) {
              console.log('Error sending "user registration" email to user ' + user.id);
            });
            return fileUtils.downloadUserPhoto(profileInfos.picture, user);
          }).then(function(user) {
            return userService.update(user, ['image']);
          }).then(function(user) {
            return user;
          }).catch(function(err) {
            throw messages.apiError('user.auth.errorCreatingAccountAssociatedWithGoogle', 'Error creating account associated with Google');
          });
        }
      }).catch(function(err) {
        throw messages.apiError('user.auth.errorCreatingAccountAssociatedWithGoogle', 'Error creating account associated with Google');
      });
    }).nodeify(new CustomDone(done).done);
  }));

  passport.use(new YoutubeStrategy(settings.youtube, function(accessToken, refreshToken, profile, done) {
    var account = profile._json.items[0];
    var googleAccount = account.contentDetails.googlePlusUserId;
    var youtubeAccount = account.id;
    userService.associateYoutubeAccount(googleAccount, youtubeAccount).nodeify(new CustomDone(done).done);
  }));

}