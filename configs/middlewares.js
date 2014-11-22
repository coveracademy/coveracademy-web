var settings = require('./settings');

exports.configure = function(app) {
  console.log('Configuring middlewares');

  // production only
  if('prod' == app.get('env')) {
    app.use(require('prerender-node').set('prerenderServiceUrl', settings.prerenderServiceURL));
  }
}