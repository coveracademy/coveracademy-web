var settings = require('./settings');

exports.configure = function(app) {
  console.log('Configuring middlewares');

  app.use(function(req, res, next) {
    res.locals.backendData = {
      user: req.user
    };
    next();
  });

  // production only
  if('prod' == app.get('env')) {
    app.use(require('prerender-node').set('prerenderServiceUrl', settings.prerenderServiceURL));
  }

}