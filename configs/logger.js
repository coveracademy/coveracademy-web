'use strict'

var winston    = require('winston'),
    properties = require('./properties');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, colorize: true, level: properties.getValue('log.level', 'info'), debugStdout: properties.getValue('log.level', 'info') === 'debug' ? true : false}),
    new (winston.transports.File)({filename: 'cover-academy.log', level: properties.getValue('log.level', 'info')})
  ]
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.debug(message);
  }
};