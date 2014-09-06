var	Mailgun      = require('mailgun-js'),
    Promise      = require('bluebird'),
    settings     = require('../configs/settings'),
    domain       = settings.domain,
    apiKey       = settings.email.apiKey,
    emailContact = settings.email.contact,
    mailgun      = new Mailgun({apiKey: apiKey, domain: domain})

exports.sendEmail = function(fromName, from, subject, text) {
  return new Promise(function(resolve, reject) {
  	mailgun.messages().send({from: fromName + ' <' + from + '>', to: emailContact, subject: '[Cover Academy] ' + subject, text: text}, function (err, body) {
      if(err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}