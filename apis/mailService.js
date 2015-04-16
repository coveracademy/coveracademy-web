'use strict'

var models         = require('../models'),
    settings       = require('../configs/settings'),
    constants      = require('./constants'),
    Mailgun        = require('mailgun-js'),
    Promise        = require('bluebird'),
    restify        = require('restify'),
    moment         = require('moment'),
    ScheduledEmail = models.ScheduledEmail,
    Bookshelf      = models.Bookshelf,
    mailClient     = restify.createJsonClient('http://' + settings.postman.host + ':' + settings.postman.port),
    $              = this;

exports.receive = function(fromName, from, subject, text) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/receive', {fromName: fromName, from: from, subject: subject, text: text}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.send = function(to, subject, text) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/send', {to: to, subject: subject, text: text}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.userRegistration = function(user) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/user/registration', {user: user.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.userVerification = function(user, verificationToken, registration) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/user/verification', {user: user.id, token: verificationToken.get('token'), registration: registration}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.auditionSubmit = function(user, contest, audition) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/audition/submit', {user: user.id, contest: contest.id, audition: audition.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.auditionApproved = function(audition) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/audition/approved', {audition: audition.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.auditionDisapproved = function(user, contest, reason) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/audition/disapproved', {user: user.id, contest: contest.id, reason: reason}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.auditionComment = function(user, comment) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/audition/comment', {user: user.id, comment: comment.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.auditionReplyComment = function(user, reply) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/audition/replyComment', {user: user.id, reply: reply.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.contestInscription = function(contest) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/inscription', {contest: contest.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.contestStart = function(contest) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/start', {contest: contest.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.contestNext = function(contest) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/next', {contest: contest.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.contestDraw = function(contest) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/draw', {contest: contest.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};


exports.contestFinish = function(contest) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/finish', {contest: contest.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.contestWinner = function(user, contest, audition) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/winner', {user: user.id, contest: contest.id, audition: audition.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.contestIncentiveVote = function(contest, daysBeforeTheEnd) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/incentiveVote', {contest: contest.id, daysBeforeTheEnd: daysBeforeTheEnd}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.contestJoinContestantFans = function(contestant, contest) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/join/contestantFans', {contestant: contestant.id, contest: contest.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.contestJoinFans = function(contest) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/contest/join/fans', {contest: contest.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};

exports.scheduleIncentiveVote = function(contest) {
  return new Promise(function(resolve, reject) {
    if(contest.get('progress') === 'running') {
      var daysBeforeTheEnd = [constants.incentiveVote.firstEmail.DAYS_BEFORE_THE_END, constants.incentiveVote.secondEmail.DAYS_BEFORE_THE_END]
      var promises = [];
      daysBeforeTheEnd.forEach(function(daysBefore) {
        var parameters = {contest: contest.id, daysBeforeTheEnd: daysBefore};
        var now = moment();
        var end = moment(contest.get('end_date'));
        var date = moment(end).subtract(daysBefore, 'days');
        date.hour(constants.incentiveVote.HOUR_TO_SEND_EMAIL);
        date.minute(constants.incentiveVote.MINUTE_TO_SEND_EMAIL);
        date.second(constants.incentiveVote.SECOND_TO_SEND_EMAIL);
        date.millisecond(0);
        var scheduledEmail = ScheduledEmail.forge({
          schedule_date: date.toDate(),
          parameters: JSON.stringify(parameters),
          type: 'IncentiveVote',
          status: 'none'
        });
        promises.push(scheduledEmail.save());
      });
      resolve(Promise.all(promises));
    } else {
      resolve();
    }
  });
};

exports.scheduleContestJoinFans = function(contest) {
  return new Promise(function(resolve, reject) {
    if(contest.get('progress') === 'running') {
      var parameters = {contest: contest.id};
      var scheduledEmail = ScheduledEmail.forge({
        schedule_date: moment().add(1, 'hour').millisecond(0).toDate(),
        parameters: JSON.stringify(parameters),
        type: 'JoinContest',
        status: 'none'
      });
      resolve(scheduledEmail.save());
    } else {
      resolve();
    }
  });
};

exports.listNonScheduledEmails = function() {
  return ScheduledEmail.query({where: {status: 'none'}}).fetchAll();
};

exports.updateScheduledEmailsStatus = function(from, to) {
  return Bookshelf.knex('scheduled_email').where('status', from).update({status: to}).then(function() {
    return Promise.resolve();
  });
};

exports.updateScheduledEmailStatus = function(scheduledEmail, status) {
  scheduledEmail.set('status', status)
  return scheduledEmail.save();
};

exports.sendScheduledEmail = function(scheduledEmail) {
  return new Promise(function(resolve, reject) {
    if(scheduledEmail.get('scheduledEmail') > new Date()) {
      reject(messages.apiError('scheduledEmail.scheduledToTheFuture', 'The scheduled email cannot be sent now because is scheduled to the future'));
      return;
    }
    var promise = null;
    var parameters = JSON.parse(scheduledEmail.get('parameters'));
    switch (scheduledEmail.get('type')) {
      case 'IncentiveVote':
        promise = $.contestIncentiveVote({id: parameters.contest}, parameters.daysBeforeTheEnd);
        break;
      case 'JoinContest':
        promise = $.contestJoinFans({id: parameters.contest});
        break;
    }
    if(promise) {
      resolve(promise.then(function() {
        return $.updateScheduledEmailStatus(scheduledEmail, 'sent');
      }));
    } else {
      reject(messages.apiError('scheduledEmail.typeNotSupported', 'The scheduled email of type ' + scheduledEmail.get('type') + ' is not supported'));
    }
  });
};