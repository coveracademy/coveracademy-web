var settings     = require('../configs/settings'),
    Mailgun      = require('mailgun-js'),
    Promise      = require('bluebird'),
    restify      = require('restify'),
    domain       = settings.domain,
    apiKey       = settings.email.apiKey,
    emailContact = settings.email.contact,
    mailgun      = new Mailgun({apiKey: apiKey, domain: domain}),
    mailClient   = restify.createJsonClient(settings.siteUrl + ':' + settings.mailPort);

exports.receive = function(fromName, from, subject, text) {
  return new Promise(function(resolve, reject) {
  	mailgun.messages().send({from: fromName + ' <' + from + '>', to: emailContact, subject: subject, html: text}, function (err, body) {
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
    mailgun.messages().send({from: 'Cover Academy <' + emailContact + '>', to: to, subject: subject, html: text}, function (err, body) {
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
}

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
}

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
}

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
}

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
}


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