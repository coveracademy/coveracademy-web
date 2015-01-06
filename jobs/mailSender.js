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
var contestStartTemplate = env.getTemplate('contest_start.tpl');
var contestWinnerTemplate = env.getTemplate('contest_winner.tpl');

server.post('/user/registration', function(req, res, next) {
  userService.findById(req.body.user).then(function(user) {
    userRegistrationTemplate.render({user: user.toJSON()}, function(err, email) {
      mailService.send(user.get('email'), 'Bem-vindo ao Cover Academy', email).then(function(mailResponse) {
        res.send(200);
      });
    });
  }).catch(function(err) {
    logger.error('Error sending "user registration" email to user %d: ' + err, req.body.user);
    res.send(500);
  });
});

server.post('/user/verification', function(req, res, next) {
  userService.findById(req.body.user).then(function(user) {
    userVerificationTemplate.render({user: user.toJSON(), token: req.body.token}, function(err, email) {
      mailService.send(user.get('email'), 'Confirme o seu email para participar do Cover Academy', email).then(function(mailResponse) {
        res.send(200);
      });
    });
  }).catch(function(err) {
    logger.error('Error sending "user verification" email to user %d: ' + err, req.body.user);
    res.send(500);
  });
});

server.post('/audition/submit', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getContest(req.body.contest), contestService.getAudition(req.body.audition)]).spread(function(user, contest, audition) {
    auditionSubmitTemplate.render({user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON()}, function(err, email) {
      mailService.send(user.get('email'), 'Você se inscreveu na competição, aguarde enquanto revisamos o seu vídeo!', email).then(function(mailResponse) {
        res.send(200);
      });
    });
  }).catch(function(err) {
    logger.error('Error sending "audition submit" email to user %d: ' + err, req.body.user);
    res.send(500);
  });
});

server.post('/audition/approved', function(req, res, next) {
  contestService.getAudition(req.body.audition).then(function(audition) {
    var user = audition.related('user');
    auditionApprovedTemplate.render({user: user.toJSON(), contest: audition.related('contest').toJSON(), audition: audition.toJSON()}, function(err, email) {
      mailService.send(user.get('email'), 'Parabéns, o seu vídeo foi aprovado e você está participando da competição!', email).then(function(mailResponse) {
        res.send(200);
      });
    });
  }).catch(function(err) {
    logger.error('Error sending "audition approved" email to user %d: ' + err, req.body.user);
    res.send(500);
  });
});

server.post('/audition/disapproved', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getContest(req.body.contest)]).spread(function(user, contest, audition) {
    auditionDisapprovedTemplate.render({user: user.toJSON(), contest: contest.toJSON(), reason: req.body.reason}, function(err, email) {
      mailService.send(user.get('email'), 'Sentimos muito, mas infelizmente o seu vídeo não foi aprovado =(', email).then(function(mailResponse) {
        res.send(200);
      });
    });
  }).catch(function(err) {
    logger.error('Error sending "audition disapproved" email to user %d: ' + err, req.body.user);
    res.send(500);
  });
});


server.post('/contest/start', function(req, res, next) {
  contestService.getContest(req.body.contest).then(function(contest) {
    this.contest = contest;
    return contestService.latestAuditions(contest);
  }).then(function(auditions) {
    auditions.forEach(function(audition) {
      var user = audition.related('user');
      contestStartTemplate.render({user: user.toJSON(), contest: this.contest.toJSON(), audition: audition.toJSON()}, function(err, email) {
        mailService.send(user.get('email'), 'A competição começou, boa sorte!', email).then(function(mailResponse) {
          res.send(200);
        });
      });
    });
  }).catch(function(err) {
    logger.error('Error sending "contest start" email: ' + err);
    res.send(500);
  }).bind({});
});

server.post('/contest/winner', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getContest(req.body.contest), contestService.getAudition(req.body.audition)]).spread(function(user, contest, audition) {
    contestWinnerTemplate.render({user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON()}, function(err, email) {
      mailService.send(user.get('email'), 'Parabéns, você venceu a competição!', email).then(function(mailResponse) {
        res.send(200);
      });
    });
  }).catch(function(err) {
    logger.error('Error sending "contest winner" email to user %d: ' + err, req.body.user);
    res.send(500);
  });
});

server.listen(settings.mailPort, function() {
  logger.info('%s listening at %s', server.name, server.url);
});