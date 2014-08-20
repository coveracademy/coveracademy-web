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
  'Acoustic': ['acoustic'],
  'Rock': ['.*rock', '.*metal', '.*core', '.*punk', 'indie', 'alternative', 'emo', 'grunge', 'screamo', 'progressive'],
  'Pop': ['.*pop'],
  'Rhythm and blues': ['rhythm and blues', 'rnb', 'r and b', 'r&b', '.*soul', 'disco'],
  'Country': ['.*country'],
  'Hip-hop': ['.*hip-hop', '.*hip hop', '.*hiphop'],
  'Rap': ['.*rap'],
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
  var genre = _.find(_.keys(genresRegexps), function(genre) {
    var tag = _.find(tags, function(tag) {
      return genresRegexps[genre].test(tag.name);
    });
    if(tag) {
      return true;
    }
  });
  return genre;
}

exports.getArtistInfos = function(artistName) {
  return new Promise(function(resolve, reject) {
    lastfm.info("artist", {
      artist: artistName,
      autocorrect: 1,
      handlers: {
        success: function(data) {
          console.log(data)
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

exports.getMusicInfos = function(artistName, musicTitle) {
  return new Promise(function(resolve, reject) {
    lastfm.info("track", {
      artist: artistName,
      track: musicTitle,
      autocorrect: 1,
      handlers: {
        success: function(data) {
          console.log(data)
          var musicInfos = {};
          musicInfos.title = data.name;
          musicInfos.artist = data.artist.name;
          musicInfos.thumbnails = {};
          if(data.album) {
            _.forEach(data.album.image, function(image) {
              if('medium' == image.size) {
                musicInfos.thumbnails.small = image['#text'];
              } else if('large' == image.size) {
                musicInfos.thumbnails.medium = image['#text'];
              } else if('extralarge' == image.size) {
                musicInfos.thumbnails.large = image['#text'];
              }
            });
          }
          resolve(musicInfos);
        },
        error: function(error) {
          reject(error);
        }
      }
    });
  });
}