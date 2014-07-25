var Promise = require('bluebird');

module.exports = function(router, app) {

  app.get('/', function(req, res, next) {
    res.render('index.html');
  });

}