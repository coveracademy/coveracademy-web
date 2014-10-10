var contestService  = require('../apis/contestService'),
    constants       = require('../apis/constants'),
    isAuthenticated = require('../utils/authorization').isAuthenticated,
    apiErrors       = require('../apis/errors/apiErrors');

module.exports = function(router, app) {

  // PUBLIC ROUTES
  router.post('/join', isAuthenticated, function(req, res, next) {
    var auditionData = req.param('audition');
    contestService.joinContest(req.user, auditionData).then(function(audition) {
      res.json(audition);
    }).catch(function(err) {
      console.log(err.stack);
      apiErrors.formatResponse(err, res);
    });
  });

  router.get('/audition/videoInfos', isAuthenticated, function(req, res, next) {
    var url = req.param('url');
    contestService.getAuditionVideoInfos(url).then(function(videoInfos) {
      res.json(videoInfos);
    }).catch(function(err) {
      console.log(err.stack);
      apiErrors.formatResponse(err, res);
    });
  });

  app.use('/api/contest', router);

}