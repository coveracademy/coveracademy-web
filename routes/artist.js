var coverService   = require('../apis/coverService'),
    constants      = require('../apis/constants'),
    MusicGenre     = require('../models/models').MusicGenre;

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

  app.use('/api/artist', router);
}