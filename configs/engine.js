'use strict'

var logger   = require('./logger'),
    nunjucks = require('nunjucks');

exports.configure = function(app) {
  logger.info('Configuring view engine');

  app.engine('html', nunjucks.render);
  var env = nunjucks.configure(app.get('views'), {
    tags: {
      blockStart: '<%',
      blockEnd: '%>',
      variableStart: '<$',
      variableEnd: '$>',
      commentStart: '<#',
      commentEnd: '#>'
    },
    autoescape: true,
    express: app
  });
};
