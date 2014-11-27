var userService     = require('../apis/userService'),
    mailService     = require('../apis/mailService'),
    messages        = require('../apis/messages'),
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
    mailService.receive(name, email, subject, message).then(function() {
      res.send(200);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/connect', isAuthenticated, function(req, res, next) {
    var email = req.param('email');
    var password = req.param('password');
    var user = User.forge({id: req.param('user')});
    var networkType = req.param('network_type');
    var networkAccount = req.param('network_account');

    userService.connectNetwork(email, password, user, networkType, networkAccount).then(function(userAssociated) {
      req.logout();
      req.logIn(userAssociated, function(err) {
        if(err) {
          throw err;
        }
        res.json(userAssociated);
      });
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/', isAuthenticated, function(req, res, next) {
    var userData = req.param('user');
    userService.create(userData).then(function(user) {
      req.logout();
      req.logIn(user, function(err) {
        if(err) {
          throw err;
        }
        res.json(user);
      });
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