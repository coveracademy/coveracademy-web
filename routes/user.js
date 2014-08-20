var userService     = require('../apis/userService'),
    isAuthenticated = require('../utils/authorization').isAuthenticated;

module.exports = function(router, app) {

  // AUTHENTICATED ROUTES
  router.get('/authenticated', isAuthenticated, function(req, res, next) {
    res.json(req.user);
  });

  app.use('/api/user', router);

}