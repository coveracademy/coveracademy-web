'use strict'

var coverService = require('../apis/coverService'),
    logger       = require('../configs/logger'),
    Promise      = require('bluebird');

module.exports = function(router, app) {

  // PUBLIC ROUTES
  router.get('/musicOrArtist', function(req, res, next) {
    var query = req.param('query');
    Promise.all([coverService.searchMusics(query), coverService.searchArtists(query)])
    .spread(function(musics, artists) {
      res.json({
        musics: musics,
        artists: artists
      });
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    })
  });

  router.get('/artist', function(req, res, next) {
    var query = req.param('query');
    var related = req.param('related');
    coverService.searchArtists(query, related).then(function(artists) {
      res.json(artists);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  router.get('/music', function(req, res, next) {
    var artist = req.param('artist');
    var query = req.param('query');
    var promise = artist ? coverService.searchMusicsOfArtist(artist, query) : coverService.searchMusics(query);
    promise.then(function(musics) {
      res.json(musics);
    }).catch(function(err) {
      logger.error(err);
      res.send(500);
    });
  });

  app.use('/api/search', router);

}