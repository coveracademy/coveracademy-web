var coverService = require('../apis/coverService');

module.exports = function(router, app) {

  router.get('/', function(req, res, next) {
    var query = req.param('query');
    coverService.searchMusicArtists(query).then(function(musicArtists) {
      res.json(musicArtists);
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.use('/musicArtist', router);

}