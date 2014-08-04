var settings   = require('../../configs/settings'),
    Promise    = require('bluebird'),
    LastFmNode = require('lastfm').LastFmNode,
    _          = require('underscore');

var lastfm = new LastFmNode({
  api_key: settings.lastfmKey,
  secret: settings.lastfmSecret,
  useragent: 'cover_challenge'
});

var genres = {
  'Rock': ['.*rock', '.*metal', '.*core', '.*punk', 'indie', 'alternative', 'emo', 'grunge', 'screamo', 'progressive'],
  'Rhythm and blues': ['rhythm and blues', 'rnb', 'r and b', 'r&b', '.*soul', 'disco'],
  'Pop': ['.*pop'],
  'Hip-hop/Rap': ['.*hip-hop', '.*hip hop', '.*hiphop', '.*rap'],
  'Country': ['.*country'],
  'Blues': ['.*blues'],
  'Jazz': ['.*jazz'],
  'Electronic': ['.*electronic', '.*electronica', '.*trance', '.*techno', '.*electro', 'dubstep', 'dub step', '.*dub']
}

function createGenresRegexps() {
  var genresRegexps = {}
  _.forEach(_.keys(genres), function(genre) {
    genresRegexps[genre] = new RegExp(genres[genre].join('|'));
  });
  return genresRegexps;
}

var genresRegexps = createGenresRegexps();

function findGenre(tags) {
  _.forEach(tags, function(tag) {
    _.forEach(_.keys(genresRegexps), function(genre) {
      if(genresRegexps[genre].test(tag.name)) {
        console.log(genre)
        return genre;
      }
    });
  });
  return null;
}

exports.getArtistInfos = function(artistName) {
  return new Promise(function(resolve, reject) {
    lastfm.info("artist", {
      artist: artistName,
      handlers: {
        success: function(data) {
          var artistInfos = {};
          artistInfos.name = data.name;
          artistInfos.thumbnails = {};
          artistInfos.musicGenre = findGenre(data.tags.tag);
          _.forEach(data.image, function(image) {
            if('large' == image.size) {
              artistInfos.thumbnails.small = image['#text'];
            } else if('extralarge' == image.size) {
              artistInfos.thumbnails.medium = image['#text'];
            } else if('mega' == image.size) {
              artistInfos.thumbnails.large = image['#text'];
            }
          });
          resolve(artistInfos);
        },
        error: function(error) {
          reject(error);
        }
      }
    });
  });
}

exports.getMusicInfos = function(artistName, musicName) {
  return new Promise(function(resolve, reject) {
    lastfm.info("track", {
      artist: artistName,
      track: musicName,
      handlers: {
        success: function(data) {
          resolve(data);
        },
        error: function(error) {
          reject(error);
        }
      }
    });
  });
}

this.getArtistInfos('Papa Roach').then(function(artistInfos) {
  console.log(artistInfos);
});