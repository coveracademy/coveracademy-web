'use strict';

var settings = require('../configs/settings'),
    request  = require('request'),
    mime     = require('mime'),
    path     = require('path'),
    fs       = require('fs'),
    Promise  = require('bluebird'),
    _        = require('underscore'),
    $        = this;

var usersPhotosPath = path.join(settings.publicPath, 'img/users/');
if(!fs.existsSync(usersPhotosPath)) {
  fs.mkdirSync(usersPhotosPath);
}

exports.extensions = {
  image: ['jpg', 'jpeg', 'png', 'gif']
}

exports.userPhotoFilename = function(user, extension) {
  return user.id + (extension ? extension : '');
}

exports.userPhotoFilePath = function(userPhotoFilename) {
  return path.join(usersPhotosPath, userPhotoFilename ? userPhotoFilename : '');
}

exports.downloadUserPhoto = function(uri, user, extensionsAccepted) {
  return new Promise(function(resolve, reject) {
    var photoFilename = $.userPhotoFilename(user);
    var photoPath = $.userPhotoFilePath();
    $.download(uri, photoPath, photoFilename, extensionsAccepted).then(function(filenameWithExtension) {
      user.set('image', filenameWithExtension);
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.download = function(uri, filePath, filename, extensionsAccepted) {
  return new Promise(function(resolve, reject) {
    request.head(uri, function(err, res, body) {
      if(err) {
        reject(err);
      } else {
        var extension = mime.extension(res.headers['content-type']);
        if(extensionsAccepted && !_.contains(extensionsAccepted, extension)) {
          reject(new Error('Extension ' + extension + ' is not accepted'));
        } else {
          var filenameWithExtension = filename + "." + extension;
          var pipe = request(uri).pipe(fs.createWriteStream(path.join(filePath, filenameWithExtension)));
          pipe.on('close', function() {
            resolve(filenameWithExtension);
          });
          pipe.on('error', reject);
        }
      }
    });
  });
}