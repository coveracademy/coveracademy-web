var path = require('path'),
    _nodeEnv = process.env.NODE_ENV || 'dev',
    _nodeIP = process.env.NODE_IP || '127.0.0.1',
    _nodePort = process.env.NODE_PORT || 3000,
    _publicPath = path.join(__dirname, '../public'),
    _viewsPath = path.join(__dirname, '../views'),
    _oembedApiKey = '1e9d27d76b02e60bc0afdf',
    _envs = {
      dev: {
        email: {
          contact: 'sandro.csimas@gmail.com',
          apiKey: 'key-8k25kie96mv1wpdi01gnqu47-nos-0y1',
          domain: 'coverchallenge.com'
        },
        database: {
          dialect: 'mysql',
          host: 'localhost',
          user: 'root',
          password: 'sandroa1s2d3',
          schema: 'cover_challenge',
          charset: 'utf8',
          debug: true
        },
        facebook: {
          clientID: '235774129950285',
          clientSecret: '329ada86e67ca322ae5c56af8f5a167d',
          callbackURL: 'http://www.coverchallenge.com:' + _nodePort + '/auth/facebook/callback',
          profileFields: ['name', 'displayName', 'gender', 'picture.type(small)', 'emails']
        },
        twitter: {
          consumerKey: 'SXAZVFlQalUVp1hZwFX2gYK0l',
          consumerSecret: '0gmtYviV8VpASXmtLG5cLB41jI8ofcAVIP7Wfy16tIGoUXAGmX',
          callbackURL: 'http://www.coverchallenge.com:' + _nodePort + '/auth/twitter/callback'
        },
        google: {
          clientID: '37782263354-thqn9d44li64finmomvf5es38h0f4r73.apps.googleusercontent.com',
          clientSecret: 'x1TrI6h07SjHyWzQA_Tjpsk1',
          callbackURL: 'http://www.coverchallenge.com:' + _nodePort + '/auth/google/callback'
        }
      },
      prod: {
        prerenderServiceURL: "http://127.0.0.1:9000",
        email: {
          contact: 'sandro.csimas@gmail.com',
          apiKey: 'key-8k25kie96mv1wpdi01gnqu47-nos-0y1',
          domain: 'coverchallenge.com'
        },
        database: {
          dialect: 'mysql',
          host: 'localhost',
          user: 'root',
          password: 'roota1s2d3',
          schema: 'cover_challenge',
          charset: 'utf8',
          debug: false
        },
        facebook: {
          clientID: '235774129950285',
          clientSecret: '329ada86e67ca322ae5c56af8f5a167d',
          callbackURL: 'http://www.coverchallenge.com/auth/facebook/callback',
          profileFields: ['name', 'displayName', 'gender', 'picture.type(small)', 'emails']
        },
        twitter: {
          consumerKey: 'SXAZVFlQalUVp1hZwFX2gYK0l',
          consumerSecret: '0gmtYviV8VpASXmtLG5cLB41jI8ofcAVIP7Wfy16tIGoUXAGmX',
          callbackURL: 'http://www.coverchallenge.com/auth/twitter/callback'
        },
        google: {
          clientID: '37782263354-thqn9d44li64finmomvf5es38h0f4r73.apps.googleusercontent.com',
          clientSecret: 'x1TrI6h07SjHyWzQA_Tjpsk1',
          callbackURL: 'http://www.coverchallenge.com/auth/google/callback'
        }
      }
    }

console.log('Using ' + _nodeEnv + ' environment settings');

exports.nodeEnv = _nodeEnv;
exports.nodePort = _nodePort;
exports.nodeIP = _nodeIP;
exports.publicPath = _publicPath;
exports.viewsPath = _viewsPath;
exports.oembedApiKey = _oembedApiKey;

var env = _envs[_nodeEnv];
for(property in env) {
  exports[property] = env[property];
}