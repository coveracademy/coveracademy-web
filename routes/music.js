var coverService = require('../apis/coverService'),
    constants    = require('../apis/constants'),
    isAdmin      = require('../utils/authorization').isAdmin,
    Music        = require('../models/models').Music;

module.exports = function(router, app) {

  router.post('/', isAdmin, function(req, res, next) {
    var music = Music.forge(req.param('music'));
    coverService.saveMusic(music).then(function(music) {
      res.send(200);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  app.use('/api/music', router);
}