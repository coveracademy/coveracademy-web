'use strict';

var settings  = require('../configs/settings'),
    Promise   = require('bluebird'),
    bcrypt    = require('bcrypt'),
    crypto    = require('crypto'),
    algorithm = 'aes-256-ctr';

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
};

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
};

exports.encrypt = function(text) {
  var cipher = crypto.createCipher(algorithm, settings.domain);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

exports.decrypt = function(text) {
  var decipher = crypto.createDecipher(algorithm, settings.domain);
  var decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};