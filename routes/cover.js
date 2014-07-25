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

  router.get('/last', function(req, res, next) {
    var related = req.param('related');
    var page = req.param('page');
    var pageSize = req.param('pageSize');
    coverService.lastCovers(related, page, pageSize).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/:id', function(req, res, next) {
    var related = req.param('related');
    var id = req.param('id');
    coverService.getCover(id, related).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      console.log(err);
    })
  });

  app.use('/cover', router);

}