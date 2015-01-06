var logger   = require('./logger'),
    nunjucks = require('nunjucks'),
    _        = require('underscore');

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

  env.addFilter('where', function(collection, conditions) {
    return _.where(collection, conditions);
  });

  env.addFilter('findWhere', function(collection, conditions) {
    return _.findWhere(collection, conditions);
  });

  env.addFilter('jsonString', function(jsonObject) {
    return env.getFilter('safe')(JSON.stringify(jsonObject));
  });
}