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

var coverDefaultRelated = ['artist', 'music'];
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
    return cover;
  });
}

exports.getCover = function(id) {
  return Cover.forge({id: id}).fetch({withRelated: coverDefaultRelated});
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
  }).fetch({withRelated: coverDefaultRelated});
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
  }).fetch({withRelated: coverDefaultRelated});
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
  }).fetch({withRelated: coverDefaultRelated});
}

exports.bestCoversOfMusic = function(music, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('music_id', '=', music.id);
    qb.orderBy('video_views', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: coverDefaultRelated});
}

exports.latestCoversByArtist = function(artist, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('artist_id', '=', artist.id);
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: coverDefaultRelated});
}

exports.bestCoversByArtist = function(artist, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('artist_id', '=', artist.id);
    qb.orderBy('video_views', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: coverDefaultRelated});
}

exports.latestArtists = function(page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Artist.collection().query(function(qb) {
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch();
}

exports.allMusicGenres = function() {
  return MusicGenre.fetchAll();
}

exports.getArtist = function(slug) {
  return Artist.query({where: ['slug', '=', slug]}).fetch();
}

exports.searchArtists = function(query) {
  return Artist.collection().query({where: ['name', 'like', '%' + query + '%']}).fetch();
}

exports.addArtist = function(name) {
  return new Promise(function(resolve, reject) {
    Artist.forge({name: name, slug: slug.slugify(name)}).save().then(function(artist) {
      resolve(artist);
      lastfm.getArtistInfos(artist.get('name')).then(function(artistInfos) {
        console.log(artistInfos);
      }).catch(function(err) {
        console.log('Error fetching artist infos from last.fm api: ', err);
      });
    }).catch(function(err) {
      reject(err);
    });
  });

}

exports.discoverArtist = function(data) {
  return new Promise(function(resolve, reject) {
    if(_.isObject(data)) {
      resolve(Artist.forge(data));
    } else {
      $.getArtist(data).then(function(artist) {
        if(artist) {
          resolve(artist);
        } else {
          $.addArtist(data).then(function(artist) {
            resolve(artist);
          });
        }
      }).catch(function(err) {
        reject(err);
      });
    }
  })
}

exports.listMusicBy

exports.getMusic = function(slug) {
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

exports.discoverMusic = function(artist, data) {
  return new Promise(function(resolve, reject) {
    if(_.isObject(data)) {
      resolve(Music.forge(data));
    } else {
      $.getMusic(artist, data).then(function(music) {
        if(music) {
          resolve(music);
        } else {
          $.addMusic(artist, data).then(function(music) {
            resolve(music);
          });
        }
      }).catch(function(err) {
        reject(err);
      });
    }
  });
}