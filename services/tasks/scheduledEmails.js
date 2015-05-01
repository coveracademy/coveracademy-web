'use strict'

var mailService    = require('../../apis/internal/mailService'),
    logger         = require('../../configs/logger'),
    ScheduledEmail = require('../../models').ScheduledEmail,
    moment         = require('moment'),
    later          = require('later');

var ScheduledEmailWrapper = function(scheduledEmail) {
  this.scheduledEmail = scheduledEmail;
};

ScheduledEmailWrapper.prototype.send = function() {
  logger.info('Sending scheduled email of type %s with parameters %s', this.scheduledEmail.get('type'), this.scheduledEmail.get('parameters'));
  mailService.sendScheduledEmail(this.scheduledEmail).catch(function(err) {
    logger.error('Error sending scheduled email', err);
  });
};

var sendScheduledEmails = function() {
  mailService.listNonScheduledEmails().then(function(nonScheduledEmails) {
    nonScheduledEmails.forEach(function(nonScheduledEmail) {
      var now = moment();
      var scheduleDate = moment(nonScheduledEmail.get('schedule_date'));
      if(scheduleDate.isBefore(now)) {
        logger.info('Sending scheduled email of type %s with parameters %s', nonScheduledEmail.get('type'), nonScheduledEmail.get('parameters'));
        mailService.sendScheduledEmail(nonScheduledEmail).catch(function(err) {
          logger.error('Error sending scheduled email', err);
        });
      } else {
        mailService.updateScheduledEmailStatus(nonScheduledEmail, 'scheduled').then(function(nonScheduledEmail) {
          var sched = later.parse.recur().on(scheduleDate.toDate()).fullDate();
          var timeout = later.setTimeout(function() { new ScheduledEmailWrapper(nonScheduledEmail).send(); }, sched);
        }).catch(function(err) {
          logger.error('Error updating scheduled email status to "scheduled"', err);
        });
      }
    });
  });
};

mailService.updateScheduledEmailsStatus('scheduled', 'none').then(function() {
  // Executes when starts the application
  sendScheduledEmails();
  // And then use later.js to schedule intervals
  var sched = later.parse.recur().every(30).minute();
  var sendScheduledEmailsInterval = later.setInterval(sendScheduledEmails, sched);
}).catch(function(err) {
  logger.error('Error updating scheduled emails status from "scheduled" to "none".', err);
});