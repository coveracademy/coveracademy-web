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

  function validRankType(rank) {
    return rank === 'best' || rank === 'latest';
  }

  router.get('/index', function(req, res, next) {
    Promise
    .all([coverService.topCover(), coverService.bestCovers(weekPeriod, firstPage, numberOfCoversInSummarizedList), coverService.latestCovers(weekPeriod, firstPage, numberOfCoversInSummarizedList), coverService.allMusicGenres()])
    .spread(function(topCover, bestCovers, latestCovers, musicGenres) {
      res.json({topCover: topCover, bestCovers: bestCovers, latestCovers: latestCovers, musicGenres: musicGenres});
    }).catch(function(err) {
      console.log(err.stack);
    });
  });

  router.get('/addCover', function(req, res, next) {
    coverService.allMusicGenres().then(function(allMusicGenres) {
      res.json({
        allMusicGenres: allMusicGenres
      });
    }).catch(function(err) {
      console.log(err);
    })
  });

  router.get('/cover/:id', function(req, res, next) {
    var id = req.param('id');
    coverService.getCover(id).then(function(cover) {
      if(!cover) {
        res.send(404);
      } else {
        Promise.all([coverService.bestCoversOfMusic(cover.related('music'), firstPage, numberOfCoversInSummarizedList), coverService.bestCoversByArtist(cover.related('artist'), firstPage, numberOfCoversInSummarizedList)])
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
    var page = req.param('page') || firstPage;
    if(!validRankType(rank)) {
      res.send(404);
    } else {
      var promiseRank = rank === 'best' ? coverService.bestCovers(weekPeriod, page, numberOfCoversInList) : coverService.latestCovers(weekPeriod, firstPage, numberOfCoversInList);
      Promise.all([promiseRank, coverService.totalCovers(weekPeriod)])
      .spread(function(coversRank, totalCoversRank) {
        this.coversRank = coversRank;
        this.totalCoversRank = totalCoversRank;
        return coverService.artistsOfCovers(coversRank);
      }).then(function(artistsOfCovers) {
        res.json({
          coversRank: this.coversRank,
          totalCoversRank: this.totalCoversRank,
          artistsOfCovers: artistsOfCovers
        });
      }).catch(function(err) {
        console.log(err);
      }).bind({});
    }
  });

  router.get('/artist/:slug', function(req, res, next) {
    var slug = req.param('slug');
    var sort = req.param('sort') || 'best';
    coverService.getArtistBySlug(slug).bind({}).then(function(artist) {
      if(!artist) {
        res.send(404);
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
        res.send(404);
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
        res.send(404);
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
    var page = req.param('page') || firstPage;
    if(!validRankType(rank)) {
      res.send(404);
    } else {
      coverService.getMusicGenreBySlug(slug).then(function(musicGenre) {
        if(!musicGenre) {
          res.send(404);
        } else {
          var promiseRank = rank === 'best' ? coverService.bestCoversOfMusicGenre : coverService.latestCoversOfMusicGenre;
          Promise.all([promiseRank(musicGenre, page, numberOfCoversInList), coverService.totalCoversOfMusicGenre(musicGenre)]).bind({})
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
    }
  });

  router.get('/search', function(req, res, next) {
    var query = req.param('query');
    Promise.all([coverService.searchArtists(query), coverService.searchMusics(query)])
    .spread(function(artists, musics) {
      this.artists = artists;
      this.musics = musics;
      return Promise.all([coverService.bestCoversByArtists(artists, 6), coverService.bestCoversOfMusics(musics, 6)]);
    }).spread(function(coversByArtists, coversOfMusics) {
      res.json({
        artists: this.artists,
        musics: this.musics,
        coversByArtists: coversByArtists,
        coversOfMusics: coversOfMusics
      });
    }).catch(function(err) {
      console.log(err);
    }).bind({});
  });

  app.use('/view', router);

}