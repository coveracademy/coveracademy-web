"use strict"

var settings = require('./settings'),
    logger   = require('./logger');

exports.configure = function(app) {
  logger.info('Configuring middlewares');

  // Production only
  if('prod' == app.get('env')) {
    app.use(require('prerender-node').set('prerenderServiceUrl', settings.prerenderUrl));
  }
}