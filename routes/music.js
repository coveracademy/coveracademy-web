'use strict';

var coverService = require('../apis/coverService'),
    constants    = require('../apis/internal/constants'),
    logger       = require('../configs/logger'),
    isAdmin      = require('../utils/authorization').isAdmin,
    Music        = require('../models').Music;

module.exports = function(router, app) {

  router.post('/', isAdmin, function(req, res, next) {
    var musicData = req.param('music');
    coverService.saveMusic(musicData).then(function(music) {
      res.json(music);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  app.use('/api/music', router);

}