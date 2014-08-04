var coverService = require('../apis/coverService');

module.exports = function(router, app) {

  router.post('/', function(req, res, next) {
    var coverData = req.param('cover');
    coverService.addCover(coverData).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/latest', function(req, res, next) {
    var period = req.param('period') || 7;
    var page = req.param('page');
    var pageSize = req.param('pageSize');
    coverService.latestCovers(period, page, pageSize).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/best', function(req, res, next) {
    var period = req.param('period') || 7;
    var page = req.param('page') || 1;
    var pageSize = req.param('pageSize') || 1;
    coverService.bestCovers(period, page, pageSize).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/top', function(req, res, next) {
    coverService.topCover().then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/:id', function(req, res, next) {
    var id = req.param('id');
    coverService.getCover(id).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      console.log(err);
    })
  });

  app.use('/api/cover', router);

}