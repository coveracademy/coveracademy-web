var Cover          = require('../models/models').Cover,
    PotentialCover = require('../models/models').PotentialCover,
    MusicGenre     = require('../models/models').MusicGenre,
    Artist         = require('../models/models').Artist,
    Music          = require('../models/models').Music,
    Bookshelf      = require('../models/models').Bookshelf,
    settings       = require('../configs/settings'),
    slug           = require('../utils/slug'),
    modelUtils     = require('../utils/modelUtils'),
    lastfm         = require('./third/lastfm'),
    youtube        = require('./third/youtube'),
    wilsonScore    = require('decay').wilsonScore(),
    request        = require('request'),
    Promise        = require('bluebird'),
    _              = require('underscore'),
    $              = this;

_.str = require('underscore.string');

var coverRelated = {withRelated: ['artist', 'music']};
var coverAllRelated = {withRelated: ['artist', 'artist.musicGenre', 'music']};
var artistRelated = {withRelated: ['musicGenre']};
var musicRelated = {withRelated: ['artist']};

var calculatePeriod = function(period) {
  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(endDate.getDate() - period);
  return [startDate, endDate];
}

var coversOfMusics = function(rankType, musics, pageSize) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    musics.forEach(function(music) {
      var coversOfMusicsPromise = rankType === 'latest' ? $.latestCoversOfMusic : $.bestCoversOfMusic;
      promises.push(coversOfMusicsPromise(music, 1, pageSize));
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

var coversOfMusic = function(rankType, music, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('music_id', music.id)
    .offset((page - 1) * pageSize)
    .limit(pageSize);

    rankType === 'latest' ? qb.orderBy('registration_date', 'desc') : qb.orderBy('score', 'desc');
  }).fetch(coverRelated);
}

var coversByArtists = function(rankType, artists, pageSize) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    artists.forEach(function(artist) {
      var coversByArtistsPromise = rankType === 'latest' ? $.latestCoversByArtist : $.bestCoversByArtist;
      promises.push(coversByArtistsPromise(artist, 1, pageSize));
    });
    Promise.all(promises).then(function(results) {
      var coversGroupedByArtist = {};
      _.forEach(results, function(result) {
        if(!result.isEmpty()) {
          coversGroupedByArtist[result.at(0).get('artist_id')] = result;
        }
      });
      resolve(coversGroupedByArtist);
    }).catch(function(err) {
      reject(err);
    });
  });
}

var coversByArtist = function(rankType, artist, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.where('artist_id', artist.id)
    .offset((page - 1) * pageSize)
    .limit(pageSize);

    rankType === 'latest' ? qb.orderBy('registration_date', 'desc') : qb.orderBy('score', 'desc');
  }).fetch(coverRelated);
}

var coversOfMusicGenre = function(rankType, musicGenre, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.join('artist', 'cover.artist_id', 'artist.id')
    .where('artist.music_genre_id', musicGenre.id)
    .offset((page - 1) * pageSize)
    .limit(pageSize);

    rankType === 'latest' ? qb.orderBy('cover.registration_date', 'desc') : qb.orderBy('cover.score', 'desc');
  }).fetch(coverRelated);
}

var artistsOfMusicGenre = function(rankType, musicGenre, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Artist.collection().query(function(qb) {
    qb.distinct('cover.artist_id as id')
    .select('artist.*')
    .join('cover', 'artist.id', 'cover.artist_id')
    .where('artist.music_genre_id', musicGenre.id)
    .offset((page - 1) * pageSize)
    .limit(pageSize);

    rankType === 'latest' ? qb.orderBy('cover.registration_date', 'desc') : qb.orderBy('cover.score', 'desc');
  }).fetch();
}

var listCovers = function(rankType, period, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Cover.collection().query(function(qb) {
    qb.whereBetween('registration_date', calculatePeriod(period))
    .offset((page - 1) * pageSize)
    .limit(pageSize);

    rankType === 'latest' ? qb.orderBy('registration_date', 'desc') : qb.orderBy('score', 'desc');
  }).fetch(coverRelated);
}

exports.addCover = function(user, coverData) {
  coverData.artist = _.str.trim(coverData.artist);
  coverData.music = _.str.trim(coverData.music);
  coverData.author = coverData.author ? _.str.trim(coverData.author) : null;
  return $.discoverArtist(coverData.artist).then(function(artist) {
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
      duration: videoInfos.duration,
      video_id: videoInfos.id,
      video_title: videoInfos.title,
      video_likes: videoInfos.likes,
      video_dislikes: videoInfos.dislikes,
      video_views: videoInfos.views,
      video_date: videoInfos.date,
      author: coverData.author ? coverData.author : videoInfos.channelTitle,
      score: wilsonScore(videoInfos.views, videoInfos.dislikes),
      small_thumbnail: videoInfos.thumbnails.small,
      medium_thumbnail: videoInfos.thumbnails.medium,
      large_thumbnail: videoInfos.thumbnails.large
    });
    if(coverData.id) {
      cover.set('id', coverData.id);
    } else {
      cover.set('user_id', user.id);
    }
    cover.set('slug', this.music.get('slug') + '-' + slug.slugify(cover.get('author')));
    return cover.save();
  }).then(function(cover) {
    this.music.set('last_cover_date', new Date());
    this.music.save();
    return cover;
  }).bind({});
}

exports.removeCover = function(cover) {
  return cover.destroy();
}

exports.getCover = function(id) {
  return Cover.forge({id: id}).fetch(coverAllRelated);
}

exports.topCover = function() {
  return this.bestCovers(7, 1, 1).then(function(covers) {
    return covers.at(0);
  });
}

exports.latestCovers = function(period, page, pageSize) {
  return listCovers('latest', period, page, pageSize);
}

exports.bestCovers = function(period, page, pageSize) {
  return listCovers('best', period, page, pageSize);
}

exports.totalCovers = function(period) {
  return new Promise(function(resolve, reject) {
    var qb = Bookshelf.knex('cover')
    .count('id as total_covers')
    .whereBetween('registration_date', calculatePeriod(period))
    .then(function(rows) {
      resolve(rows[0].total_covers);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.latestCoversOfMusic = function(music, page, pageSize) {
  return coversOfMusic('latest', music, page, pageSize);
}

exports.bestCoversOfMusic = function(music, page, pageSize) {
  return coversOfMusic('best', music, page, pageSize);
}

exports.latestCoversOfMusics = function(musics, pageSize) {
  return coversOfMusics('latest', musics, pageSize);
}

exports.bestCoversOfMusics = function(musics, pageSize) {
  return coversOfMusics('best', musics, pageSize);
}

exports.totalCoversOfMusic = function(music) {
  return new Promise(function(resolve, reject) {
    Bookshelf.knex('cover')
    .count('id as total_covers')
    .where('music_id', music.id)
    .then(function(rows) {
      resolve(rows[0].total_covers);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.latestCoversByArtist = function(artist, page, pageSize) {
  return coversByArtist('latest', artist, page, pageSize);
}

exports.bestCoversByArtist = function(artist, page, pageSize) {
  return coversByArtist('best', artist, page, pageSize);
}

exports.latestCoversByArtists = function(artists, pageSize) {
  return coversByArtists('latest', artists, pageSize);
}

exports.bestCoversByArtists = function(artists, pageSize) {
  return coversByArtists('best', artists, pageSize);
}

exports.latestCoversOfMusicGenre = function(musicGenre, page, pageSize) {
  return coversOfMusicGenre('latest', musicGenre, page, pageSize);
}

exports.bestCoversOfMusicGenre = function(musicGenre, page, pageSize) {
  return coversOfMusicGenre('best', musicGenre, page, pageSize);
}

exports.totalCoversOfMusicGenre = function(musicGenre) {
  return new Promise(function(resolve, reject) {
    Bookshelf.knex('cover')
    .join('artist', 'cover.artist_id', 'artist.id')
    .where('artist.music_genre_id', musicGenre.id)
    .count('cover.id as total_covers')
    .then(function(rows) {
      resolve(rows[0].total_covers)
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.getMusicGenre = function(name) {
  if('Rap' === name || 'Hip-hop' == name) {
    name = 'Rap or Hip-hop';
  } else if('Jazz' == name || 'Blues' == name) {
    name = 'Jazz or Blues';
  }
  return MusicGenre.forge({name: name}).fetch();
}

exports.getMusicGenreBySlug = function(slug) {
  if(!slug) {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  }
  return MusicGenre.forge({slug: slug}).fetch();
}

exports.musicGenres = function() {
  return MusicGenre.fetchAll();
}

exports.getArtist = function(name) {
  return this.getArtistBySlug(slug.slugify(name));
}

exports.getArtistById = function(id) {
  return Artist.query({where: ['id', id]}).fetch(artistRelated);
}

exports.getArtistBySlug = function(slug) {
  return Artist.query({where: ['slug', slug]}).fetch(artistRelated);
}

exports.searchArtists = function(query, related) {
  return Artist.collection().query({where: ['name', 'like', '%' + query + '%']}).fetch(related);
}

exports.latestArtists = function(page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Artist.collection().query(function(qb) {
    qb.orderBy('registration_date', 'desc')
    .offset((page - 1) * pageSize)
    .limit(pageSize);
  }).fetch();
}

exports.latestArtistsOfMusicGenre = function(musicGenre, period, page, pageSize) {
  return artistsOfMusicGenre('latest', musicGenre, period, page, pageSize);
}

exports.bestArtistsOfMusicGenre = function(musicGenre, period, page, pageSize) {
  return artistsOfMusicGenre('best', musicGenre, period, page, pageSize);
}

exports.totalMusicsByArtist = function(artist) {
  return new Promise(function(resolve, reject) {
    Bookshelf.knex('music')
    .count('id as total_musics')
    .where('artist_id', artist.id)
    .then(function(rows) {
      resolve(rows[0].total_musics);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.lastMusicsByArtist = function(artist, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Music.collection().query(function(qb) {
    qb.where('artist_id', artist.id)
    .orderBy('last_cover_date', 'desc')
    .offset((page - 1) * pageSize)
    .limit(pageSize);
  }).fetch();
}

exports.addArtist = function(name) {
  return new Promise(function(resolve, reject) {
    Artist.forge({name: name, slug: slug.slugify(name)}).save().then(function(artist) {
      resolve(artist);
      lastfm.getArtistInfos(artist.get('name')).then(function(artistInfos) {
        artist.set('name', artistInfos.name);
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

exports.listArtists = function(musicGenre, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Artist.collection().query(function(qb) {
    if(musicGenre) {
      qb.where('music_genre_id', musicGenre.id);
    }
    qb.orderBy('name', 'asc')
    .offset((page - 1) * pageSize)
    .limit(pageSize);
  }).fetch(artistRelated);
}

exports.totalArtists = function(musicGenre) {
  return new Promise(function(resolve, reject) {
    var qb = Bookshelf.knex('artist').count('id as total_artists');
    if(musicGenre) {
      qb.where('music_genre_id', musicGenre.id);
    }
    qb.then(function(rows) {
      resolve(rows[0].total_artists);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.getMusic = function(artist, title) {
  var slugified = slug.slugify(title) + '-' + artist.get('slug');
  return this.getMusicBySlug(slugified);
}

exports.getMusicById = function(id) {
  return Music.query({where: ['id', id]}).fetch(musicRelated);
}

exports.getMusicBySlug = function(slug) {
  return Music.query({where: ['slug', slug]}).fetch(musicRelated);
}

exports.searchMusics = function(query) {
  return Music.collection().query({where: ['title', 'like', '%' + query + '%']}).fetch(musicRelated);
}

exports.searchMusicsOfArtist = function(artistName, query) {
  return new Promise(function(resolve, reject) {
    $.getArtist(artistName).then(function(artist) {
      if(artist) {
        resolve(Music.collection().query({where: ['artist_id', artist.id], andWhere: ['title', 'like', '%' + query + '%']}).fetch());
      } else {
        resolve(Music.collection());
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.addMusic = function(artist, title) {
  return new Promise(function(resolve, reject) {
    Music.forge({artist_id: artist.id, title: title, slug: slug.slugify(title) + '-' + slug.slugify(artist.get('name'))}).save().then(function(music) {
      resolve(music);
      lastfm.getMusicInfos(artist.get('name'), title).then(function(musicInfos) {
        music.set('title', musicInfos.title);
        music.set('small_thumbnail', musicInfos.thumbnails.small);
        music.set('medium_thumbnail', musicInfos.thumbnails.medium);
        music.set('large_thumbnail', musicInfos.thumbnails.large);
        music.save();
      }).catch(function(err) {
        console.log('Error fetching ' + artist.get('name') + ' - ' + title + ' infos from last.fm api: ', err);
      });
    });
  });
}

exports.discoverMusic = function(artist, title) {
  return new Promise(function(resolve, reject) {
    $.getMusic(artist, title).then(function(music) {
      if(music) {
        resolve(music);
      } else {
        $.addMusic(artist, title).then(function(music) {
          resolve(music);
        });
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.artistsOfCovers = function(covers) {
  var artistsOfCovers = Artist.collection();
  covers.forEach(function(cover) {
    var artist = cover.related('artist');
    if(!artistsOfCovers.contains(artist)) {
      artistsOfCovers.add(artist);
    }
  });
  return artistsOfCovers;
}

exports.potentialCovers = function(page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return PotentialCover.collection().query(function(qb) {
    qb.orderBy('registration_date', 'desc')
    .offset((page - 1) * pageSize)
    .limit(pageSize);
  }).fetch();
}

exports.acceptCover = function(user, potentialCover) {
  return this.addCover(user, {
    artist: potentialCover.get('artist'),
    music: potentialCover.get('music'),
    author: potentialCover.get('author'),
    url: potentialCover.get('url')
  }).then(function(cover) {
    this.cover = cover;
    return potentialCover.destroy();
  }).then(function(potentialCover) {
    return this.cover;
  }).bind({});
}

exports.refuseCover = function(potentialCover) {
  return potentialCover.destroy();
}

exports.saveArtist = function(artist) {
  return artist.save().then(function(artist) {
    return $.getArtistById(artist.id);
  });
}

exports.saveMusic = function(musicData) {
  musicData.artist = _.str.trim(musicData.artist);
  musicData.title = _.str.trim(musicData.title);
  return $.discoverArtist(musicData.artist).then(function(artist) {
    var music = Music.forge(modelUtils.filterAttributes('MusicEditableAttributes', musicData));
    music.set('id', musicData.id);
    music.set('artist_id', artist.id);
    return music.save();
  }).then(function(music) {
    return $.getMusicById(music.id);
  });
}