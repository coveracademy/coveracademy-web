"use strict"

var contestService = require('../../apis/contestService'),
    mailService    = require('../../apis/mailService'),
    logger         = require('../../configs/logger'),
    constants      = require('../constants'),
    later          = require('later'),
    moment         = require('moment');

var scheduledContests = {};

var IncentiveEmail = function(contest, daysBeforeTheEnd) {
  this.contest = contest;
  this.daysBeforeTheEnd = daysBeforeTheEnd;
};

IncentiveEmail.prototype.send = function() {
  mailService.contestIncentiveVote(this.contest, this.daysBeforeTheEnd).catch(function(err) {
    logger.error('Error sending "contest incentive vote" email.', err);
  });
};

var scheduleIncentiveVote = function(contest, daysBeforeTheEnd) {
  var now = moment();
  var end = moment(contest.get('end_date'));
  var date = moment(end).subtract(daysBeforeTheEnd, 'days');
  date.hour(constants.incentiveVote.HOUR_TO_SEND_EMAIL);
  date.minute(constants.incentiveVote.MINUTE_TO_SEND_EMAIL);
  date.second(constants.incentiveVote.SECOND_TO_SEND_EMAIL);
  if(now.isBefore(date)) {
    var sched = later.parse.recur().on(date.toDate()).fullDate();
    var timeout = later.setTimeout(new IncentiveEmail(contest, daysBeforeTheEnd).send, sched);
    logger.info('Incentive vote email scheduled for %s', date.format());
  }
};

var scheduleIncentiveVoteEmails = function() {
  logger.info('Scheduling incentive vote emails');
  contestService.listRunningContests().then(function(contests) {
    contests.forEach(function(contest) {
      if(!scheduledContests[contest.id] || scheduledContests[contest.id] === false) {
        scheduleIncentiveVote(contest, constants.incentiveVote.firstEmail.DAYS_BEFORE_THE_END);
        scheduleIncentiveVote(contest, constants.incentiveVote.secondEmail.DAYS_BEFORE_THE_END);
        scheduledContests[contest.id] = true;
      }
    });
  });
};

// Executes when starts the application
scheduleIncentiveVoteEmails();
// And then use later.js to schedule intervals
var sched = later.parse.recur().on(0).hour();
var scheduleIncentiveVoteInterval = later.setInterval(scheduleIncentiveVoteEmails, sched);