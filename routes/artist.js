var coverService = require('../apis/coverService'),
    constants    = require('../apis/constants'),
    isAdmin      = require('../utils/authorization').isAdmin,
    Artist       = require('../models/models').Artist;

module.exports = function(router, app) {

  router.get('/', function(req, res, next) {
    var musicGenre = MusicGenre.forge({id: req.param('musicGenre')});
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.listArtists(musicGenre, page, constants.ARTISTS_IN_LIST).then(function(artists) {
      res.json(artists);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  router.post('/', isAdmin, function(req, res, next) {
    var artist = Artist.forge(req.param('artist'));
    coverService.saveArtist(artist).then(function(artist) {
      res.json(artist);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  app.use('/api/artist', router);

}