var userService = require('../apis/userService');

exports.isAdmin = function (req, res, next) {
  console.log(req.user)
  if(req.isAuthenticated() && req.user.get('permission') === 'admin') {
    next();
  } else {
    res.send(401);
  }
}

exports.isUser = function (req, res, next) {
  if(req.isAuthenticated() && req.user.get('permission') === 'user') {
    next();
  } else {
    res.send(401);
  }
}

exports.isAuthenticated = function (req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.send(401);
  }
}

exports.isAnonymous = function (req, res, next) {
  if(!req.isAuthenticated()) {
    next();
  } else {
    res.send(401);
  }
}