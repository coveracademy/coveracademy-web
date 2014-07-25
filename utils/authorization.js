var userService = require('../apis/userService');

exports.isAuthenticated = function (req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/home');
  }
}

exports.isNotAuthenticated = function (req, res, next) {
  if(!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/home');
  }
}