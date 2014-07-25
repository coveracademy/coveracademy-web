var settings = require('../configs/settings'),
    request  = require('request'),
    mime     = require('mime'),
    path     = require('path'),
    fs       = require('fs'),
    Promise  = require('bluebird'),
    _        = require('underscore'),
    $        = this;

exports.extensions = {
  image: ['jpg', 'jpeg', 'png', 'gif']
}

exports.userPhotoFilename = function(user, extension) {
  return user.id + '_' + new Date().getTime() + (extension ? extension : '');
}

exports.userPhotoFilePath = function(userPhotoFilename) {
  return path.join(settings.publicPath, 'img/users/', userPhotoFilename ? userPhotoFilename : '');
}

exports.downloadUserPhoto = function(uri, user, extensionsAccepted) {
  return new Promise(function(resolve, reject) {
    var photoFilename = $.userPhotoFilename(user);
    var photoPath = $.userPhotoFilePath();
    $.download(uri, photoPath, photoFilename, extensionsAccepted).then(function(filenameWithExtension) {
      user.set('photo_filename', filenameWithExtension);
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.politicianPhotoFilename = function(politician, extension) {
  return politician.id + '_' + new Date().getTime() + (extension ? extension : '');
}

exports.politicianPhotoFilePath = function(politicianPhotoFilename) {
  return path.join(settings.publicPath, 'img/politicians/', politicianPhotoFilename ? politicianPhotoFilename : '');
}

exports.downloadPoliticianPhoto = function(uri, politician, extensionsAccepted) {
  return new Promise(function(resolve, reject) {
    var photoFilename = $.politicianPhotoFilename(politician);
    var photoPath = $.politicianPhotoFilePath();
    $.download(uri, photoPath, photoFilename, extensionsAccepted).then(function(filenameWithExtension) {
      politician.set('photo_filename', filenameWithExtension);
      resolve(politician);
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