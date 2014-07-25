var path              = require('path'),
    fs                = require('fs'),
    flow              = require('../utils/flow-node.js')('tmp/'),
    fileUtils         = require('../utils/fileUtils');
    settings          = require('../configs/settings'),

module.exports = function(router, app) {

  // // Handle uploads through Flow.js
  // app.post('/upload/politico', function(req, res) {
  //   flow.post(req, function(status, filename, originalFilename, identifier) {
  //     if(status === 'done') {
  //       var politician = politicianService.forge({id: req.body.politician_id});
  //       var politicianPhoto = fileUtils.politicianPhotoFilename(politician, path.extname(filename));
  //       var politicianPhotoPath = fileUtils.politicianPhotoFilePath(politicianPhoto);
  //       politician.set('photo_filename', politicianPhoto);
  //       fs.rename(flow.getFinalFilePath(filename), politicianPhotoPath, function() {
  //         politicianService.update(req.user, politician).then(function(politician) {
  //           res.send(200, {});
  //         }).catch(function(err) {
  //           res.send(500, {});
  //         });
  //       });
  //     } else {
  //       res.send(200, {});
  //     }
  //   });
  // });

  // // Handle status checks on chunks through Flow.js
  // app.get('/upload/politico', function(req, res) {
  //   flow.get(req, function(status, filename, originalFilename, identifier) {
  //     res.send(200, (status === 'found' ? 200 : 404));
  //   });
  // });

}