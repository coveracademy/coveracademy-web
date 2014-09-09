var Promise = require('bluebird');

module.exports = function(router, app) {

  app.get('/sitemap.xml', function(req, res, next) {
    res.header('Content-Type', 'application/xml');
    res.render('seo/sitemap.xml');
  });

  app.get('/robots.txt', function(req, res, next) {
    res.header('Content-Type', 'text/plain');
    res.render('seo/robots.txt');
  });

  app.get('/*', function(req, res, next) {
    res.render('index.html');
  });

}