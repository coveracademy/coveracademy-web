'use strict';

var settings = require('../../configs/settings'),
    Promise  = require('bluebird'),
    request  = require('request');

var oembedApiKey = settings.oembedApiKey;
var prefixURL = 'https://iframe.ly/api/iframely?api_key=' + oembedApiKey + '&url=';

exports.get = function(uri) {
  return new Promise(function(resolve, reject) {
    request.get({url: prefixURL + uri, json: true, encoding: 'utf8'}, function(err, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
}