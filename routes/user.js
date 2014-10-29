var userService     = require('../apis/userService'),
    mailService     = require('../apis/mailService'),
    apiErrors       = require('../apis/errors/apiErrors'),
    User            = require('../models/models').User,
    isAuthenticated = require('../utils/authorization').isAuthenticated;

module.exports = function(router, app) {

  router.get('/authenticated', function(req, res, next) {
    res.json(req.user);
  });

  router.post('/email', function(req, res, next) {
    var name = req.param('name');
    var email = req.param('email');
    var subject = req.param('subject');
    var message = req.param('message');
    mailService.sendEmail(name, email, subject, message).then(function() {
      res.send(200);
    }).catch(function(err) {
      console.log(err);
      apiErrors.formatResponse(err, res);
    });
  });

  router.post('/', isAuthenticated, function(req, res, next) {
    var user = req.param('user');
    userService.save(req.user, User.forge(user)).then(function() {
      res.send(200);
    }).catch(function(err) {
      console.log(err);
      apiErrors.formatResponse(err, res);
    });
  });

  app.use('/api/user', router);

}