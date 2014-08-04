var coverService = require('../apis/coverService'),
    Music   = require('../models/models').Music;

module.exports = function(router, app) {

  router.get('/', function(req, res, next) {
    var artist = {id: req.param('artist_id')};
    var query = req.param('query');
    coverService.searchMusics(artist, query).then(function(musics) {
      res.json(musics);
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/:id/bestCovers', function(req, res, next) {
    var music = Music.forge({id: req.param('id')});
    var page = req.param('page') || 1;
    var pageSize = req.param('pageSize') || 1;
    coverService.bestCoversOfMusic(music, page, pageSize).then(function(musics) {
      res.json(musics);
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/:id/latestCovers', function(req, res, next) {
    var music = Music.forge({id: req.param('id')});
    var page = req.param('page') || 1;
    var pageSize = req.param('pageSize') || 1;
    coverService.latestCoversOfMusic(music, page, pageSize).then(function(musics) {
      res.json(musics);
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.use('/api/music', router);

}