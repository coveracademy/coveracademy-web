'use strict';

require('newrelic');
require('pmx').init();

var express        = require('express'),
    favicon        = require('serve-favicon'),
    morgan         = require('morgan'),
    flash          = require('connect-flash'),
    cookieParser   = require('cookie-parser'),
    bodyParser     = require('body-parser'),
    session        = require('express-session'),
    RedisStore     = require('connect-redis')(session),
    passport       = require('passport'),
    engine         = require('./configs/engine'),
    routes         = require('./configs/routes'),
    middlewares    = require('./configs/middlewares'),
    authentication = require('./configs/authentication'),
    settings       = require('./configs/settings'),
    logger         = require('./configs/logger'),
    serverLogger   = require('./configs/server-logger');

var app = express();

app.set('env', settings.nodeEnv);
app.set('port', settings.nodePort);
app.set('views', settings.viewsPath);
app.set('public', settings.publicPath);

app.use(favicon(settings.publicPath + '/img/favicon.ico'));
app.use(morgan({format: 'tiny', stream: serverLogger.stream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(flash());
app.use(session({
  secret: 'coveracademy',
  resave: true,
  saveUninitialized: true,
  store: new RedisStore({
    host: settings.redis.host,
    port: settings.redis.port,
    pass: settings.redis.password,
    prefix: 'session:'
  })
}));
app.use(express.static(app.get('public')));

middlewares.configure(app);
engine.configure(app);
authentication.configure(app, passport);
routes.configure(express, app, passport);

var server = app.listen(app.get('port'), function() {
  logger.info('Cover Academy server is listening on port %s', server.address().port);
});