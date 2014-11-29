var contestService  = require('../apis/contestService'),
    constants       = require('../apis/constants'),
    isAuthenticated = require('../utils/authorization').isAuthenticated,
    messages        = require('../apis/messages'),
    Audition        = require('../models/models').Audition,
    Contest         = require('../models/models').Contest;

module.exports = function(router, app) {

  // PUBLIC ROUTES
  router.get('/audition/videoInfos', isAuthenticated, function(req, res, next) {
    var url = req.param('url');
    contestService.getAuditionVideoInfos(url).then(function(videoInfos) {
      res.json(videoInfos);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/join', isAuthenticated, function(req, res, next) {
    var auditionData = req.param('audition');
    var user = req.user;
    contestService.joinContest(user, auditionData).then(function(joined) {
      res.json(joined.audition);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/audition/vote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition_id')});
    contestService.vote(req.user, audition).then(function(userVote) {
      res.json(userVote);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/audition/removeVote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition_id')});
    contestService.removeVote(req.user, audition).then(function(userVote) {
      res.json(userVote);
    }).catch(function(err) {
      console.log(err)
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/vote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition_id')});
    contestService.getUserVote(req.user, audition).then(function(userVote) {
      this.userVote = userVote;
      return contestService.getAudition(audition.id);
    }).then(function(audition) {
      return contestService.countUserVotes(req.user, audition.related('contest'));
    }).then(function(totalUserVotes) {
      res.json({
        userVote: this.userVote,
        totalUserVotes: totalUserVotes
      });
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    }).bind({});
  });

  router.get('/isContestant', isAuthenticated, function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest_id')});
    contestService.isContestant(req.user, contest).then(function(isContestant) {
      res.json(isContestant);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition', isAuthenticated, function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest_id')});
    contestService.getUserAudition(req.user, contest).then(function(userAudition) {
      res.json(userAudition ? userAudition : {});
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/best', function(req, res, next) {
    var contest = Contest.forge(req.param('contest'));
    var page = req.param('page');
    contestService.bestAuditions(contest, page, constants.NUMBER_OF_AUDITIONS_IN_LIST).then(function(auditions) {
      res.json(auditions);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/latest', function(req, res, next) {
    var contest = Contest.forge(req.param('contest'));
    var page = req.param('page');
    contestService.latestAuditions(contest, page, constants.NUMBER_OF_AUDITIONS_IN_LIST).then(function(auditions) {
      res.json(auditions);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  app.use('/api/contest', router);

}