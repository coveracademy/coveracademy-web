var	Mailgun      = require('mailgun-js'),
    Promise      = require('bluebird'),
    settings     = require('../configs/settings'),
    restify      = require('restify'),
    domain       = settings.domain,
    apiKey       = settings.email.apiKey,
    emailContact = settings.email.contact,
    mailgun      = new Mailgun({apiKey: apiKey, domain: domain}),
    mailClient   = restify.createJsonClient(settings.siteUrl + ':' + settings.mailingPort);

exports.receive = function(fromName, from, subject, text) {
  return new Promise(function(resolve, reject) {
  	mailgun.messages().send({from: fromName + ' <' + from + '>', to: emailContact, subject: '[Cover Academy] ' + subject, html: text}, function (err, body) {
      if(err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

exports.send = function(to, subject, text) {
  return new Promise(function(resolve, reject) {
    mailgun.messages().send({from: 'Cover Academy' + ' <' + emailContact + '>', to: to, subject: '[Cover Academy] ' + subject, html: text}, function (err, body) {
      if(err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

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
}

exports.userVerification = function(user, verificationToken) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/user/verification', {user: user.id, token: verificationToken.get('token')}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
}

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
 }


exports.auditionApproved = function(user, contest, audition) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/audition/approved', {user: user.id, contest: contest.id, audition: audition.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
}

exports.auditionDisapproved = function(user, contest, audition) {
  return new Promise(function(resolve, reject) {
    mailClient.post('/audition/disapproved', {user: user.id, contest: contest.id, audition: audition.id}, function(err, req, res, obj) {
      if(err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
}


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
}

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
}