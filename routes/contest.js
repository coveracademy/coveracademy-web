var contestService  = require('../apis/contestService'),
    constants       = require('../apis/constants'),
    isAuthenticated = require('../utils/authorization').isAuthenticated,
    isAdmin         = require('../utils/authorization').isAdmin,
    messages        = require('../apis/messages'),
    Audition        = require('../models/models').Audition,
    Contest         = require('../models/models').Contest;

module.exports = function(router, app) {

  // ADMIN ROUTES
  router.post('/audition/approve', isAdmin, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition')});
    contestService.approveAudition(audition).then(function() {
      res.json({});
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/audition/disapprove', isAdmin, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition')});
    var reason = req.param('reason');
    contestService.disapproveAudition(audition, reason).then(function() {
      res.json({});
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  // AUTHENTICATED ROUTES
  router.post('/audition/submit', isAuthenticated, function(req, res, next) {
    var user = req.user;
    var contest = Contest.forge({id: req.param('contest')});
    var auditionData = req.param('audition');
    contestService.submitAudition(user, contest, auditionData).then(function(audition) {
      res.json(audition);
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

  router.get('/audition/best', function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    var page = req.param('page') || constants.FIRST_PAGE;
    contestService.bestAuditions(contest, page, constants.NUMBER_OF_AUDITIONS_IN_LIST).then(function(auditions) {
      res.json(auditions);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/latest', function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    var page = req.param('page') || constants.FIRST_PAGE;
    contestService.latestAuditions(contest, page, constants.NUMBER_OF_AUDITIONS_IN_LIST).then(function(auditions) {
      res.json(auditions);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/random', function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    var size = req.param('size');
    contestService.randomAuditions(contest, size).then(function(auditions) {
      res.json(auditions);
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  app.use('/api/contest', router);

}