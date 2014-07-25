var authorization = require('../utils/authorization')

module.exports = function(router, app, passport) {

  router.get('/logout', authorization.isAuthenticated, function(req, res) {
    req.logout();
    res.redirect('/index');
  });

  router.get('/success', function(req, res) {
    res.render('/auth/auth-success.html');
  });

  router.get('/fail', function(req, res) {
    res.render('/auth/auth-fail.html');
  });

  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  router.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/auth/success', failureRedirect: '/auth/fail' }));

  router.get('/twitter', passport.authenticate('twitter'));
  router.get('/twitter/callback', passport.authenticate('twitter', { successRedirect: '/auth/success', failureRedirect: '/auth/fail' }));

  router.get('/google', passport.authenticate('google', { scope: ['email'] }));
  router.get('/google/callback', passport.authenticate('google', { successRedirect: '/auth/success', failureRedirect: '/auth/fail' }));

  app.use('/auth', router);

}