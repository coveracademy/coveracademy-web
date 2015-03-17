"use strict"

var contestService = require('../apis/contestService'),
    mailService    = require('../apis/mailService'),
    logger         = require('../configs/logger'),
    constants      = require('./constants'),
    later          = require('later'),
    moment         = require('moment');

var sendIncentiveVoteEmail = function() {

}

var scheduleIncentiveVoteFirstEmail = function(contest) {
  var firstEmailConstants = constants.incentiveVote.firstEmail;

  var now = moment();
  var end = moment(contest.get('end_date'));

  var date = moment(end).subtract(firstEmailConstants.DAYS_BEFORE_THE_END, 'days');
  date.hour(firstEmailConstants.HOUR).minute(firstEmailConstants.MINUTE).second(firstEmailConstants.SECOND);
  if(now.isBefore(date)) {
    var sched = later.parse.recur()
      .on(date.date()).dayOfMonth()
      .on(date.month()).month()
      .on(date.year()).year()
      .on(date.hour()).hour()
      .on(date.minute()).minute()
      .on(date.second()).second();
    var timeout = later.setTimeout(sendEmail, sched);
  }
}

var scheduleIncentiveVoteEmails = function() {
  logger.info('Scheduling incentive votes emails');
  contestService.listRunningContests().then(function(contests) {
    contests.forEach(function(contest) {
      scheduleIncentiveVoteFirstEmail(contest);
    });
  });
}

scheduleIncentiveVoteEmails();