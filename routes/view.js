var coverService = require('../apis/coverService'),
    Promise      = require('bluebird');

module.exports = function(router, app) {

  var weekPeriod = 7;
  var firstPage = 1;
  var numberOfCoversInList = 20;
  var numberOfCoversInSummarizedList = 8;
  var numberOfArtistsInSummarizedList = 8;
  var numberOfMusicsByArtist = 5;
  var numberOfCoversOfMusics = 12;
  var artistsInList = 60;

  router.get('/index', function(req, res, next) {
    Promise
    .all([coverService.topCover(), coverService.bestCovers(weekPeriod, firstPage, numberOfCoversInSummarizedList), coverService.latestCovers(weekPeriod, firstPage, numberOfCoversInSummarizedList), coverService.allMusicGenres()])
    .spread(function(topCover, bestCovers, latestCovers, musicGenres) {
      res.json({topCover: topCover, bestCovers: bestCovers, latestCovers: latestCovers, musicGenres: musicGenres});
    }).catch(function(err) {
      console.log(err.stack);
    });
  });

  router.get('/cover/:id', function(req, res, next) {
    var id = req.param('id');
    coverService.getCover(id).then(function(cover) {
      if(!cover) {
        res.json(404, {});
      } else {
        Promise
        .all([coverService.bestCoversOfMusic(cover.related('music'), firstPage, numberOfCoversInSummarizedList), coverService.bestCoversByArtist(cover.related('artist'), firstPage, numberOfCoversInSummarizedList)])
        .spread(function(bestCoversOfMusic, bestCoversByArtist) {
          res.json({
            cover: cover,
            bestCoversOfMusic: bestCoversOfMusic,
            bestCoversByArtist: bestCoversByArtist
          });
        });
      }
    }).catch(function(err) {
      console.log(err);
    })
  });

  router.get('/covers/:rank', function(req, res, next) {
    var rank = req.param('rank');
    var promiseRank = rank === 'best' ? coverService.bestCovers(weekPeriod, firstPage, numberOfCoversInList) : coverService.latestCovers(weekPeriod, firstPage, numberOfCoversInList);
    Promise.all([promiseRank, coverService.totalCovers(weekPeriod)])
    .spread(function(coversRank, totalCoversRank) {
      res.json({
        coversRank: coversRank,
        totalCoversRank: totalCoversRank
      });
    }).catch(function(err) {
      console.log(err);
    })
  });

  router.get('/artist/:slug', function(req, res, next) {
    var slug = req.param('slug');
    var sort = req.param('sort') || 'best';
    coverService.getArtistBySlug(slug).bind({}).then(function(artist) {
      if(!artist) {

      } else {
        Promise.all([coverService.totalMusicsByArtist(artist), coverService.lastMusicsByArtist(artist, firstPage, numberOfMusicsByArtist)])
        .spread(function(totalMusicsByArtist, musicsByArtist) {
          this.totalMusicsByArtist = totalMusicsByArtist;
          this.musicsByArtist = musicsByArtist;
          var coversOfMusics;
          if(sort === 'best') {
            coversOfMusics = coverService.bestCoversOfMusics;
          } else {
            coversOfMusics = coverService.latestCoversOfMusics;
          }
          return coversOfMusics(musicsByArtist, numberOfCoversOfMusics);
        }).then(function(coversOfMusics) {
          res.json({
            artist: artist,
            totalMusicsByArtist: this.totalMusicsByArtist,
            musicsByArtist: this.musicsByArtist,
            coversOfMusics: coversOfMusics
          });
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/artists', function(req, res, next) {
    var genre = req.param('genre');
    coverService.getMusicGenreBySlug(genre).then(function(musicGenre) {
      this.musicGenre = musicGenre;
      return Promise.all([coverService.listArtists(musicGenre, firstPage, artistsInList), coverService.totalArtists(musicGenre)]);
    }).spread(function(artists, totalArtists) {
      res.json({
        musicGenre: this.musicGenre,
        artists: artists,
        totalArtists: totalArtists
      });
    }).catch(function(err) {
      console.log(err);
    }).bind({});
  });


  router.get('/music/:slug', function(req, res, next) {
    var slug = req.param('slug');
    var sort = req.param('sort') || 'best';
    coverService.getMusicBySlug(slug).bind({}).then(function(music) {
      if(!music) {

      } else {
        var coversOfMusic;
        if(sort === 'best') {
          coversOfMusic = coverService.bestCoversOfMusic;
        } else {
          coversOfMusic = coverService.latestCoversOfMusic;
        }
        Promise.all([coverService.totalCoversOfMusic(music), coversOfMusic(music, firstPage, numberOfCoversInList)])
        .spread(function(totalCoversOfMusic, coversOfMusic) {
          res.json({
            music: music,
            totalCoversOfMusic: totalCoversOfMusic,
            coversOfMusic: coversOfMusic
          });
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/genre/:slug', function(req, res, next) {
    var slug = req.param('slug');
    coverService.getMusicGenreBySlug(slug).then(function(musicGenre) {
      if(!musicGenre) {

      } else {
        Promise.all([coverService.bestArtistsOfMusicGenre(musicGenre, firstPage, numberOfArtistsInSummarizedList), coverService.bestCoversOfMusicGenre(musicGenre, firstPage, numberOfCoversInSummarizedList), coverService.latestCoversOfMusicGenre(musicGenre, firstPage, numberOfCoversInSummarizedList)]).bind({})
        .spread(function(bestArtistsOfMusicGenre, bestCoversOfMusicGenre, latestCoversOfMusicGenre) {
          res.json({
            musicGenre: musicGenre,
            bestArtistsOfMusicGenre: bestArtistsOfMusicGenre,
            bestCoversOfMusicGenre: bestCoversOfMusicGenre,
            latestCoversOfMusicGenre: latestCoversOfMusicGenre
          });
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  });

  router.get('/genre/:slug/:rank', function(req, res, next) {
    var slug = req.param('slug');
    var rank = req.param('rank');
    coverService.getMusicGenreBySlug(slug).then(function(musicGenre) {
      if(!musicGenre) {

      } else {
        var promiseRank = rank === 'best' ? coverService.bestCoversOfMusicGenre : coverService.latestCoversOfMusicGenre;
        Promise.all([promiseRank(musicGenre, firstPage, numberOfCoversInList), coverService.totalCoversOfMusicGenre(musicGenre)]).bind({})
        .spread(function(coversOfMusicGenre, totalCoversOfMusicGenre) {
          res.json({
            musicGenre: musicGenre,
            coversOfMusicGenre: coversOfMusicGenre,
            totalCoversOfMusicGenre: totalCoversOfMusicGenre
          });
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.use('/view', router);

}