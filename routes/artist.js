'use strict'

var coverService = require('../apis/coverService'),
    constants    = require('../apis/constants'),
    messages     = require('../apis/messages'),
    isAdmin      = require('../utils/authorization').isAdmin,
    Artist       = require('../models').Artist;

module.exports = function(router, app) {

  router.get('/', function(req, res, next) {
    var musicGenre = MusicGenre.forge({id: req.param('musicGenre')});
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.listArtists(musicGenre, page, constants.NUMBER_OF_ARTISTS_IN_PAGE).then(function(artists) {
      res.json(artists);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/', isAdmin, function(req, res, next) {
    var artist = Artist.forge(req.param('artist'));
    coverService.saveArtist(artist).then(function(artist) {
      res.json(artist);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  app.use('/api/artist', router);

}