var userService = require('../apis/userService'),
    settings    = require('../configs/settings'),
    User        = require('../models/models').User,
    path        = require('path'),
    fs          = require('fs'),
    multipart   = require('connect-multiparty'),
    flow        = require('../utils/flow-node.js')('tmp/'),
    fileUtils   = require('../utils/fileUtils');

module.exports = function(app) {

  // Handle uploads through Flow.js
  app.post('/upload/user', multipart(), function(req, res) {
    flow.post(req, function(status, filename, originalFilename, identifier) {
      if(status === 'done') {
        var user = User.forge({id: req.body.user_id});
        var userPhoto = fileUtils.userPhotoFilename(user, path.extname(filename));
        var userPhotoPath = fileUtils.userPhotoFilePath(userPhoto);
        user.set('image', userPhoto);
        fs.rename(flow.getFinalFilePath(filename), userPhotoPath, function() {
          userService.update(req.user, user).then(function(user) {
            res.send(200, {});
          }).catch(function(err) {
            res.send(500, {});
          });
        });
      } else {
        res.send(200, {});
      }
    });
  });

  // Handle status checks on chunks through Flow.js
  app.get('/upload/user', function(req, res) {
    flow.get(req, function(status, filename, originalFilename, identifier) {
      res.send(200, (status === 'found' ? 200 : 404));
    });
  });

}