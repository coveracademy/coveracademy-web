var coverService = require('../apis/coverService'),
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
      console.log(err.stack);
      res.send(500);
    })
  });

  router.get('/artist', function(req, res, next) {
    var query = req.param('query');
    coverService.searchArtists(query).then(function(artists) {
      console.log(artists)
      res.json(artists);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  router.get('/music', function(req, res, next) {
    var artist = req.param('artist');
    var query = req.param('query');
    coverService.searchMusicsOfArtist(artist, query).then(function(musics) {
      console.log(musics)
      res.json(musics);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  app.use('/api/search', router);

}