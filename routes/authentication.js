'use strict';

var userService     = require('../apis/userService'),
    authorization   = require('../utils/authorization'),
    isAuthenticated = authorization.isAuthenticated;

module.exports = function(router, app, passport) {

  router.get('/logout', function(req, res) {
    req.logout();
    res.send(200);
  });

  router.get('/success', function(req, res) {
    res.render('/auth/auth-success.html');
  });

  router.get('/fail', function(req, res) {
    res.render('/auth/auth-fail.html', {message: req.flash('error')});
  });

  router.get('/facebook', passport.authenticate('facebook'));
  router.get('/facebook/callback', passport.authenticate('facebook', {successRedirect: '/api/auth/success', failureRedirect: '/api/auth/fail', failureFlash: true}));

  router.get('/twitter', passport.authenticate('twitter'));
  router.get('/twitter/callback', passport.authenticate('twitter', {successRedirect: '/api/auth/success', failureRedirect: '/api/auth/fail', failureFlash: true}));

  router.get('/google', passport.authenticate('google'));
  router.get('/google/callback', passport.authenticate('google', {successRedirect: '/api/auth/success', failureRedirect: '/api/auth/fail', failureFlash: true}));

  router.get('/soundcloud', passport.authenticate('soundcloud'));
  router.get('/soundcloud/callback', passport.authenticate('soundcloud', {successRedirect: '/api/auth/success', failureRedirect: '/api/auth/fail', failureFlash: true}));

  router.get('/youtube', passport.authenticate('youtube'));
  router.get('/youtube/callback', passport.authenticate('youtube', {successRedirect: '/api/auth/success', failureRedirect: '/api/auth/fail', failureFlash: true}));

  app.use('/api/auth', router);

}