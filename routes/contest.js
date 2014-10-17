var contestService  = require('../apis/contestService'),
    constants       = require('../apis/constants'),
    isAuthenticated = require('../utils/authorization').isAuthenticated,
    apiErrors       = require('../apis/errors/apiErrors'),
    Audition        = require('../models/models').Audition;

module.exports = function(router, app) {

  // PUBLIC ROUTES
  router.get('/audition/videoInfos', isAuthenticated, function(req, res, next) {
    var url = req.param('url');
    contestService.getAuditionVideoInfos(url).then(function(videoInfos) {
      res.json(videoInfos);
    }).catch(function(err) {
      console.log(err.stack);
      apiErrors.formatResponse(err, res);
    });
  });

  router.post('/join', isAuthenticated, function(req, res, next) {
    var auditionData = req.param('audition');
    contestService.joinContest(req.user, auditionData).then(function(audition) {
      res.json(audition);
    }).catch(function(err) {
      console.log(err.stack);
      apiErrors.formatResponse(err, res);
    });
  });

  router.post('/audition/vote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition_id')});
    contestService.vote(req.user, audition).then(function(auditionVote) {
      res.json({
        auditionVote: auditionVote
      });
    }).catch(function(err) {
      console.log(err.stack);
      apiErrors.formatResponse(err, res);
    });
  });

  router.post('/audition/removeVote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition_id')});
    contestService.removeVote(req.user, audition).then(function() {
      res.json({});
    }).catch(function(err) {
      console.log(err.stack);
      apiErrors.formatResponse(err, res);
    });
  });

  router.get('/audition/vote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition_id')});
    contestService.getAuditionVote(req.user, audition).then(function(auditionVote) {
      res.json(auditionVote);
    }).catch(function(err) {
      console.log(err.stack);
      apiErrors.formatResponse(err, res);
    });
  });

  app.use('/api/contest', router);

}