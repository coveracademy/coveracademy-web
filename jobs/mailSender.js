var settings       = require('../configs/settings'),
    logger         = require('../configs/logger'),
    mailService    = require('../apis/mailService'),
    contestService = require('../apis/contestService'),
    userService    = require('../apis/userService'),
    contestService = require('../apis/contestService'),
    restify        = require('restify'),
    nunjucks       = require('nunjucks'),
    path           = require('path'),
    Promise        = require('bluebird');

var server = restify.createServer({
  name: 'mailSender'
});

server.use(restify.queryParser());
server.use(restify.bodyParser());

var mailTemplates = path.join(__dirname, 'mail_templates');
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(mailTemplates));

env.addGlobal('siteUrl', settings.siteUrl);

var userRegistrationTemplate = env.getTemplate('user_registration.tpl');
var userVerificationTemplate = env.getTemplate('user_verification.tpl');
var auditionSubmitTemplate = env.getTemplate('audition_submit.tpl');
var auditionApprovedTemplate = env.getTemplate('audition_approved.tpl');
var auditionDisapprovedTemplate = env.getTemplate('audition_disapproved.tpl');
var contestInscriptionTemplate = env.getTemplate('contest_inscription.tpl');
var contestStartTemplate = env.getTemplate('contest_start.tpl');
var contestStartToContestantTemplate = env.getTemplate('contest_start_contestant.tpl');
var contestDrawTemplate = env.getTemplate('contest_draw.tpl');
var contestDrawToContestantTemplate = env.getTemplate('contest_draw_contestant.tpl');
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
}

server.post('/user/registration', function(req, res, next) {
  userService.findById(req.body.user).then(function(user) {
    this.user = user;
    return renderPromise(userRegistrationTemplate, {user: user.toJSON()});
  }).then(function(email) {
    return mailService.send(this.user.get('email'), 'Bem-vindo ao Cover Academy!', email);
  }).then(function(emailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "user registration" email to user %d: ' + err, req.body.user);
    res.send(500);
  }).bind({});
});

server.post('/user/verification', function(req, res, next) {
  if(req.body.registration === true) {
    userService.findById(req.body.user).then(function(user) {
      this.user = user;
      return renderPromise(userRegistrationTemplate, {user: user.toJSON(), token: req.body.token, verify: true});
    }).then(function(email) {
      return mailService.send(this.user.get('email'), 'Bem-vindo ao Cover Academy!', email);
    }).then(function(emailResponse) {
      res.send(200);
    }).catch(function(err) {
      logger.error('Error sending "user registration" email to user %d: ' + err, req.body.user);
      res.send(500);
    }).bind({});
  } else {
    userService.findById(req.body.user).then(function(user) {
      this.user = user;
      return renderPromise(userVerificationTemplate, {user: user.toJSON(), token: req.body.token});
    }).then(function(email) {
      return mailService.send(this.user.get('email'), 'Confirme o seu email para participar do Cover Academy.', email);
    }).then(function(mailResponse) {
      res.send(200);
    }).catch(function(err) {
      logger.error('Error sending "user verification" email to user %d: ' + err, req.body.user);
      res.send(500);
    }).bind({});
  }
});

server.post('/audition/submit', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getContest(req.body.contest), contestService.getAudition(req.body.audition)]).spread(function(user, contest, audition) {
    this.user = user;
    return renderPromise(auditionSubmitTemplate, {user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON()});
  }).then(function(email) {
    return mailService.send(this.user.get('email'), 'Você se inscreveu na competição, aguarde enquanto revisamos o seu vídeo.', email);
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "audition submit" email to user %d: ' + err, req.body.user);
    res.send(500);
  }).bind({});
});

server.post('/audition/approved', function(req, res, next) {
  contestService.getAudition(req.body.audition).then(function(audition) {
    this.user = audition.related('user');
    return renderPromise(auditionApprovedTemplate, {user: this.user.toJSON(), contest: audition.related('contest').toJSON(), audition: audition.toJSON()});
  }).then(function(email) {
    return mailService.send(this.user.get('email'), 'Parabéns, o seu vídeo foi aprovado e você está participando da competição.', email);
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "audition approved" email to user %d: ' + err, req.body.user);
    res.send(500);
  }).bind({});
});

server.post('/audition/disapproved', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getContest(req.body.contest)]).spread(function(user, contest, audition) {
    this.user = user;
    return renderPromise(auditionDisapprovedTemplate, {user: user.toJSON(), contest: contest.toJSON(), reason: req.body.reason});
  }).then(function(email) {
    return mailService.send(this.user.get('email'), 'Infelizmente o seu vídeo não foi aprovado.', email);
  }).then(function(mailResponse) {
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "audition disapproved" email to user %d: ' + err, req.body.user);
    res.send(500);
  }).bind({});
});

server.post('/contest/inscription', function(req, res, next) {
  Promise.all([contestService.getContest(req.body.contest), userService.listAllUsers()]).spread(function(contest, allUsers) {
    allUsers.forEach(function(user) {
      renderPromise(contestInscriptionTemplate, {user: user.toJSON(), contest: contest.toJSON()}).then(function(email) {
        mailService.send(user.get('email'), 'Você já pode se inscrever na competição do Cover Academy.', email);
      });
    });
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest inscription" email: ' + err);
    res.send(500);
  }).bind({});
});

server.post('/contest/start', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    this.contest = contest;
    return Promise.all([contestService.latestAuditions(contest), contestService.listNonContestants(contest)]);
  }).spread(function(auditions, nonContestants) {
    auditions.forEach(function(audition) {
      var user = audition.related('user');
      renderPromise(contestStartToContestantTemplate, {user: user.toJSON(), contest: this.contest.toJSON(), audition: audition.toJSON()}).then(function(email) {
        mailService.send(user.get('email'), 'A competição começou, boa sorte!', email);
      });
    });
    nonContestants.forEach(function(user) {
      renderPromise(contestStartTemplate, {user: user.toJSON(), contest: this.contest.toJSON()}).then(function(email) {
        mailService.send(user.get('email'), 'A competição começou, apoie os competidores com o seu voto.', email);
      });
    });
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest start" email: ' + err);
    res.send(500);
  }).bind({});
});

server.post('/contest/draw', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    this.contest = contest;
    return Promise.all([contestService.latestAuditions(contest), contestService.listNonContestants(contest)]);
  }).spread(function(auditions, nonContestants) {
    auditions.forEach(function(audition) {
      var user = audition.related('user');
      renderPromise(contestDrawToContestantTemplate, {user: user.toJSON(), contest: this.contest.toJSON(), audition: audition.toJSON()}).then(function(email) {
        mailService.send(user.get('email'), 'A competição está empatada, é agora ou nunca!', email);
      });
    });
    nonContestants.forEach(function(user) {
      renderPromise(contestDrawTemplate, {user: user.toJSON(), contest: this.contest.toJSON()}).then(function(email) {
        mailService.send(user.get('email'), 'A competição está empatada, os competidores precisam do seu apoio!', email);
      });
    });
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest draw" email: ' + err);
    res.send(500);
  }).bind({});
});

server.post('/contest/finish', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    this.contest = contest;
    return Promise.all([contestService.latestAuditions(contest), contestService.listNonContestants(contest)]);
  }).spread(function(auditions, nonContestants) {
    auditions.forEach(function(audition) {
      var user = audition.related('user');
      if(audition.get('place') > 0) {
        var prize = contestService.getPrizeForPlace(this.contest, audition.get('place'));
        renderPromise(contestWinnerTemplate, {user: user.toJSON(), contest: this.contest.toJSON(), audition: audition.toJSON(), prize: prize.toJSON()}).then(function(email) {
          mailService.send(user.get('email'), 'Parabéns, você foi um dos vencedores!', email);
        });
      } else {
        renderPromise(contestFinishTemplate, {user: user.toJSON(), contest: this.contest.toJSON(), isContestant: true}).then(function(email) {
          mailService.send(user.get('email'), 'A competição terminou, confira o resultado.', email);
        });
      }
    });
    nonContestants.forEach(function(user) {
      renderPromise(contestFinishTemplate, {user: user.toJSON(), contest: this.contest.toJSON(), isContestant: false}).then(function(email) {
        mailService.send(user.get('email'), 'A competição terminou, confira o resultado.', email);
      });
    });
    res.send(200);
  }).catch(function(err) {
    logger.error('Error sending "contest finish" email: ' + err);
    res.send(500);
  }).bind({});
});

server.listen(settings.mailPort, function() {
  logger.info('%s listening at %s', server.name, server.url);
});