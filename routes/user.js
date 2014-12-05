var userService     = require('../apis/userService'),
    mailService     = require('../apis/mailService'),
    messages        = require('../apis/messages'),
    User            = require('../models/models').User,
    authorization   = require('../utils/authorization'),
    isAuthenticated = authorization.isAuthenticated,
    isTemporaryUser = authorization.isTemporaryUser;

module.exports = function(router, app) {

  router.get('/authenticated', function(req, res, next) {
    res.json(req.user);
  });

  router.get('/temporary', function(req, res, next) {
    res.json(authorization.getTemporaryUser(req));
  });

  router.post('/email', function(req, res, next) {
    var name = req.param('name');
    var email = req.param('email');
    var subject = req.param('subject');
    var message = req.param('message');
    mailService.receive(name, email, subject, message).then(function() {
      res.send(200);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/connect', isAuthenticated, function(req, res, next) {
    userService.connectNetwork(req.user, networkType, networkAccount).then(function(userAssociated) {
      return authorization.refreshUser(req, userAssociated);
    }).then(function(refreshedUser) {
      res.json(refreshedUser);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/', isTemporaryUser, function(req, res, next) {
    var userData = req.param('user');
    userService.create(userData).then(function(user) {
      return authorization.refreshUser(req, user);
    }).then(function(refreshedUser) {
      res.json(refreshedUser);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.put('/', isAuthenticated, function(req, res, next) {
    var user = req.param('user');
    userService.update(req.user, User.forge(user)).then(function(userSaved) {
      res.json(userSaved);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/', function(req, res, next) {
    var query = req.param('id');
    var queryPromise = userService.getUser;
    if(!query) {
      query = req.param('email');
      queryPromise = userService.findByEmail;
    }
    queryPromise(query).then(function(user) {
      res.json(user);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  app.use('/api/user', router);

}