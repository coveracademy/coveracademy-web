var Promise = require('bluebird');

exports.isAdmin = function(req, res, next) {
  console.log(req.user)
  if(req.isAuthenticated() && req.user.get('permission') === 'admin') {
    next();
  } else {
    res.send(401);
  }
}

exports.isUser = function(req, res, next) {
  if(req.isAuthenticated() && req.user.get('permission') === 'user') {
    next();
  } else {
    res.send(401);
  }
}

exports.isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.send(401);
  }
}

exports.isAnonymous = function(req, res, next) {
  if(!req.isAuthenticated()) {
    next();
  } else {
    res.send(401);
  }
}

exports.isTemporaryUser = function(req, res, next) {
  if(req.session.temporaryUser) {
    next();
  } else {
    res.send(401);
  }
}

exports.setTemporaryUser = function(req, user) {
  req.session.temporaryUser = user;
}

exports.getTemporaryUser = function(req) {
  return req.session.temporaryUser;
}

exports.refreshUser = function(req, user) {
  return new Promise(function(resolve, reject) {
    req.logout();
    req.logIn(user, function(err) {
      if(err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}