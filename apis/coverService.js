var Cover        = require('../models/models').Cover,
    MusicalGenre = require('../models/models').MusicalGenre,
    MusicArtist  = require('../models/models').MusicArtist,
    MusicTitle   = require('../models/models').MusicTitle,
    youtube      = require('./oembed/youtube'),
    request      = require('request'),
    Promise      = require('bluebird'),
    _            = require('underscore'),
    $            = this;

exports.getCover = function(id, related) {
  return Cover.forge({id: id}).fetch({withRelated: related});
}

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
      video_author: videoInfos.author,
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

exports.lastCovers = function(related, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.orderBy('registration_date', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  }).fetch({withRelated: related});
}

exports.allMusicalGenres = function() {
  return MusicalGenre.fetchAll();
}

exports.getMusicArtist = function(name) {
  return MusicArtist.query({where: ['name', '=', name]}).fetch();
}

exports.discoverMusicArtist = function(data) {
  return new Promise(function(resolve, reject) {
    if(_.isObject(data)) {
      resolve(data);
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

exports.searchMusicArtists = function(query) {
  return MusicArtist.collection().query({where: ['name', 'like', '%' + query + '%']}).fetch();
}

exports.addMusicArtist = function(name) {
  return MusicArtist.forge({name: name}).save();
}

exports.getMusicTitle = function(musicArtist, name) {
  return MusicTitle.query({where: ['music_artist_id', '=', musicArtist.id], andWhere: ['name', '=', name]}).fetch();
}

exports.discoverMusicTitle = function(musicArtist, data) {
  return new Promise(function(resolve, reject) {
    if(_.isObject(data)) {
      resolve(data);
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
  return MusicTitle.forge({music_artist_id: musicArtist.id, name: name}).save();
}