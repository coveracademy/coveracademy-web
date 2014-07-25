var express        = require('express'),
    path           = require('path'),
    favicon        = require('static-favicon'),
    logger         = require('morgan'),
    cookieParser   = require('cookie-parser'),
    bodyParser     = require('body-parser'),
    passport       = require('passport'),
    engine         = require('./configs/engine'),
    routes         = require('./configs/routes'),
    middlewares    = require('./configs/middlewares'),
    authentication = require('./configs/authentication'),
    settings       = require('./configs/settings');

var app = express();

app.set('env', settings.nodeEnv);
app.set('port', settings.nodePort);
app.set('views', settings.viewsPath);
app.set('public', settings.publicPath);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(app.get('public')));

engine.configure(app);
middlewares.configure(app);
authentication.configure(app, passport);
routes.configure(express, app, passport);

module.exports = app;