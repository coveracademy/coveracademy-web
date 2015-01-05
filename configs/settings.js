var properties = require('./properties');
try {
  var config = properties.load(),
      path = require('path'),
      _debug = config.app.debug && config.app.debug === 'true' ? true : false,
      _nodeEnv = config.app.env || 'dev',
      _nodeIP = config.app.ip || '127.0.0.1',
      _nodePort = config.app.port || 3000,
      _mailPort = config.app.mailPort || 5000,
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
        profileFields: ['name', 'displayName', 'gender', 'picture.type(large)', 'emails'],
        scope: ['email']
      },
      _twitter = {
        consumerKey: '0mB4ErjFy98T1b2POJKSuqTOH',
        consumerSecret: 'AQC63tuLcet6uopVS5GQ87hknHAYd3GOfNDyedyOT1gEr0W5Vb',
        callbackURL: _siteUrl + '/api/auth/twitter/callback',
        profileFields: ['name', 'displayName', 'gender', 'picture.type(large)', 'emails']
      },
      _google = {
        clientID: '787515950155-dpukm9vvm6u7ei2ma91nrhmvnsmusptn.apps.googleusercontent.com',
        clientSecret: 'gvSQc8Ewwf7aQz4eq6nYlPwI',
        callbackURL: _siteUrl + '/api/auth/google/callback',
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
        dialect: config.database.dialect || 'mysql',
        host: config.database.host || 'localhost',
        port: config.database.port || 3306,
        user: config.database.user || 'root',
        password: config.database.password,
        schema: config.database.schema || 'cover_academy',
        charset: config.database.charset || 'utf8'
      },
      _redis = {
        host: config.redis.host || 'localhost',
        port: config.redis.port || '6379',
        password: config.redis.password
      },
      _envs = {
        prod: {
          prerender: config.prerender || "http://localhost:9000"
        }
      };

  console.log('Using ' + _nodeEnv + ' environment settings');
  if(_debug === true) {
    console.log('Debug mode is ON');
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
  console.log(err);
}
