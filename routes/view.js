var coverService = require('../apis/coverService'),
    constants    = require('../apis/constants'),
    isAdmin      = require('../utils/authorization').isAdmin,
    Promise      = require('bluebird');

module.exports = function(router, app) {

  function validRankType(rank) {
    return rank === 'best' || rank === 'latest';
  }

  // ADMIN ROUTES
  router.get('/admin', isAdmin, function(req, res, next) {
    coverService.potentialCovers(constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_LIST).then(function(potentialCovers) {
      res.json({potentialCovers: potentialCovers});
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  router.get('/addCover', isAdmin, function(req, res, next) {
    coverService.allMusicGenres().then(function(allMusicGenres) {
      res.json({
        allMusicGenres: allMusicGenres
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    })
  });

  // PUBLIC ROUTES
  router.get('/index', function(req, res, next) {
    Promise
    .all([coverService.topCover(), coverService.bestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST), coverService.latestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST), coverService.allMusicGenres()])
    .spread(function(topCover, bestCovers, latestCovers, musicGenres) {
      res.json({topCover: topCover, bestCovers: bestCovers, latestCovers: latestCovers, musicGenres: musicGenres});
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });


  router.get('/cover/:id', function(req, res, next) {
    var id = req.param('id');
    coverService.getCover(id).then(function(cover) {
      if(!cover) {
        res.send(404);
      } else {
        Promise.all([coverService.bestCoversOfMusic(cover.related('music'), constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST), coverService.bestCoversByArtist(cover.related('artist'), constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST)])
        .spread(function(bestCoversOfMusic, bestCoversByArtist) {
          res.json({
            cover: cover,
            bestCoversOfMusic: bestCoversOfMusic,
            bestCoversByArtist: bestCoversByArtist
          });
        });
      }
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    })
  });

  router.get('/covers/:rank', function(req, res, next) {
    var rank = req.param('rank');
    var page = req.param('page') || constants.FIRST_PAGE;
    if(!validRankType(rank)) {
      res.send(404);
    } else {
      var promiseRank = rank === 'best' ? coverService.bestCovers(constants.WEEK_PERIOD, page, constants.NUMBER_OF_COVERS_IN_LIST) : coverService.latestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_LIST);
      Promise.all([promiseRank, coverService.totalCovers(constants.WEEK_PERIOD)])
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
        console.log(err.stack);
        res.send(500);
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
        Promise.all([coverService.totalMusicsByArtist(artist), coverService.lastMusicsByArtist(artist, constants.FIRST_PAGE, constants.NUMBER_OF_MUSICS_BY_ARTIST)])
        .spread(function(totalMusicsByArtist, musicsByArtist) {
          this.totalMusicsByArtist = totalMusicsByArtist;
          this.musicsByArtist = musicsByArtist;
          var coversOfMusics;
          if(sort === 'best') {
            coversOfMusics = coverService.bestCoversOfMusics;
          } else {
            coversOfMusics = coverService.latestCoversOfMusics;
          }
          return coversOfMusics(musicsByArtist, constants.NUMBER_OF_COVERS_OF_MUSIC);
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
      console.log(err.stack);
      res.send(500);
    });
  });

  router.get('/artists', function(req, res, next) {
    var genre = req.param('genre');
    coverService.getMusicGenreBySlug(genre).then(function(musicGenre) {
      this.musicGenre = musicGenre;
      return Promise.all([coverService.listArtists(musicGenre, constants.FIRST_PAGE, constants.ARTISTS_IN_LIST), coverService.totalArtists(musicGenre)]);
    }).spread(function(artists, totalArtists) {
      res.json({
        musicGenre: this.musicGenre,
        artists: artists,
        totalArtists: totalArtists
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
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
        Promise.all([coverService.totalCoversOfMusic(music), coversOfMusic(music, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_LIST)])
        .spread(function(totalCoversOfMusic, coversOfMusic) {
          res.json({
            music: music,
            totalCoversOfMusic: totalCoversOfMusic,
            coversOfMusic: coversOfMusic
          });
        });
      }
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  router.get('/genre/:slug', function(req, res, next) {
    var slug = req.param('slug');
    coverService.getMusicGenreBySlug(slug).then(function(musicGenre) {
      if(!musicGenre) {
        res.send(404);
      } else {
        Promise.all([coverService.bestArtistsOfMusicGenre(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_ARTISTS_IN_SUMMARIZED_LIST), coverService.bestCoversOfMusicGenre(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST), coverService.latestCoversOfMusicGenre(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST)]).bind({})
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
      console.log(err.stack);
      res.send(500);
    });
  });

  router.get('/genre/:slug/:rank', function(req, res, next) {
    var slug = req.param('slug');
    var rank = req.param('rank');
    var page = req.param('page') || constants.FIRST_PAGE;
    if(!validRankType(rank)) {
      res.send(404);
    } else {
      coverService.getMusicGenreBySlug(slug).then(function(musicGenre) {
        if(!musicGenre) {
          res.send(404);
        } else {
          var promiseRank = rank === 'best' ? coverService.bestCoversOfMusicGenre : coverService.latestCoversOfMusicGenre;
          Promise.all([promiseRank(musicGenre, page, constants.NUMBER_OF_COVERS_IN_LIST), coverService.totalCoversOfMusicGenre(musicGenre)]).bind({})
          .spread(function(coversOfMusicGenre, totalCoversOfMusicGenre) {
            res.json({
              musicGenre: musicGenre,
              coversOfMusicGenre: coversOfMusicGenre,
              totalCoversOfMusicGenre: totalCoversOfMusicGenre
            });
          });
        }
      }).catch(function(err) {
        console.log(err.stack);
        res.send(500);
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
      console.log(err.stack);
      res.send(500);
    }).bind({});
  });

  app.use('/view', router);

}