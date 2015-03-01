"use strict"

var winston    = require('winston'),
    properties = require('./properties');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, colorize: true, level: properties.getValue('log.level', 'info')})
  ]
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.debug(message);
  }
};