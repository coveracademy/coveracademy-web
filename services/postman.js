'use strict';

var settings       = require('../configs/settings'),
    logger         = require('../configs/logger'),
    contestService = require('../apis/contestService'),
    userService    = require('../apis/userService'),
    contestService = require('../apis/contestService'),
    entities       = require('../utils/entities'),
    encrypt        = require('../utils/encrypt'),
    PromiseWrapper = require('../utils/promise').PromiseWrapper,
    restify        = require('restify'),
    nunjucks       = require('nunjucks'),
    path           = require('path'),
    moment         = require('moment'),
    Promise        = require('bluebird'),
    Mailgun        = require('mailgun-js'),
    _              = require('lodash'),
    contact        = settings.postman.contact,
    domain         = settings.domain,
    mailgun        = new Mailgun({apiKey: settings.postman.apiKey, domain: domain});

moment.locale('pt-br');

var server = restify.createServer({
  name: 'Postman'
});

server.use(restify.queryParser());
server.use(restify.bodyParser());

var mailTemplates = path.join(__dirname, 'mail_templates');
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(mailTemplates));

env.addGlobal('siteUrl', settings.siteUrl);

env.addFilter('auditionLink', function(audition) {
  return settings.siteUrl + '/pt-br/audition/' + audition.id + '/' + audition.slug;
});
env.addFilter('contestLink', function(contest) {
  return settings.siteUrl + '/pt-br/contest/' + contest.id + '/' + contest.slug;
});
env.addFilter('encryptEmail', function(user) {
  return encrypt.encrypt(user.email);
});

var userRegistrationTemplate = env.getTemplate('user_registration.tpl');
var userVerificationTemplate = env.getTemplate('user_verification.tpl');
var auditionSubmitTemplate = env.getTemplate('audition_submit.tpl');
var auditionApprovedTemplate = env.getTemplate('audition_approved.tpl');
var auditionDisapprovedTemplate = env.getTemplate('audition_disapproved.tpl');
var auditionCommentTemplate = env.getTemplate('audition_comment.tpl');
var auditionReplyCommentTemplate = env.getTemplate('audition_reply_comment.tpl');
var contestInscriptionTemplate = env.getTemplate('contest_inscription.tpl');
var contestIsNextTemplate = env.getTemplate('contest_next.tpl');
var contestStartTemplate = env.getTemplate('contest_start.tpl');
var contestStartToContestantTemplate = env.getTemplate('contest_start_contestant.tpl');
var contestDrawTemplate = env.getTemplate('contest_draw.tpl');
var contestDrawToContestantTemplate = env.getTemplate('contest_draw_contestant.tpl');
var contestIncentiveVoteTemplate = env.getTemplate('contest_incentive_vote.tpl');
var contestIncentiveVoteToContestantTemplate = env.getTemplate('contest_incentive_vote_contestant.tpl');
var contestInvalidVoteTemplate = env.getTemplate('contest_invalid_vote.tpl');
var contestInvalidVoteToContestantTemplate = env.getTemplate('contest_invalid_vote_contestant.tpl');
var contestJoinContestantFansTemplate = env.getTemplate('contest_join_contestant_fans.tpl');
var contestJoinFansTemplate = env.getTemplate('contest_join_fans.tpl');
var contestFinishTemplate = env.getTemplate('contest_finish.tpl');
var contestWinnerTemplate = env.getTemplate('contest_winner.tpl');

var renderPromise = function(template, obj) {
  return new Promise(function(resolve, reject) {
    template.render(obj, function(err, email) {
      if(err) {
        reject(err);
      } else {
        resolve(email);
      }
    });
  });
};

var partition = function(arr, size) {
  var newArray = [];
  for (var i = 0; i < arr.length; i += size) {
    newArray.push(arr.slice(i, i + size));
  }
  return newArray;
};


var receive = function(fromName, from, subject, text) {
  return new Promise(function(resolve, reject) {
    mailgun.messages().send({from: fromName + ' <' + from + '>', to: contact, subject: subject, html: text}, function(err, body) {
      if(err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
};

var send = function(to, subject, text) {
  return new Promise(function(resolve, reject) {
    if(!to) {
      resolve();
    } else {
      mailgun.messages().send({from: 'Cover Academy <' + contact + '>', to: to, subject: subject, html: text}, function(err, body) {
        if(err) {
          reject(err);
        } else {
          resolve(body);
        }
      });
    }
  });
};

var addToRecipientVariables = function(recipientVariables, variables) {
  if(variables) {
    if(_.isArray(variables)) {
      variables.forEach(function(variable) {
        recipientVariables[variable] = user.get(variable);
      });
    } else {
      var userVariables = variables[user.id];
      if(userVariables) {
        _.assign(recipientVariables, userVariables);
      }
    }
  }
};

var batchSend = function(users, subject, text, variables) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    var usersPartitioned = partition(entities.isCollection(users) ? users.toArray() : users, 999);
    usersPartitioned.forEach(function(partition) {
      var emails = [];
      var recipientVariables = {};
      partition.forEach(function(user) {
        var email = user.get('email');
        if(email && user.get('emails_enabled') === 1) {
          emails.push(email);
          recipientVariables[email] = {};
          recipientVariables[email].encryptedEmail = encrypt.encrypt(email);
          addToRecipientVariables(recipientVariables[email], variables)
        }
      });
      promises.push(new Promise(function(resolve, reject) {
        mailgun.messages().send({from: 'Cover Academy <' + contact + '>', to: emails.join(), subject: subject, html: text, 'recipient-variables': JSON.stringify(recipientVariables)}, function(err, body) {
          if(err) {
            reject(err);
          } else {
            resolve(body);
          }
        });
      }));
    });
    Promise.all(promises).then(function() {
      resolve();
    }).catch(function(err) {
      reject(err);
    });
  });
};

server.post('/receive', function(req, res, next) {
  receive(req.body.fromName, req.body.from, req.body.subject, req.body.text).then(function() {
    res.send(200);
  }).catch(function(err) {
    res.send(500);
  });
});

server.post('/send', function(req, res, next) {
  send(req.body.to, req.body.subject, req.body.text).then(function() {
    res.send(200);
  }).catch(function(err) {
    res.send(500);
  });
});

server.post('/user/registration', function(req, res, next) {
  userService.findById(req.body.user).bind({}).then(function(user) {
    this.user = user;
    return renderPromise(userRegistrationTemplate, {user: user.toJSON()});
  }).then(function(email) {
    return send(this.user.get('email'), 'Bem-vindo ao Cover Academy!', email);
  }).then(function(emailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "user registration" email to user %d.', req.body.user, err);
    res.send(500);
  });
});

server.post('/user/verification', function(req, res, next) {
  userService.findById(req.body.user).bind({}).then(function(user) {
    this.user = user;
    return renderPromise(userVerificationTemplate, {user: user.toJSON()});
  }).then(function(email) {
    return send(this.user.get('email'), 'Confirme o seu email para participar do Cover Academy.', email);
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "user verification" email to user %d.', req.body.user, err);
    res.send(500);
  });
});

server.post('/audition/submit', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getContest(req.body.contest), contestService.getAudition(req.body.audition)]).bind({}).spread(function(user, contest, audition) {
    this.user = user;
    return renderPromise(auditionSubmitTemplate, {user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON()});
  }).then(function(email) {
    return send(this.user.get('email'), 'Você se inscreveu na competição, aguarde enquanto revisamos o seu vídeo.', email);
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "audition submit" email to user %d.', req.body.user, err);
    res.send(500);
  });
});

server.post('/audition/approved', function(req, res, next) {
  contestService.getAudition(req.body.audition).bind({}).then(function(audition) {
    this.user = audition.related('user');
    return renderPromise(auditionApprovedTemplate, {user: this.user.toJSON(), contest: audition.related('contest').toJSON(), audition: audition.toJSON()});
  }).then(function(email) {
    return send(this.user.get('email'), 'Parabéns, o seu vídeo foi aprovado e você está participando da competição.', email);
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "audition approved" email to user %d.', req.body.user, err);
    res.send(500);
  });
});

server.post('/audition/disapproved', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getContest(req.body.contest)]).bind({}).spread(function(user, contest, audition) {
    this.user = user;
    return renderPromise(auditionDisapprovedTemplate, {user: user.toJSON(), contest: contest.toJSON(), reason: req.body.reason});
  }).then(function(email) {
    return send(this.user.get('email'), 'Infelizmente o seu vídeo não foi aprovado.', email);
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "audition disapproved" email to user %d.', req.body.user, err);
    res.send(500);
  });
});

server.post('/audition/comment', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getComment(req.body.comment, ['audition.user'])]).bind({}).spread(function(user, comment) {
    this.user = user;
    this.comment = comment;
    this.audition = comment.related('audition');
    this.auditionOwner = comment.related('audition').related('user');
    if(this.user.id === this.audition.get('user_id')) {
      return;
    } else {
      return renderPromise(auditionCommentTemplate, {user: this.user.toJSON(), comment: this.comment.toJSON(), audition: this.audition.toJSON()}).bind(this).then(function(email) {
        return send(this.auditionOwner.get('email'), this.user.get('name') + ' comentou sobre a sua audição.', email);
      });
    }
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "audition comment" email to user %d.', this.auditionOwner.id, err);
    res.send(500);
  });
});

server.post('/audition/replyComment', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getComment(req.body.reply, ['repliedComment', 'repliedComment.user', 'repliedComment.audition'])]).bind({}).spread(function(user, reply) {
    this.user = user;
    this.reply = reply;
    this.comment = reply.related('repliedComment');
    this.commentOwner = this.comment.related('user');
    this.audition = this.comment.related('audition');
    if(this.user.id === this.comment.get('user_id')) {
      return;
    } else {
      return renderPromise(auditionReplyCommentTemplate, {user: this.user.toJSON(), reply: this.reply.toJSON(), audition: this.audition.toJSON()}).bind(this).then(function(email) {
        return send(this.commentOwner.get('email'), this.user.get('name') + ' respondeu o seu comentário.', email);
      });
    }
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "audition reply comment" email to user %d.', this.commentOwner.id, err);
    res.send(500);
  });
});

server.post('/contest/inscription', function(req, res, next) {
  Promise.all([contestService.getContest(req.body.contest), contestService.latestContestants()]).spread(function(contest, users) {
    return renderPromise(contestInscriptionTemplate, {contest: contest.toJSON(), permitDisableEmails: true}).then(function(email) {
      return batchSend(users, 'Você já pode se inscrever na competição do Cover Academy.', email, ['name']);
    });
  }).then(function() {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest inscription" email.', err);
    res.send(500);
  });
});

server.post('/contest/next', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    return Promise.all([contest, contestService.listContestants(contest)]);
  }).spread(function(contest, contestants) {
    return renderPromise(contestIsNextTemplate, {contest: contest.toJSON(), permitDisableEmails: true}).then(function(email) {
      return batchSend(contestants, 'A competição vai começar em breve!', email, ['name']);
    });
  }).then(function() {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest next" emails.', err);
    res.send(500);
  });
});

server.post('/contest/start', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    return Promise.all([contest, contestService.latestAuditions(contest), contestService.listNonContestants(contest)]);
  }).spread(function(contest, auditions, nonContestants) {
    auditions.forEach(function(audition) {
      var user = audition.related('user');
      Promise.all([user, renderPromise(contestStartToContestantTemplate, {user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON()})]).spread(function(contestant, email) {
        return send(contestant.get('email'), 'A competição começou, boa sorte!', email).catch(function(err) {
          logger.error('Error sending "contest start" email to contestant %d.', contestant.id, err);
        });
      }).catch(function(err) {
        logger.error('Error rendering template', err);
      });
    });

    if(!nonContestants.isEmpty()) {
      renderPromise(contestStartTemplate, {contest: contest.toJSON(), permitDisableEmails: true}).then(function(email) {
        return batchSend(nonContestants, 'A competição começou, apoie os competidores com o seu voto.', email, ['name']);
      }).catch(function(err) {
        logger.error('Error sending "contest start" email to non contestant users.', err);
      });
    }

    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest start" emails.', err);
    res.send(500);
  });
});

server.post('/contest/incentiveVote', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    return Promise.all([contest, contestService.latestAuditions(contest), contestService.listNonContestants(contest)]);
  }).spread(function(contest, auditions, nonContestants) {
    var remainingTime = moment.duration({days: req.body.daysBeforeTheEnd}).humanize();
    auditions.forEach(function(audition) {
      var user = audition.related('user');
      Promise.all([user, renderPromise(contestIncentiveVoteToContestantTemplate, {user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON(), remainingTime: remainingTime})]).spread(function(contestant, email) {
        return send(contestant.get('email'), remainingTime + ' para terminar a competição, é hora de ganhar mais votos!', email).catch(function(err) {
          logger.error('Error sending "contest incentive vote" email to contestant %d.', contestant.id, err);
        });
      }).catch(function(err) {
        logger.error('Error rendering template', err);
      });
    });

    if(!nonContestants.isEmpty()) {
      renderPromise(contestIncentiveVoteTemplate, {contest: contest.toJSON(), remainingTime: remainingTime, permitDisableEmails: true}).then(function(email) {
        return batchSend(nonContestants, remainingTime + ' para terminar a competição, apoie os competidores com o seu voto!', email, ['name']);
      }).catch(function(err) {
        logger.error('Error sending "contest incentive vote" email to non contestant users.', err);
      });
    }

    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest incentive vote" emails.', err);
    res.send(500);
  });
});

server.post('/contest/invalidVote', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    return Promise.all([contest, contestService.listInvalidVotes(contest)]);
  }).spread(function(contest, invalidVotes) {
    var usersWithInvalidVotesVariables = {};
    var usersWithInvalidVotes = [];
    var contestantsWithInvalidVotesVariables = {};
    var contestantsWithInvalidVotes = [];
    invalidVotes.forEach(function(invalidVote) {
      var audition = invalidVote.related('audition');
      var contestant = audition.related('user');
      var user = invalidVote.related('user');
      usersWithInvalidVotesVariables[user.id] = {};
      usersWithInvalidVotesVariables[user.id].name = user.get('name');
      usersWithInvalidVotesVariables[user.id].contestant = contestant.get('name');
      usersWithInvalidVotesVariables[user.id].audition = audition.toJSON();
      usersWithInvalidVotes.push(user);

      if(!contestantsWithInvalidVotesVariables[contestant.id]) {
        contestantsWithInvalidVotesVariables[contestant.id] = {};
        contestantsWithInvalidVotesVariables[contestant.id].name = contestant.get('name');
        contestantsWithInvalidVotesVariables[contestant.id].audition = audition.toJSON();
        contestantsWithInvalidVotesVariables[contestant.id].totalUsers = 1;
        contestantsWithInvalidVotes.push(contestant);
      } else {
        contestantsWithInvalidVotesVariables[contestant.id].totalUsers = contestantsWithInvalidVotesVariables[contestant.id].totalUsers + 1;
      }
    });
    renderPromise(contestInvalidVoteTemplate, {contest: contest.toJSON()}).then(function(email) {
      return batchSend(usersWithInvalidVotes, 'Seu voto em %recipient.contestant% ainda não é válido!!!', email, usersWithInvalidVotesVariables);
    }).catch(function(err) {
      logger.error('Error sending "contest invalid vote" email to users with invalid votes.', err);
    });

    renderPromise(contestInvalidVoteToContestantTemplate, {contest: contest.toJSON()}).then(function(email) {
      return batchSend(contestantsWithInvalidVotes, 'Você possui %recipient.totalUsers% votos inválidos!!!', email, contestantsWithInvalidVotesVariables);
    }).catch(function(err) {
      logger.error('Error sending "contest invalid vote" email to contestants with invalid votes.', err);
    });

    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest invalid vote" emails.', err);
    res.send(500);
  });
});

server.post('/contest/draw', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    return Promise.all([contest, contestService.latestAuditions(contest), contestService.listNonContestants(contest)]);
  }).spread(function(contest, auditions, nonContestants) {
    auditions.forEach(function(audition) {
      var user = audition.related('user');
      Promise.all([user, renderPromise(contestDrawToContestantTemplate, {user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON()})]).spread(function(contestant, email) {
        return send(contestant.get('email'), 'A competição está empatada, é agora ou nunca!', email).catch(function(err) {
          logger.error('Error sending "contest draw" email to contestant %d.', contestant.id, err);
        });
      }).catch(function(err) {
        logger.error('Error rendering template', err);
      });
    });

    if(!nonContestants.isEmpty()) {
      renderPromise(contestDrawTemplate, {contest: contest.toJSON(), permitDisableEmails: true}).then(function(email) {
        return batchSend(nonContestants, 'A competição está empatada, os competidores precisam do seu apoio!', email, ['name']);
      }).catch(function(err) {
        logger.error('Error sending "contest draw" email to non contestant users.', err);
      });
    }

    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest draw" emails.', err);
    res.send(500);
  });
});

server.post('/contest/finish', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    return Promise.all([contest, contestService.latestAuditions(contest), contestService.listNonContestants(contest)]);
  }).spread(function(contest, auditions, nonWinners) {
    auditions.forEach(function(audition) {
      var user = audition.related('user');
      if(audition.get('place') > 0) {
        var prize = contestService.getPrizeForPlace(contest, audition.get('place'));
        Promise.all([user, renderPromise(contestWinnerTemplate, {user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON(), prize: prize.toJSON()})]).spread(function(contestant, email) {
          return send(contestant.get('email'), 'Parabéns, você foi um dos vencedores!', email).catch(function(err) {
            logger.error('Error sending "contest finish" email to contestant %d.', contestant.id, err);
          });
        }).catch(function(err) {
          logger.error('Error rendering template', err);
        });
      } else {
        nonWinners.add(user);
      }
    });

    if(!nonWinners.isEmpty()) {
      renderPromise(contestFinishTemplate, {contest: contest.toJSON(), isContestant: false, permitDisableEmails: true}).then(function(email) {
        return batchSend(nonWinners, 'A competição terminou, confira o resultado.', email, ['name']);
      }).catch(function(err) {
        logger.error('Error sending "contest finish" email to non contestant users.', err);
      });
    }

    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest finish" emails.', err);
    res.send(500);
  });
});

server.post('/contest/join/contestantFans', function(req, res, next) {
  var contestant = {id: req.body.contestant};
  var contest = {id: req.body.contest};
  Promise.all([contestService.getUserAudition(contestant, contest, ['user', 'contest']), userService.latestFans(contestant)]).spread(function(audition, fans) {
    contestant = audition.related('user');
    contest = audition.related('contest');

    if(!fans.isEmpty()) {
      renderPromise(contestJoinContestantFansTemplate, {contestant: contestant.toJSON(), audition: audition.toJSON(), contest: contest.toJSON(), permitDisableEmails: true}).then(function(email) {
        return batchSend(fans, contestant.get('name') + ' se inscreveu na competição, mostre o seu apoio!', email, ['name']);
      }).catch(function(err) {
        logger.error('Error sending "contest join contestant fans" email to contestant %d fans.', contestant.id, err);
      });
    }

    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest join contestant fans" emails.', err);
    res.send(500);
  });
});

server.post('/contest/join/fans', function(req, res, next) {
  contestService.getContest(req.body.contest).bind({}).then(function(contest) {
    this.contest = contest;
    return contestService.latestAuditions(contest);
  }).then(function(auditions) {
    var that = this;
    var contestantsRelationsPromises = [];
    auditions.forEach(function(audition) {
      if(audition.get('registration_date') < that.contest.get('start_date')) {
        var contestant = audition.related('user');
        contestantsRelationsPromises.push(userService.latestFans(contestant).then(function(fans) {
          return {contestant: contestant, audition: audition, fans: fans};
        }));
      }
    });
    return Promise.all(contestantsRelationsPromises);
  }).then(function(contestantsRelations) {
    var fansRelations = {};
    contestantsRelations.forEach(function(contestantRelations) {
      contestantRelations.fans.forEach(function(fan) {
        if(!fansRelations[fan.id]) {
          fansRelations[fan.id] = {fan: fan, contestants: []};
        }
        fansRelations[fan.id].contestants.push({user: contestantRelations.contestant.toJSON(), audition: contestantRelations.audition.toJSON()});
      });
    });
    return fansRelations;
  }).then(function(fansRelations) {
    var wrappers = [];
    for(var key in fansRelations) {
      var fanRelations = fansRelations[key];
      var lastContestants = partition(fanRelations.contestants, 3);
      var moreContestants = false;
      if(lastContestants.length > 3) {
        lastContestants = lastContestants.slice(0, 3);
        moreContestants = true;
      }
      wrappers.push(new PromiseWrapper(
        Promise.all([fanRelations, renderPromise(contestJoinFansTemplate, {fan: fanRelations.fan.toJSON(), contestants: lastContestants, contest: this.contest.toJSON(), moreContestants: moreContestants})]).spread(function(relations, email) {
          return send(relations.fan.get('email'), 'Os competidores que você gosta estão participando da competição!', email).catch(function(err) {
            logger.error('Error sending "contest join fans" email to user %d.', relations.fan.id, err);
          });
        }).catch(function(err) {
          logger.error('Error rendering template', err);
        })
      ));
    }
    Promise.resolve(wrappers).each(function(wrapper) {
      return wrapper.value();
    }).catch(function(err) {
      logger.error('Error sending "contest join fans" emails.', err);
    });
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest join fans" emails.', err);
    res.send(500);
  });
});

server.listen(settings.postman.port, function() {
  logger.info('%s listening at %s', server.name, server.url);
});