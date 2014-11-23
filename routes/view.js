var coverService    = require('../apis/coverService'),
    contestService  = require('../apis/contestService'),
    userService     = require('../apis/userService'),
    constants       = require('../apis/constants'),
    messages        = require('../apis/messages'),
    isAdmin         = require('../utils/authorization').isAdmin,
    isAuthenticated = require('../utils/authorization').isAuthenticated,
    math            = require('../utils/math'),
    Promise         = require('bluebird');

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
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/addCover', isAdmin, function(req, res, next) {
    coverService.musicGenres().then(function(musicGenres) {
      res.json({
        musicGenres: musicGenres
      });
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    })
  });

  // AUTHENTICATED ROUTES

  router.get('/register', isAuthenticated, function(req, res, next) {
    if(req.user.id) {
      messages.respondWithRedirection('index', {}, res);
    } else {
      res.json({});
    }
  });

  router.get('/settings', isAuthenticated, function(req, res, next) {
    res.json({});
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
      console.log(err);
      messages.respondWithError(err, res);
    }).bind();
  });

  router.get('/cover/:id/:slug', function(req, res, next) {
    var id = req.param('id');
    var slug = req.param('slug');
    coverService.getCover(id).then(function(cover) {
      if(!cover) {
        messages.respondWithNotFound(res);
      } else if(slug !== cover.get('slug')) {
        messages.respondWithMovedPermanently('cover', {id: cover.id, slug: cover.get('slug')}, res);
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
      console.log(err);
      messages.respondWithError(err, res);
    })
  });

  router.get('/covers/:rank', function(req, res, next) {
    var rank = req.param('rank');
    var page = req.param('page') || constants.FIRST_PAGE;
    if(!validRankType(rank)) {
      messages.respondWithNotFound(res);
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
        console.log(err);
        messages.respondWithError(err, res);
      }).bind({});
    }
  });

  router.get('/artist/:slug', function(req, res, next) {
    var slug = req.param('slug');
    var rank = req.param('rank') || 'best';
    coverService.getArtistBySlug(slug).bind({}).then(function(artist) {
      if(!artist) {
        messages.respondWithNotFound(res);
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
      console.log(err);
      messages.respondWithError(err, res);
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
      console.log(err);
      messages.respondWithError(err, res);
    }).bind({});
  });

  router.get('/music/:slug', function(req, res, next) {
    var slug = req.param('slug');
    var rank = req.param('rank') || 'best';
    coverService.getMusicBySlug(slug).bind({}).then(function(music) {
      if(!music) {
        messages.respondWithNotFound(res);
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
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/genre/:slug', function(req, res, next) {
    var slug = req.param('slug');
    coverService.getMusicGenreBySlug(slug).then(function(musicGenre) {
      if(!musicGenre) {
        messages.respondWithNotFound(res);
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
      console.log(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/genre/:slug/:rank', function(req, res, next) {
    var slug = req.param('slug');
    var rank = req.param('rank');
    var page = req.param('page') || constants.FIRST_PAGE;
    if(!validRankType(rank)) {
      messages.respondWithNotFound(res);
    } else {
      coverService.getMusicGenreBySlug(slug).then(function(musicGenre) {
        if(!musicGenre) {
          messages.respondWithNotFound(res);
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
        console.log(err);
        messages.respondWithError(err, res);
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
      messages.respondWithError(err, res);
    }).bind({});
  });

  router.get('/contest/:id/:slug', function(req, res, next) {
    var id = req.param('id');
    var slug = req.param('slug');
    var rankType = req.param('rank') || 'best';
    contestService.getContest(id).then(function(contest) {
      if(!contest) {
        messages.respondWithNotFound(res);
      } else if(slug !== contest.get('slug')) {
        messages.respondWithMovedPermanently('contest', {id: contest.id, slug: contest.get('slug')}, res);
      } else {
        contest.set('progress', contest.getProgress());
        var auditionsPromise = rankType === 'best' && contest.get('progress') !== 'waiting' ? contestService.bestAuditions : contestService.latestAuditions;
        var winnersPromise = contest.get('progress') === 'finished' ? contestService.getWinnerAuditions(contest) : null;
        Promise.all([auditionsPromise(contest, constants.FIRST_PAGE, constants.NUMBER_OF_AUDITIONS_IN_LIST), contestService.totalAuditions(contest), contestService.getUserAudition(req.user, contest), winnersPromise])
        .spread(function(auditions, totalAuditions, audition, winnerAuditions) {
          this.auditions = auditions;
          this.totalAuditions = totalAuditions;
          this.audition = audition;
          this.winnerAuditions = winnerAuditions;
          return Promise.all([contestService.getScoreByAudition(auditions), contestService.getVotesByAudition(auditions)]);
        }).spread(function(scoreByAudition, votesByAudition) {
          res.json({
            contest: contest,
            winnerAuditions: winnerAuditions,
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
      console.log(err);
      messages.respondWithError(err, res);
    })
  });

  router.get('/contest/:id/:slug/join', function(req, res, next) {
    var id = req.param('id');
    var slug = req.param('slug');
    contestService.getContest(id).then(function(contest) {
      if(!contest) {
        messages.respondWithNotFound(res);
      } else if(slug !== contest.get('slug')) {
        messages.respondWithMovedPermanently('joinContest', {id: contest.id, slug: contest.get('slug')}, res);
      } else {
        contest.set('progress', contest.getProgress());
        res.json({
          contest: contest
        });
      }
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    })
  });

  router.get('/audition/:id/:slug', function(req, res, next) {
    var id = req.param('id');
    var slug = req.param('slug');
    contestService.getAudition(id).then(function(audition) {
      if(!audition) {
        messages.respondWithNotFound(res);
      } else if(slug !== audition.get('slug')) {
        messages.respondWithMovedPermanently('audition', {id: audition.id, slug: audition.get('slug')}, res);
      } else {
        var contest = audition.related('contest');
        contest.set('progress', contest.getProgress());
        Promise.all([contestService.countUserVotes(req.user, contest), contestService.getUserVote(req.user, audition), contestService.getAuditionVotes(audition), contestService.getAuditionScore(audition), contestService.bestAuditions(contest, 1, 8), contestService.latestAuditions(contest, 1, 8), contestService.totalAuditions(contest)])
        .spread(function(totalUserVotes, userVote, votes, score, bestAuditions, latestAuditions, totalAuditions) {
          res.json({
            contest: contest,
            audition: audition,
            userVote: userVote,
            bestAuditions: bestAuditions,
            latestAuditions: latestAuditions,
            totalAuditions: totalAuditions,
            totalUserVotes: totalUserVotes,
            voteLimit: constants.VOTE_LIMIT,
            votes: votes,
            score: score
          });
        });
      }
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    })
  });

  router.get('/user/:id', function(req, res, next) {
    var id = req.param('id');
    userService.getUser(id).then(function(user) {
      if(!user) {
        messages.respondWithNotFound(res);
      } else {
        contestService.getUserAuditions(user).then(function(auditions) {
          res.json({
            user: user,
            auditions: auditions
          });
        });
      }
    }).catch(function(err) {
      console.log(err);
      messages.respondWithError(err, res);
    })
  });

  app.use('/view', router);

}