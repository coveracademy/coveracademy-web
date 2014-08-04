var coverService = require('../apis/coverService');

module.exports = function(router, app) {

  router.get('/', function(req, res, next) {
    var query = req.param('query');
    coverService.searchArtists(query).then(function(artists) {
      res.json(artists);
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.use('/api/artist', router);

}