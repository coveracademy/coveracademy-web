var coverService = require('../apis/coverService');

module.exports = function(router, app) {

  router.get('/', function(req, res, next) {
    var musicArtist = {id: req.param('music_artist_id')};
    var query = req.param('query');
    coverService.searchMusicTitles(musicArtist, query).then(function(musicTitles) {
      res.json(musicTitles);
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.use('/musicTitle', router);

}