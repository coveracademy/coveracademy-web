"use strict"

var contestService  = require('../apis/contestService'),
    mailService     = require('../apis/mailService'),
    constants       = require('../apis/constants'),
    logger          = require('../configs/logger'),
    isAuthenticated = require('../utils/authorization').isAuthenticated,
    isAdmin         = require('../utils/authorization').isAdmin,
    messages        = require('../apis/messages'),
    Audition        = require('../models/models').Audition,
    Contest         = require('../models/models').Contest;

module.exports = function(router, app) {

  // ADMIN ROUTES
  router.put('/', isAdmin, function(req, res, next) {
    var contest = Contest.forge(req.param('contest'));
    contestService.updateContest(req.user, contest).then(function(contest) {
      res.json({
        contest: contest
      });
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/inscriptionEmail', isAdmin, function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    mailService.contestInscription(contest).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/audition/approve', isAdmin, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition')});
    contestService.approveAudition(audition).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/audition/disapprove', isAdmin, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition')});
    var reason = req.param('reason');
    contestService.disapproveAudition(audition, reason).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/unfinished', isAdmin, function(req, res, next) {
    contestService.listUnfinishedContests().then(function(contests) {
      res.json(contests);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  // AUTHENTICATED ROUTES
  router.post('/audition/submit', isAuthenticated, function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    var auditionData = req.param('audition');
    contestService.submitAudition(req.user, contest, auditionData).then(function(audition) {
      res.json(audition);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/audition/vote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition')});
    contestService.vote(req.user, audition).then(function(userVote) {
      res.json(userVote);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.delete('/audition/vote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition')});
    contestService.removeVote(req.user, audition).then(function(userVote) {
      res.json(userVote);
    }).catch(function(err) {
      logger.error(err)
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/vote', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition')});
    contestService.getUserVote(req.user, audition).bind({}).then(function(userVote) {
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
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/audition/comment', isAuthenticated, function(req, res, next) {
    var audition = Audition.forge({id: req.param('audition')});
    var message = req.param('message');
    contestService.comment(req.user, audition, message).then(function(userComment) {
      res.json(userComment);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.post('/audition/replyComment', isAuthenticated, function(req, res, next) {
    contestService.replyComment(req.user, req.param('comment'), req.param('message')).then(function(userComment) {
      res.json(userComment);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.delete('/audition/comment', isAuthenticated, function(req, res, next) {
    contestService.removeComment(req.user, req.param('comment')).then(function() {
      res.json();
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/isContestant', isAuthenticated, function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    contestService.isContestant(req.user, contest).then(function(isContestant) {
      res.json(isContestant);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition', isAuthenticated, function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    contestService.getUserAudition(req.user, contest).then(function(userAudition) {
      res.json(userAudition ? userAudition : {});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  // PUBLIC ROUTES
  router.get('/audition/videoInfos', isAuthenticated, function(req, res, next) {
    var url = req.param('url');
    contestService.getAuditionVideoInfos(url).then(function(videoInfos) {
      res.json(videoInfos);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/best', function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    var page = req.param('page') || constants.FIRST_PAGE;
    contestService.bestAuditions(contest, page, constants.NUMBER_OF_AUDITIONS_IN_PAGE).then(function(auditions) {
      res.json(auditions);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/latest', function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    var page = req.param('page') || constants.FIRST_PAGE;
    contestService.latestAuditions(contest, page, constants.NUMBER_OF_AUDITIONS_IN_PAGE).then(function(auditions) {
      res.json(auditions);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/audition/random', function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    var size = req.param('size');
    contestService.randomAuditions(contest, size).then(function(auditions) {
      res.json(auditions);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/latest', function(req, res, next) {
    var page = req.param('page') || constants.FIRST_PAGE;
    contestService.latestContestants(page, constants.NUMBER_OF_CONTESTANTS_IN_PAGE).then(function(contestants) {
      res.json(contestants);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/votes', isAuthenticated, function(req, res, next) {
    var contest = Contest.forge({id: req.param('contest')});
    contestService.getUserVotes(req.user, contest).then(function(userVotes) {
      res.json(userVotes);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  app.use('/api/contest', router);

}