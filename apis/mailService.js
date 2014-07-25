var	Mailgun      = require('mailgun-js'),
    Promise      = require('bluebird'),
    settings     = require('../configs/settings'),
    apiKey       = settings.email.apiKey,
    domain       = settings.email.domain,
    emailContact = settings.email.contact,
    mailgun      = new Mailgun({apiKey: apiKey, domain: domain})

exports.sendEmail = function(fromName, from, subject, text) {
  return new Promise(function(resolve, reject) {
  	mailgun.messages().send({from: fromName + ' <' + from + '>', to: emailContact, subject: '[Promessa de Político] ' + subject, text: text}, function (err, body) {
      if(err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}