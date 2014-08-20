var coverService   = require('../apis/coverService'),
    constants      = require('../apis/constants'),
    isAdmin        = require('../utils/authorization').isAdmin,
    PotentialCover = require('../models/models').PotentialCover;

module.exports = function(router, app) {

  // ADMIN ROUTES
  router.post('/', isAdmin, function(req, res, next) {
    var coverData = req.param('cover');
    coverService.addCover(coverData).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  router.post('/accept', isAdmin, function(req, res, next) {
    var potentialCover = PotentialCover.forge(req.param('potentialCover'));
    coverService.acceptCover(potentialCover).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  router.post('/refuse', isAdmin, function(req, res, next) {
    var potentialCover = PotentialCover.forge(req.param('potentialCover'));
    coverService.refuseCover(potentialCover).then(function() {
      res.json({});
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  // PUBLIC ROUTES
  router.get('/latest', function(req, res, next) {
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.latestCovers(constants.WEEK_PERIOD, page, constants.NUMBER_OF_COVERS_IN_LIST).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  router.get('/best', function(req, res, next) {
    var page = req.param('page') || constants.FIRST_PAGE;
    coverService.bestCovers(constants.WEEK_PERIOD, page, constants.NUMBER_OF_COVERS_IN_LIST).then(function(covers) {
      res.json(covers);
    }).catch(function(err) {
      console.log(err.stack);
      console.log(err);
    });
  });

  router.get('/top', function(req, res, next) {
    coverService.topCover().then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      console.log(err.stack);
      console.log(err);
    });
  });

  router.get('/:id', function(req, res, next) {
    var id = req.param('id');
    coverService.getCover(id).then(function(cover) {
      res.json(cover);
    }).catch(function(err) {
      console.log(err.stack);
      console.log(err);
    })
  });

  app.use('/api/cover', router);

}