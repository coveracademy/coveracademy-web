var Cover        = require('../models/models').Cover,
    MusicGenre   = require('../models/models').MusicGenre,
    Artist       = require('../models/models').Artist,
    Music        = require('../models/models').Music,
    Bookshelf    = require('../models/models').Bookshelf,
    settings     = require('../configs/settings'),
    slug         = require('../utils/slug'),
    youtube      = require('./third/youtube'),
    lastfm       = require('./third/lastfm'),
    request      = require('request'),
    Promise      = require('bluebird'),
    _            = require('underscore'),
    $            = this;

var defaultCoverRelated = ['artist', 'music'];
var defaultArtistRelated = ['musicGenre'];
var calculatePeriod = function(period) {
  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(endDate.getDate() - period);
  return [startDate, endDate];
}

exports.addCover = function(coverData) {
  return $.discoverArtist(coverData.artist).bind({}).then(function(artist) {
    this.artist = artist;
    return $.discoverMusic(artist, coverData.music);
  }).then(function(music) {
    this.music = music;
    return youtube.getVideoInfos(coverData.url);
  }).then(function(videoInfos) {
    var cover = Cover.forge({
      artist_id: this.artist.id,
      music_id: this.music.id,
      url: videoInfos.url,
      embed_url: videoInfos.embedUrl,
      title: videoInfos.title,
      duration: videoInfos.duration,
      video_id: videoInfos.id,
      video_likes: videoInfos.likes,
      video_views: videoInfos.views,
      video_author: coverData.videoAuthor ? coverData.videoAuthor : videoInfos.author,
      video_date: videoInfos.date,
      small_thumbnail: videoInfos.thumbnails.small,
      medium_thumbnail: videoInfos.thumbnails.medium,
      large_thumbnail: videoInfos.thumbnails.large
    });
    return cover.save();
  }).then(function(cover) {
    var musicGenres = [];
    _.forEach(coverData.musicGenres, function(musicGenre) {
      musicGenres.push(MusicGenre.forge(musicGenre));
    });
    cover.musicGenres().attach(musicGenres);
    this.music.set('last_cover_date', new Date());
    this.music.save();
    return cover;
  });
}

exports.getCover = function(id) {
  return Cover.forge({id: id}).fetch({withRelated: defaultCoverRelated});
}

exports.topCover = function() {
  return this.bestCovers(7, 1, 1).then(function(covers) {
    return covers.at(0);
  });
}

exports.latestCovers = function(period, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.whereBetween('registration_date', calculatePeriod(period));
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: defaultCoverRelated});
}

exports.totalLatestCovers = function(period) {
  return new Promise(function(resolve, reject) {
    Bookshelf
    .knex('cover')
    .count('id as total_latest_covers')
    .whereBetween('registration_date', calculatePeriod(period))
    .orderBy('registration_date', 'desc')
    .then(function(rows) {
      resolve(rows[0].total_latest_covers);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.bestCovers = function(period, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.whereBetween('registration_date', calculatePeriod(period));
    qb.orderBy('video_views', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: defaultCoverRelated});
}

exports.totalBestCovers = function(period) {
  return new Promise(function(resolve, reject) {
    Bookshelf
    .knex('cover')
    .count('id as total_best_covers_week')
    .whereBetween('registration_date', calculatePeriod(period))
    .orderBy('video_views', 'desc')
    .then(function(rows) {
      resolve(rows[0].total_best_covers_week);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.latestCoversOfMusic = function(music, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('music_id', '=', music.id);
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: defaultCoverRelated});
}

exports.latestCoversOfMusics = function(musics, pageSize) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    musics.forEach(function(music) {
      promises.push($.latestCoversOfMusic(music, 1, pageSize));
    });
    Promise.all(promises).then(function(results) {
      var coversGroupedByMusic = {};
      _.forEach(results, function(result) {
        if(!result.isEmpty()) {
          coversGroupedByMusic[result.at(0).get('music_id')] = result;
        }
      });
      resolve(coversGroupedByMusic);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.bestCoversOfMusic = function(music, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('music_id', '=', music.id);
    qb.orderBy('video_views', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: defaultCoverRelated});
}

exports.latestCoversByArtist = function(artist, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('artist_id', '=', artist.id);
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: defaultCoverRelated});
}

exports.bestCoversByArtist = function(artist, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('artist_id', '=', artist.id);
    qb.orderBy('video_views', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: defaultCoverRelated});
}

exports.latestArtists = function(page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Artist.collection().query(function(qb) {
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch();
}

exports.getMusicGenre = function(name) {
  if('Rap' === name || 'Hip-hop' == name) {
    name = 'Rap or Hip-hop';
  } else if('Jazz' == name || 'Blues' == name) {
    name = 'Jazz or Blues';
  }
  return MusicGenre.forge({name: name}).fetch();
}

exports.allMusicGenres = function() {
  return MusicGenre.fetchAll();
}

exports.getArtist = function(name) {
  return this.getArtistBySlug(slug.slugify(name));
}

exports.getArtistBySlug = function(slug) {
  return Artist.query({where: ['slug', '=', slug]}).fetch({withRelated: defaultArtistRelated});
}

exports.searchArtists = function(query) {
  return Artist.collection().query({where: ['name', 'like', '%' + query + '%']}).fetch();
}

exports.addArtist = function(name) {
  return new Promise(function(resolve, reject) {
    Artist.forge({name: name, slug: slug.slugify(name)}).save().then(function(artist) {
      resolve(artist);
      lastfm.getArtistInfos(artist.get('name')).then(function(artistInfos) {
        artist.set('name', artistInfos.name);
        artist.set('slug', slug.slugify(artistInfos.name));
        artist.set('small_thumbnail', artistInfos.thumbnails.small);
        artist.set('medium_thumbnail', artistInfos.thumbnails.medium);
        artist.set('large_thumbnail', artistInfos.thumbnails.large);
        if(artistInfos.musicGenre) {
          $.getMusicGenre(artistInfos.musicGenre).then(function(musicGenre) {
            artist.set('music_genre_id', musicGenre.id);
            artist.save();
          });
        } else {
          artist.save();
        }
      }).catch(function(err) {
        console.log('Error fetching ' + name + ' infos from last.fm api: ', err);
      });
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.discoverArtist = function(name) {
  return new Promise(function(resolve, reject) {
    $.getArtist(name).then(function(artist) {
      if(artist) {
        resolve(artist);
      } else {
        $.addArtist(name).then(function(artist) {
          resolve(artist);
        });
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.getMusic = function(artist, name) {
  var slugified = slug.slugify(artist.get('name') + ' ' + name);
  return this.getMusicBySlug(slugified);
}

exports.getMusicBySlug = function(slug) {
  return Music.query({where: ['slug', '=', slug]}).fetch();
}

exports.searchMusics = function(artist, query) {
  var whereCondition = null;
  if(artist) {
    whereCondition = {where: ['artist_id', '=', artist.id], andWhere: ['name', 'like', '%' + query + '%']};
  } else {
    whereCondition = {where: ['name', 'like', '%' + query + '%']};
  }
  return Music.collection().query(whereCondition).fetch();
}

exports.addMusic = function(artist, name) {
  return Music.forge({artist_id: artist.id, name: name, slug: slug.slugify(artist.get('name') + '-' + name)}).save();
}

exports.discoverMusic = function(artist, name) {
  return new Promise(function(resolve, reject) {
    $.getMusic(artist, name).then(function(music) {
      if(music) {
        resolve(music);
      } else {
        $.addMusic(artist, name).then(function(music) {
          resolve(music);
        });
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.totalMusicsByArtist = function(artist) {
  return new Promise(function(resolve, reject) {
    Bookshelf.knex('music').count('id as total_musics').where('artist_id', '=', artist.id).then(function(rows) {
      resolve(rows[0].total_musics);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.lastMusicsByArtist = function(artist, page, pageSize) {
  return Music.collection().query(function(qb) {
    qb.where('artist_id', '=', artist.id);
    qb.orderBy('last_cover_date', 'date');
  }).fetch();
}