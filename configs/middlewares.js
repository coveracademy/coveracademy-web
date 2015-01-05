var settings = require('./settings');

exports.configure = function(app) {
  console.log('Configuring middlewares');

  // Production only
  if('prod' == app.get('env')) {
    app.use(require('prerender-node').set('prerenderServiceUrl', settings.prerender));
  }
}