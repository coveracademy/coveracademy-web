var coverService = require('../apis/coverService'),
    constants    = require('../apis/constants'),
    isAdmin      = require('../utils/authorization').isAdmin,
    Music        = require('../models/models').Music;

module.exports = function(router, app) {

  router.post('/', isAdmin, function(req, res, next) {
    var musicData = req.param('music');
    coverService.saveMusic(musicData).then(function(music) {
      res.json(music);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  app.use('/api/music', router);

}