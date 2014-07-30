var Cover        = require('../models/models').Cover,
    MusicalGenre = require('../models/models').MusicalGenre,
    MusicArtist  = require('../models/models').MusicArtist,
    MusicTitle   = require('../models/models').MusicTitle,
    slug         = require('../utils/slug');
    youtube      = require('./oembed/youtube'),
    request      = require('request'),
    Promise      = require('bluebird'),
    _            = require('underscore'),
    $            = this;

exports.addCover = function(coverData) {
  return $.discoverMusicArtist(coverData.musicArtist).bind({}).then(function(musicArtist) {
    this.musicArtist = musicArtist;
    return $.discoverMusicTitle(musicArtist, coverData.musicTitle);
  }).then(function(musicTitle) {
    this.musicTitle = musicTitle;
    return youtube.getVideoInfos(coverData.url);
  }).then(function(videoInfos) {
    var cover = Cover.forge({
      music_artist_id: this.musicArtist.id,
      music_title_id: this.musicTitle.id,
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
    var musicalGenres = [];
    _.forEach(coverData.musicalGenres, function(musicalGenre) {
      musicalGenres.push(MusicalGenre.forge(musicalGenre));
    });
    cover.musicalGenres().attach(musicalGenres);
    return cover;
  });
}

exports.getCover = function(id, related) {
  return Cover.forge({id: id}).fetch({withRelated: related});
}

exports.topCover = function(related) {
  return this.bestCoversWeek(related, 1, 1).then(function(covers) {
    return covers.at(0);
  });
}

exports.bestCoversWeek = function(related, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    var initialDate = new Date();
    var finalDate = new Date();
    finalDate.setDate(initialDate.getDate() - 7);
    qb.whereBetween('registration_date', [finalDate, initialDate]);
    qb.orderBy('video_views', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: related});
}

exports.lastCovers = function(related, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: related});
}

exports.lastMusicArtists = function(page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return MusicArtist.collection().query(function(qb) {
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch();
}

exports.allMusicalGenres = function() {
  return MusicalGenre.fetchAll();
}

exports.getMusicArtist = function(name) {
  return MusicArtist.query({where: ['name', '=', name]}).fetch();
}

exports.searchMusicArtists = function(query) {
  return MusicArtist.collection().query({where: ['name', 'like', '%' + query + '%']}).fetch();
}

exports.addMusicArtist = function(name) {
  return MusicArtist.forge({name: name, slug: slug.slugify(name)}).save();
}

exports.discoverMusicArtist = function(data) {
  return new Promise(function(resolve, reject) {
    if(_.isObject(data)) {
      resolve(MusicArtist.forge(data));
    } else {
      $.getMusicArtist(data).then(function(musicArtist) {
        if(musicArtist) {
          resolve(musicArtist);
        } else {
          $.addMusicArtist(data).then(function(musicArtist) {
            resolve(musicArtist);
          });
        }
      }).catch(function(err) {
        reject(err);
      });
    }
  })
}

exports.getMusicTitle = function(musicArtist, name) {
  return MusicTitle.query({where: ['music_artist_id', '=', musicArtist.id], andWhere: ['name', '=', name]}).fetch();
}

exports.searchMusicTitles = function(musicArtist, query) {
  var whereCondition = null;
  if(musicArtist) {
    whereCondition = {where: ['music_artist_id', '=', musicArtist.id], andWhere: ['name', 'like', '%' + query + '%']};
  } else {
    whereCondition = {where: ['name', 'like', '%' + query + '%']};
  }
  return MusicTitle.collection().query(whereCondition).fetch();
}

exports.addMusicTitle = function(musicArtist, name) {
  return MusicTitle.forge({music_artist_id: musicArtist.id, name: name, slug: slug.slugify(musicArtist.get('name') + '-' + name)}).save();
}

exports.discoverMusicTitle = function(musicArtist, data) {
  return new Promise(function(resolve, reject) {
    if(_.isObject(data)) {
      resolve(MusicTitle.forge(data));
    } else {
      $.getMusicTitle(musicArtist, data).then(function(musicTitle) {
        if(musicTitle) {
          resolve(musicTitle);
        } else {
          $.addMusicTitle(musicArtist, data).then(function(musicTitle) {
            resolve(musicTitle);
          });
        }
      }).catch(function(err) {
        reject(err);
      });
    }
  });
}

exports.getCoverVideoInfos = function(url) {

}