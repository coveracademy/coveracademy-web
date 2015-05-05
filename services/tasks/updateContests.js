'use strict'

var contestService = require('../../apis/contestService'),
    messages       = require('../../apis/internal/messages'),
    logger         = require('../../configs/logger'),
    later          = require('later');

var startContests = function() {
  logger.info('Starting contests');
  contestService.listWaitingContests().then(function(contests) {
    contests.forEach(function(contest) {
      contestService.startContest(contest).then(function(contest) {
        logger.info('Contest %d started successfully', contest.id);
      }).catch(function(err) {
        if(!messages.isErrorKey(err, 'contest.start.notReady')) {
          logger.error('Error starting contest %d.', contest.id, err);
        }
      });
    });
  });
};

var finishContests = function() {
  logger.info('Finishing contests');
  contestService.listRunningContests().then(function(contests) {
    contests.forEach(function(contest) {
      contestService.finishContest(contest).then(function() {
        logger.info('Contest %d was finished', contest.id);
      }).catch(function(err) {
        logger.error('Error finishing contest %d.', contest.id, err);
      });
    });
  });
};

var sched = later.parse.recur().on(1).minute();
var finishContestsInterval = later.setInterval(finishContests, sched);
var startContestsInterval = later.setInterval(startContests, sched);