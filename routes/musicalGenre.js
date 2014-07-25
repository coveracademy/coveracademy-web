var coverService = require('../apis/coverService');

module.exports = function(router, app) {

  router.get('/', function(req, res, next) {
    coverService.allMusicalGenres().then(function(musicalGenres) {
      res.json(musicalGenres);
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.use('/musicalGenre', router);

}