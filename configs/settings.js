var properties = require('./properties'),
    logger     = require('./logger'),
    path       = require('path'),
    config     = properties.load();

try {
  var _debug = properties.getValue(config, 'app.debug', false),
      _nodeEnv = properties.getValue(config, 'app.env', 'dev'),
      _nodeIP = properties.getValue(config, 'app.ip', '127.0.0.1'),
      _nodePort = properties.getValue(config, 'app.port', 3000),
      _mailPort = properties.getValue(config, 'app.mailPort', 5000),
      _publicPath = path.join(__dirname, '../public'),
      _viewsPath = path.join(__dirname, '../views'),
      _tmpUploadPath = path.join(__dirname, '../tmp'),
      _oembedAPIKey = '0d7e9ac5890d98a8fa0c47',
      _lastfmKey = '33623b4ad36e7ce8591b5247c2c51f72',
      _lastfmSecret = '06bb829a0c65fdd087fc0d89f1f7e9f3',
      _googleAPIKey = 'AIzaSyCuzyRHXYYPKj3eNaiKlrK2e0cnYrrFLiY',
      _siteUrl = 'http://www.coveracademy.com',
      _domain = 'coveracademy.com',
      _facebook = {
        clientID: '329761620528304',
        clientSecret: '9331e1f0ee96c8ea7789a22e55aacdba',
        callbackURL: _siteUrl + '/api/auth/facebook/callback',
        profileFields: ['name', 'displayName', 'gender', 'picture.type(large)', 'emails', 'profileUrl'],
        scope: ['email']
      },
      _twitter = {
        consumerKey: '0mB4ErjFy98T1b2POJKSuqTOH',
        consumerSecret: 'AQC63tuLcet6uopVS5GQ87hknHAYd3GOfNDyedyOT1gEr0W5Vb',
        callbackURL: _siteUrl + '/api/auth/twitter/callback',
        profileFields: ['name', 'displayName', 'gender', 'picture.type(large)', 'emails', 'profileUrl']
      },
      _google = {
        clientID: '787515950155-dpukm9vvm6u7ei2ma91nrhmvnsmusptn.apps.googleusercontent.com',
        clientSecret: 'gvSQc8Ewwf7aQz4eq6nYlPwI',
        callbackURL: _siteUrl + '/api/auth/google/callback',
        profileFields: ['name', 'displayName', 'gender', 'picture.type(large)', 'emails', 'profileUrl'],
        scope: ['email']
      },
      _youtube = {
        clientID: '787515950155-j2a0kdrlr9cut1vmi78bin0673cvap86.apps.googleusercontent.com',
        clientSecret: 'Te2kt4UghFIlrWV3U6MSOETt',
        callbackURL: _siteUrl + '/api/auth/youtube/callback',
        profileURL: 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true',
        scope: ['https://www.googleapis.com/auth/youtube.readonly']
      },
      _email = {
        contact: 'sandro.csimas@gmail.com',
        apiKey: 'key-335a52e99eb6d3aac9abc94e791a6738'
      },
      _database = {
        dialect: properties.getValue(config, 'database.dialect', 'mysql'),
        host: properties.getValue(config, 'database.host', 'localhost'),
        port: properties.getValue(config, 'database.port', 3306),
        user: properties.getValue(config, 'database.user', 'root'),
        password: properties.getValue(config, 'database.password'),
        schema: properties.getValue(config, 'database.schema', 'cover_academy'),
        charset: properties.getValue(config, 'database.charset', 'utf8')
      },
      _redis = {
        host: properties.getValue(config, 'redis.host', 'localhost'),
        port: properties.getValue(config, 'redis.port', 6379),
        password: properties.getValue(config, 'redis.password')
      },
      _envs = {
        prod: {
          prerenderUrl: properties.getValue(config, 'prerender.url', 'http://localhost:9000')
        }
      };

  logger.info('Using %s environment settings', _nodeEnv);
  if(_debug === true) {
    logger.info('Debug mode is ON');
  }

  exports.debug = _debug;
  exports.nodeEnv = _nodeEnv;
  exports.nodePort = _nodePort;
  exports.nodeIP = _nodeIP;
  exports.publicPath = _publicPath;
  exports.viewsPath = _viewsPath;
  exports.tmpUploadPath = _tmpUploadPath;
  exports.oembedApiKey = _oembedAPIKey;
  exports.lastfmKey = _lastfmKey;
  exports.lastfmSecret = _lastfmSecret;
  exports.googleAPIKey = _googleAPIKey;
  exports.siteUrl = _siteUrl;
  exports.domain = _domain;
  exports.mailPort = _mailPort;

  exports.facebook = _facebook;
  exports.twitter = _twitter;
  exports.google = _google;
  exports.youtube = _youtube;

  exports.email = _email;
  exports.database = _database;
  exports.redis = _redis;

  var env = _envs[_nodeEnv];
  for(property in env) {
    exports[property] = env[property];
  }
} catch(err) {
  logger.error('Error loading settings: ' + err);
}