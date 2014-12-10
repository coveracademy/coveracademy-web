var restify        = require('restify'),
    nunjucks       = require('nunjucks'),
    path           = require('path'),
    Promise        = require('bluebird'),
    settings       = require('../configs/settings'),
    mailService    = require('../apis/mailService'),
    contestService = require('../apis/contestService'),
    userService    = require('../apis/userService'),
    contestService = require('../apis/contestService');

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
var contestJoinTemplate = env.getTemplate('contest_join.tpl');
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
    console.log('Error sending "user registration" email to user ' + req.body.user + ': ' + err);
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
    console.log('Error sending "user verification" email to user ' + req.body.user + ': ' + err);
    res.send(500);
  });
});

server.post('/contest/join', function(req, res, next) {
  Promise.all([userService.findById(req.body.user), contestService.getContest(req.body.contest), contestService.getAudition(req.body.audition)]).spread(function(user, contest, audition) {
    contestJoinTemplate.render({user: user.toJSON(), contest: contest.toJSON(), audition: audition.toJSON()}, function(err, email) {
      mailService.send(user.get('email'), 'Você está inscrito na competição, boa sorte!', email).then(function(mailResponse) {
        res.send(200);
      });
    });
  }).catch(function(err) {
    console.log('Error sending "contest join" email to user ' + req.body.user + ': ' + err);
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
    console.log('Error sending "contest start" email: ' + err);
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
    console.log('Error sending "contest winner" email to user ' + req.body.user + ': ' + err);
    res.send(500);
  });
});

server.listen(settings.mailingPort, function() {
  console.log('%s listening at %s', server.name, server.url);
});