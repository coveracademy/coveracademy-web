var coverService   = require('../apis/coverService'),
    contestService = require('../apis/contestService'),
    userService    = require('../apis/userService'),
    constants      = require('../apis/constants'),
    isAdmin        = require('../utils/authorization').isAdmin,
    math           = require('../utils/math'),
    Promise        = require('bluebird');

module.exports = function(router, app) {

  function validRankType(rank) {
    return rank === 'best' || rank === 'latest';
  }

  // ADMIN ROUTES
  router.get('/admin', isAdmin, function(req, res, next) {
    Promise.all([coverService.musicGenres(), coverService.potentialCovers(constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_LIST)]).spread(function(musicGenres, potentialCovers) {
      res.json({
        musicGenres: musicGenres,
        potentialCovers: potentialCovers
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    });
  });

  router.get('/addCover', isAdmin, function(req, res, next) {
    coverService.musicGenres().then(function(musicGenres) {
      res.json({
        musicGenres: musicGenres
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    })
  });

  // PUBLIC ROUTES
  router.get('/index', function(req, res, next) {
    Promise
    .all([coverService.topCover(), coverService.bestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST), coverService.latestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST), coverService.musicGenres()])
    .spread(function(topCover, bestCovers, latestCovers, musicGenres) {
      this.topCover = topCover;
      this.bestCovers = bestCovers;
      this.latestCovers = latestCovers;
      this.musicGenres = musicGenres;

      var musicGenre = musicGenres.at(math.getRandomInt(0, musicGenres.size() - 1));
      return coverService.bestArtistsOfMusicGenre(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_ARTISTS_IN_INDEX_VIEW);
    }).then(function(bestArtistsOfMusicGenre) {
      res.json({
        topCover: this.topCover,
        bestCovers: this.bestCovers,
        latestCovers: this.latestCovers,
        musicGenres: this.musicGenres,
        bestArtistsOfMusicGenre: bestArtistsOfMusicGenre
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    }).bind();
  });

  router.get('/cover/:id/:slug', function(req, res, next) {
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
      var coversPromise = rank === 'best' ? coverService.bestCovers(constants.WEEK_PERIOD, page, constants.NUMBER_OF_COVERS_IN_LIST) : coverService.latestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_LIST);
      Promise.all([coversPromise, coverService.totalCovers(constants.WEEK_PERIOD)])
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
    var rank = req.param('rank') || 'best';
    coverService.getArtistBySlug(slug).bind({}).then(function(artist) {
      if(!artist) {
        res.send(404);
      } else {
        Promise.all([coverService.totalMusicsByArtist(artist), coverService.lastMusicsByArtist(artist, constants.FIRST_PAGE, constants.NUMBER_OF_MUSICS_BY_ARTIST)])
        .spread(function(totalMusicsByArtist, musicsByArtist) {
          this.totalMusicsByArtist = totalMusicsByArtist;
          this.musicsByArtist = musicsByArtist;
          var coversOfMusics;
          if(rank === 'best') {
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
    var rank = req.param('rank') || 'best';
    coverService.getMusicBySlug(slug).bind({}).then(function(music) {
      if(!music) {
        res.send(404);
      } else {
        var coversOfMusicPromise = rank === 'best' ? coverService.bestCoversOfMusic : coverService.latestCoversOfMusic;
        Promise.all([coverService.totalCoversOfMusic(music), coversOfMusicPromise(music, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_LIST)])
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
          var coversOfMusicGenrePromise = rank === 'best' ? coverService.bestCoversOfMusicGenre : coverService.latestCoversOfMusicGenre;
          Promise.all([coversOfMusicGenrePromise(musicGenre, page, constants.NUMBER_OF_COVERS_IN_LIST), coverService.totalCoversOfMusicGenre(musicGenre)]).bind({})
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

  router.get('/contest/:id/:slug', function(req, res, next) {
    var id = req.param('id');
    var rankType = req.param('rank') || 'best';
    contestService.getContest(id).then(function(contest) {
      if(!contest) {
        res.send(404);
      } else {
        contest.set('progress', contest.getProgress());
        var auditionsPromise = rankType === 'best' ? contestService.bestAuditions : contestService.latestAuditions;
        Promise.all([auditionsPromise(contest, constants.FIRST_PAGE, constants.NUMBER_OF_AUDITIONS_IN_LIST), contestService.totalAuditions(contest), contestService.getUserAudition(req.user, contest)])
        .spread(function(auditions, totalAuditions, audition) {
          this.auditions = auditions;
          this.totalAuditions = totalAuditions;
          this.audition = audition;
          return Promise.all([contestService.getScoreByAudition(auditions), contestService.getVotesByAudition(auditions)]);
        }).spread(function(scoreByAudition, votesByAudition) {
          res.json({
            contest: contest,
            auditions: this.auditions,
            audition: this.audition,
            totalAuditions: this.totalAuditions,
            scoreByAudition: scoreByAudition,
            votesByAudition: votesByAudition,
            rankType: rankType
          });
        }).bind({});
      }
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    })
  });

  router.get('/contest/:id/:slug/join', function(req, res, next) {
    var id = req.param('id');
    contestService.getContest(id).then(function(contest) {
      if(!contest) {
        res.send(404);
      } else {
        contest.set('progress', contest.getProgress());
        res.json({
          contest: contest
        });
      }
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    })
  });

  router.get('/audition/:id/:slug', function(req, res, next) {
    var id = req.param('id');
    var slug = req.param('slug');
    contestService.getAudition(id).then(function(audition) {
      if(!audition) {
        res.send(404);
      } else {
        var contest = audition.related('contest');
        contest.set('progress', contest.getProgress());
        Promise.all([contestService.getAuditionVote(req.user, audition), contestService.getAuditionVotes(audition), contestService.getAuditionScore(audition), contestService.bestAuditions(contest, 1, 8), contestService.latestAuditions(contest, 1, 8), contestService.totalAuditions(contest)])
        .spread(function(auditionVote, votes, score, bestAuditions, latestAuditions, totalAuditions) {
          res.json({
            contest: contest,
            audition: audition,
            auditionVote: auditionVote,
            bestAuditions: bestAuditions,
            latestAuditions: latestAuditions,
            totalAuditions: totalAuditions,
            votes: votes,
            score: score
          });
        });
      }
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    })
  });

  router.get('/user/:id', function(req, res, next) {
    var id = req.param('id');
    userService.getUser(id).then(function(user) {
      if(!user) {
        res.send(404);
      } else {
        res.json({
          user: user
        });
      }
    }).catch(function(err) {
      console.log(err.stack);
      res.send(500);
    })
  });

  app.use('/view', router);

}