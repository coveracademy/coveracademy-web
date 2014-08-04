var coverService = require('../apis/coverService');

module.exports = function(router, app) {

  router.get('/', function(req, res, next) {
    coverService.allMusicGenres().then(function(musicGenres) {
      res.json(musicGenres);
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.use('/api/musicGenre', router);

}