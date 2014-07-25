exports.configure = function(app) {
  console.log('Configuring middlewares');

  app.use(function(req, res, next) {
    res.locals.backendData = {
      user: req.user
    };
    next();
  });
}