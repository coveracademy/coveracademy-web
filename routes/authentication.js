var userService     = require('../apis/userService'),
    authorization   = require('../utils/authorization'),
    isAuthenticated = authorization.isAuthenticated;

module.exports = function(router, app, passport) {

  router.get('/logout', function(req, res) {
    req.logout();
    res.send(200);
  });

  router.get('/success', function(req, res) {
    if(req.user && !req.user.id) {
      authorization.setTemporaryUser(req, req.user);
      req.logout();
      res.render('/auth/auth-must-register.html');
    } else {
      res.render('/auth/auth-success.html');
    }
  });

  router.get('/success/youtube', function(req, res) {
    var flashAuthenticatedUser = req.flash('authenticatedUser');
    var authenticatedUser = flashAuthenticatedUser && flashAuthenticatedUser.length > 0 ? flashAuthenticatedUser[0] : null;
    if(authenticatedUser) {
      userService.connectYouTubeAccount(userService.forge(authenticatedUser), req.user.youtube_account).then(function(user) {
        req.logout(user);
        req.logIn(user, function(err) {
          if(err) {
            console.log('Error authenticating user ' + user.id + ': ' + err);
          }
          res.render('/auth/auth-success.html');
        });
      });
    } else {
      res.render('/auth/auth-success.html');
    }
  });

  router.get('/fail', function(req, res) {
    res.render('/auth/auth-fail.html', {message: req.flash('error')});
  });

  var flashAuthenticatedUser = function(req, res, next) {
    req.flash('authenticatedUser', req.user);
    next();
  }

  router.get('/facebook', passport.authenticate('facebook'));
  router.get('/facebook/callback', passport.authenticate('facebook', {successRedirect: '/api/auth/success', failureRedirect: '/api/auth/fail', failureFlash: true}));

  router.get('/twitter', passport.authenticate('twitter'));
  router.get('/twitter/callback', passport.authenticate('twitter', {successRedirect: '/api/auth/success', failureRedirect: '/api/auth/fail', failureFlash: true}));

  router.get('/google', passport.authenticate('google'));
  router.get('/google/callback', passport.authenticate('google', {successRedirect: '/api/auth/success', failureRedirect: '/api/auth/fail', failureFlash: true}));

  router.get('/youtube', [isAuthenticated, flashAuthenticatedUser], passport.authenticate('youtube'));
  router.get('/youtube/callback', passport.authenticate('youtube', {successRedirect: '/api/auth/success/youtube', failureRedirect: '/api/auth/fail', failureFlash: true}));

  app.use('/api/auth', router);

}