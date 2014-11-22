var path = require('path'),
    _debug = process.env.DEBUG && process.env.DEBUG === 'true' ? true : false,
    _nodeEnv = process.env.NODE_ENV || 'dev',
    _nodeIP = process.env.NODE_IP || '127.0.0.1',
    _nodePort = process.env.NODE_PORT || 3000,
    _mailingPort = process.env.MAILING_PORT || 5000,
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
    _envs = {
      dev: {
        email: {
          contact: 'sandro.csimas@gmail.com',
          apiKey: 'key-335a52e99eb6d3aac9abc94e791a6738'
        },
        database: {
          dialect: 'mysql',
          host: 'localhost',
          user: 'root',
          password: 'sandroa1s2d3',
          schema: 'cover_academy',
          charset: 'utf8',
          debug: true
        }
      },
      prod: {
        prerenderServiceURL: "http://127.0.0.1:9000",
        email: {
          contact: 'sandro.csimas@gmail.com',
          apiKey: 'key-335a52e99eb6d3aac9abc94e791a6738'
        },
        database: {
          dialect: 'mysql',
          host: 'localhost',
          user: 'root',
          password: 'roota1s2d3',
          schema: 'cover_academy',
          charset: 'utf8',
          debug: false
        }
      }
    }

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
exports.mailingPort = _mailingPort;

exports.facebook = _facebook;
exports.twitter = _twitter;
exports.google = _google;
exports.youtube = _youtube;

var env = _envs[_nodeEnv];
for(property in env) {
  exports[property] = env[property];
}