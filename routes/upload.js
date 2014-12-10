var userService = require('../apis/userService'),
    settings    = require('../configs/settings'),
    flow        = require('../utils/flow-node.js')(settings.tmpUploadPath),
    fileUtils   = require('../utils/fileUtils'),
    path        = require('path'),
    fs          = require('fs'),
    multipart   = require('connect-multiparty');

module.exports = function(router, app) {

  // Handle uploads through Flow.js
  router.post('/user', multipart(), function(req, res) {
    flow.post(req, function(status, filename, originalFilename, identifier) {
      if(status === 'done') {
        var user = userService.forge({id: parseInt(req.body.user)});
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
  router.get('/user', function(req, res) {
    flow.get(req, function(status, filename, originalFilename, identifier) {
      res.send(200, (status === 'found' ? 200 : 404));
    });
  });

  app.use('/api/upload', router);

}