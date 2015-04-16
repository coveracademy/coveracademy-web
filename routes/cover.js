'use strict'

var coverService   = require('../apis/coverService'),
    constants      = require('../apis/constants'),
    logger         = require('../configs/logger'),
    isAdmin        = require('../utils/authorization').isAdmin,
    Music          = require('../models').Music,
    MusicGenre     = require('../models').MusicGenre,
    PotentialCover = require('../models').PotentialCover;

module.exports = function(router, app) {

  // ADMIN ROUTES
  router.post('/', isAdmin, function(req, res, next) {
    var coverData = req.param('cover');
    coverService.addCover(req.user, coverData).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.delete('/', isAdmin, function(req, res, next) {
    var coverData = req.param('cover');
    coverService.removeCover(coverData).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.post('/accept', isAdmin, function(req, res, next) {
    var potentialCover = PotentialCover.forge(req.param('potentialCover'));
    coverService.acceptCover(req.user, potentialCover).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.post('/refuse', isAdmin, function(req, res, next) {
    var potentialCover = PotentialCover.forge(req.param('potentialCover'));
    coverService.refuseCover(potentialCover).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  // PUBLIC ROUTES
  router.get('/top', function(req, res, next) {
    coverService.topCover().then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.get('/latest', function(req, res, next) {
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.latestCovers(constants.WEEK_PERIOD, page, constants.NUMBER_OF_COVERS_IN_PAGE).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.get('/best', function(req, res, next) {
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.bestCovers(constants.WEEK_PERIOD, page, constants.NUMBER_OF_COVERS_IN_PAGE).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.get('/latestOfMusic', function(req, res, next) {
    var music = Music.forge({id: req.param('music')});
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.latestCoversOfMusic(music, page, constants.NUMBER_OF_COVERS_IN_PAGE).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.get('/bestOfMusic', function(req, res, next) {
    var music = Music.forge({id: req.param('music')});
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.bestCoversOfMusic(music, page, constants.NUMBER_OF_COVERS_IN_PAGE).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.get('/latestOfMusicGenre', function(req, res, next) {
    var musicGenre = MusicGenre.forge({id: req.param('musicGenre')});
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.latestCoversOfMusicGenre(musicGenre, page, constants.NUMBER_OF_COVERS_IN_PAGE).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.get('/bestOfMusicGenre', function(req, res, next) {
    var musicGenre = MusicGenre.forge({id: req.param('musicGenre')});
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.bestCoversOfMusicGenre(musicGenre, page, constants.NUMBER_OF_COVERS_IN_PAGE).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.get('/:id', function(req, res, next) {
    var id = req.param('id');
    coverService.getCover(id).then(function(cover) {
      if(!cover) {
        throw new Error('Cover not found');
      }
      res.json(cover);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  app.use('/api/cover', router);

}