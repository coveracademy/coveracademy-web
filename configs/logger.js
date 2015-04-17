'use strict'

var winston    = require('winston'),
    properties = require('./properties');

var level = properties.getValue('app.debug', false) === true ? 'debug' : 'info';

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, colorize: true, level: level, debugStdout: level === 'debug' ? true : false}),
    new (winston.transports.File)({filename: 'cover-academy.log', level: level})
  ]
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.debug(message);
  }
};