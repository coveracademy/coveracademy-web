'use strict';

var userService     = require('../apis/userService'),
    mailService     = require('../apis/internal/mailService'),
    messages        = require('../apis/internal/messages'),
    constants       = require('../apis/internal/constants'),
    logger          = require('../configs/logger'),
    authorization   = require('../utils/authorization'),
    User            = require('../models').User,
    isAuthenticated = authorization.isAuthenticated,
    isTemporaryUser = authorization.isTemporaryUser;

module.exports = function(router, app) {

  router.get('/authenticated', function(req, res, next) {
    if(!req.user) {
      res.json(null);
    } else {
      userService.findById(req.user.id, true).then(function(user) {
        var newUser = req.flash('newUser');
        if(newUser.length > 0 && newUser[0] === true) {
          user.set('new', true);
        }
        res.json(user);
      }).catch(function(err) {
        logger.error(err);
        messages.respondWithError(err, res);
      });
    }
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
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/', isTemporaryUser, function(req, res, next) {
    var userData = req.param('user');
    userData.verifyEmail = true;
    userService.create(userData).then(function(user) {
      req.flash('newUser', true);
      return authorization.refreshUser(req, user);
    }).then(function(refreshedUser) {
      res.json(refreshedUser);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.put('/', isAuthenticated, function(req, res, next) {
    var user = req.param('user');
    userService.update(req.user, User.forge(user)).then(function(userSaved) {
      res.json(userSaved);
    }).catch(function(err) {
      logger.error(err);
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
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/verification', isAuthenticated, function(req, res, next) {
    var user = User.forge({id: req.param('user')});
    userService.resendVerificationEmail(user).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/disconnect', isAuthenticated, function(req, res, next) {
    var network = req.param('network');
    userService.disconnectNetwork(req.user, network).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/showNetwork', isAuthenticated, function(req, res, next) {
    var network = req.param('network');
    var show = req.param('show');
    userService.showNetwork(req.user, network, show).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/fan', isAuthenticated, function(req, res, next) {
    var user = User.forge({id: req.param('user')});
    userService.fan(req.user, user).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.delete('/fan', isAuthenticated, function(req, res, next) {
    var user = User.forge({id: req.param('user')});
    userService.unfan(req.user, user).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/isFan', isAuthenticated, function(req, res, next) {
    var user = User.forge({id: req.param('user')});
    userService.isFan(req.user, user).then(function(fan) {
      res.json(fan);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/fans/latest', function(req, res, next) {
    var user = User.forge({id: req.param('user')});
    var page = req.param('page') || constants.FIRST_PAGE;
    userService.latestFans(user, page, constants.NUMBER_OF_FANS_IN_PAGE).then(function(fans) {
      res.json(fans);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  app.use('/api/user', router);

}