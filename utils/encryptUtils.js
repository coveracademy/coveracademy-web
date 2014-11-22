var Promise = require('bluebird'),
    bcrypt  = require('bcrypt');

exports.hashPassword = function(password) {
  return new Promise(function(resolve, reject) {
    bcrypt.hash(password, 10, function(err, hash) {
      if(err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

exports.comparePassword = function(password, hash) {
  return new Promise(function(resolve, reject) {
    bcrypt.compare(password, hash, function(err, equals) {
      if(err) {
        reject(err);
      } else {
        resolve(equals);
      }
    });
  });
}