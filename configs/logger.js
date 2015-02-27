"use strict"

var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, colorize: true}),
    new (winston.transports.File)({filename: 'cover-academy.log'})
  ]
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.debug(message);
  }
};