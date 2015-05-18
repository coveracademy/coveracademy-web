'use strict';

var coverService    = require('../apis/coverService'),
    contestService  = require('../apis/contestService'),
    userService     = require('../apis/userService'),
    constants       = require('../apis/internal/constants'),
    messages        = require('../apis/internal/messages'),
    logger          = require('../configs/logger'),
    authorization   = require('../utils/authorization'),
    Promise         = require('bluebird'),
    _               = require('underscore'),
    isAdmin         = authorization.isAdmin,
    isAuthenticated = authorization.isAuthenticated,
    isTemporaryUser = authorization.isTemporaryUser;

module.exports = function(router, app) {

  function validRankType(rank) {
    return rank === 'best' || rank === 'latest';
  }

  // ADMIN ROUTES
  router.get('/covers/admin', isAdmin, function(req, res, next) {
    Promise.props({
      musicGenres: coverService.musicGenres(),
      potentialCovers: coverService.potentialCovers(constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_PAGE)
    }).then(function(result) {
      res.json(result);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/contests/admin', isAdmin, function(req, res, next) {
    Promise.props({
      contests: contestService.listUnfinishedContests(),
      auditionsToReview: contestService.listAuditionsToReview()
    }).then(function(result) {
      res.json(result);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/addCover', isAdmin, function(req, res, next) {
    coverService.musicGenres().then(function(musicGenres) {
      res.json({musicGenres: musicGenres});
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  // AUTHENTICATED ROUTES
  router.get('/settings', isAuthenticated, function(req, res, next) {
    res.json({});
  });

  // PUBLIC ROUTES
  router.get('/home', function(req, res, next) {
    Promise.props({
      runningContests: contestService.listRunningContests(['prizes']),
      waitingContests: contestService.listWaitingContests(['prizes']),
      latestWinnerAuditions: contestService.latestWinnerAuditions(),
      bestCovers: coverService.bestCovers(300, 1, 6),
      latestCovers: coverService.latestCovers(300, 1, 6),
      sponsors: contestService.listCurrentSponsors()
    }).bind({}).then(function(result) {
      this.result = result;
      return Promise.props({
        latestRunningContestsAuditions: contestService.latestContestsAuditions(result.runningContests, 3),
        latestWaitingContestsAuditions: contestService.latestContestsAuditions(result.waitingContests, 3),
        totalRunningContestsAuditions: contestService.totalAuditions(result.runningContests),
        totalWaitingContestsAuditions: contestService.totalAuditions(result.waitingContests)
      });
    }).then(function(result) {
      res.json(_.extend(this.result, result));
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
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
        return Promise.props({
          bestCoversOfMusic: coverService.bestCoversOfMusic(cover.related('music'), constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST),
          bestCoversByArtist: coverService.bestCoversByArtist(cover.related('artist'), constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST)
        }).then(function(result) {
          result.cover = cover;
          res.json(result);
        });
      }
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/covers', function(req, res, next) {
    Promise.props({
      topCover: coverService.topCover(),
      bestCovers: coverService.bestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST),
      latestCovers: coverService.latestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST),
      musicGenres: coverService.musicGenres()
    }).bind({}).then(function(result) {
      this.result = result;
      var musicGenre = result.musicGenres.at(_.random(0, result.musicGenres.size() - 1));
      return coverService.bestArtistsOfMusicGenre(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_ARTISTS_IN_INDEX_VIEW);
    }).then(function(bestArtistsOfMusicGenre) {
      this.result.bestArtistsOfMusicGenre = bestArtistsOfMusicGenre;
      res.json(this.result);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/covers/:rank', function(req, res, next) {
    var rank = req.param('rank');
    var page = req.param('page') || constants.FIRST_PAGE;
    if(!validRankType(rank)) {
      messages.respondWithNotFound(res);
    } else {
      var coversPromise = rank === 'best' ? coverService.bestCovers(constants.WEEK_PERIOD, page, constants.NUMBER_OF_COVERS_IN_PAGE) : coverService.latestCovers(constants.WEEK_PERIOD, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_PAGE);
      Promise.props({
        coversRank: coversPromise,
        totalCoversRank: coverService.totalCovers(constants.WEEK_PERIOD)
      }).bind({}).then(function(result) {
        this.result = result;
        return coverService.artistsOfCovers(result.coversRank);
      }).then(function(artistsOfCovers) {
        this.result.artistsOfCovers = artistsOfCovers;
        res.json(this.result);
      }).catch(function(err) {
        logger.error(err);
        messages.respondWithError(err, res);
      });
    }
  });

  router.get('/artist/:slug', function(req, res, next) {
    var slug = req.param('slug');
    var rank = req.param('rank') || 'best';
    coverService.getArtistBySlug(slug).then(function(artist) {
      if(!artist) {
        messages.respondWithNotFound(res);
      } else {
        return Promise.all([
          coverService.totalMusicsByArtist(artist),
          coverService.lastMusicsByArtist(artist, constants.FIRST_PAGE, constants.NUMBER_OF_MUSICS_BY_ARTIST)
        ]).bind({}).spread(function(totalMusicsByArtist, musicsByArtist) {
          this.totalMusicsByArtist = totalMusicsByArtist;
          this.musicsByArtist = musicsByArtist;
          var coversOfMusics = rank === 'best' ? coverService.bestCoversOfMusics : coverService.latestCoversOfMusics;
          return coversOfMusics(musicsByArtist, constants.NUMBER_OF_COVERS_OF_MUSIC);
        }).then(function(coversOfMusics) {
          this.coversOfMusics = coversOfMusics;
          this.artist = artist;
          res.json(this);
        });
      }
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/artists', function(req, res, next) {
    var genre = req.param('genre');
    coverService.getMusicGenreBySlug(genre).bind({}).then(function(musicGenre) {
      this.musicGenre = musicGenre;
      return Promise.all([coverService.listArtists(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_ARTISTS_IN_PAGE), coverService.totalArtists(musicGenre)]);
    }).spread(function(artists, totalArtists) {
      res.json({
        musicGenre: this.musicGenre,
        artists: artists,
        totalArtists: totalArtists
      });
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/music/:slug', function(req, res, next) {
    var slug = req.param('slug');
    var rank = req.param('rank') || 'best';
    coverService.getMusicBySlug(slug).then(function(music) {
      if(!music) {
        messages.respondWithNotFound(res);
      } else {
        var coversOfMusicPromise = rank === 'best' ? coverService.bestCoversOfMusic : coverService.latestCoversOfMusic;
        return Promise.all([
          coverService.totalCoversOfMusic(music),
          coversOfMusicPromise(music, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_PAGE)
        ]).spread(function(totalCoversOfMusic, coversOfMusic) {
          res.json({
            music: music,
            totalCoversOfMusic: totalCoversOfMusic,
            coversOfMusic: coversOfMusic
          });
        });
      }
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/genre/:slug', function(req, res, next) {
    var slug = req.param('slug');
    coverService.getMusicGenreBySlug(slug).then(function(musicGenre) {
      if(!musicGenre) {
        messages.respondWithNotFound(res);
      } else {
        return Promise.all([
          coverService.bestArtistsOfMusicGenre(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_ARTISTS_IN_SUMMARIZED_LIST),
          coverService.bestCoversOfMusicGenre(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST),
          coverService.latestCoversOfMusicGenre(musicGenre, constants.FIRST_PAGE, constants.NUMBER_OF_COVERS_IN_SUMMARIZED_LIST)
        ]).spread(function(bestArtistsOfMusicGenre, bestCoversOfMusicGenre, latestCoversOfMusicGenre) {
          res.json({
            musicGenre: musicGenre,
            bestArtistsOfMusicGenre: bestArtistsOfMusicGenre,
            bestCoversOfMusicGenre: bestCoversOfMusicGenre,
            latestCoversOfMusicGenre: latestCoversOfMusicGenre
          });
        });
      }
    }).catch(function(err) {
      logger.error(err);
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
          return Promise.all([
            coversOfMusicGenrePromise(musicGenre, page, constants.NUMBER_OF_COVERS_IN_PAGE),
            coverService.totalCoversOfMusicGenre(musicGenre)
          ]).spread(function(coversOfMusicGenre, totalCoversOfMusicGenre) {
            res.json({
              musicGenre: musicGenre,
              coversOfMusicGenre: coversOfMusicGenre,
              totalCoversOfMusicGenre: totalCoversOfMusicGenre
            });
          });
        }
      }).catch(function(err) {
        logger.error(err);
        messages.respondWithError(err, res);
      });
    }
  });

  router.get('/search', function(req, res, next) {
    var query = req.param('query');
    Promise.all([
      coverService.searchArtists(query),
      coverService.searchMusics(query)
    ]).bind({}).spread(function(artists, musics) {
      this.artists = artists;
      this.musics = musics;
      return Promise.all([coverService.bestCoversByArtists(artists, 6), coverService.bestCoversOfMusics(musics, 6)]);
    }).spread(function(coversByArtists, coversOfMusics) {
      this.coversByArtists = coversByArtists;
      this.coversOfMusics = coversOfMusics;
      res.json(this);
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/contest/:id/:slug', function(req, res, next) {
    var id = req.param('id');
    var slug = req.param('slug');
    var rankType = req.param('rank') || 'random';
    contestService.getContest(id).then(function(contest) {
      if(!contest) {
        messages.respondWithNotFound(res);
      } else if(slug !== contest.get('slug')) {
        messages.respondWithMovedPermanently('contest', {id: contest.id, slug: contest.get('slug')}, res);
      } else {
        if(contest.get('progress') === 'waiting') {
          rankType = 'latest';
        } else if(contest.get('progress') === 'finished') {
          rankType = 'best';
        }
        var auditionsPromise;
        if(rankType === 'best') {
          auditionsPromise = contestService.bestAuditions(contest);
        } else if(rankType === 'latest') {
          auditionsPromise = contestService.latestAuditions(contest);
        } else {
          auditionsPromise = contestService.randomAuditions(contest);
        }
        var winnersPromise = contest.get('progress') === 'finished' ? contestService.listWinnerAuditions(contest) : null;
        return Promise.props({
          auditions: auditionsPromise,
          totalAuditions: contestService.totalAuditions(contest),
          audition: contestService.getUserAudition(req.user, contest),
          winnerAuditions: winnersPromise,
          userVotes: contestService.getUserVotes(req.user, contest),
          totalUserVotes: contestService.countUserVotes(req.user, contest),
        }).bind({}).then(function(result) {
          this.result = result;
          return Promise.all([contestService.getScoreByAudition(result.auditions), contestService.getVotesByAudition(result.auditions)]);
        }).spread(function(scoreByAudition, votesByAudition) {
          this.result.scoreByAudition = scoreByAudition;
          this.result.votesByAudition = votesByAudition;
          this.result.contest = contest;
          this.result.voteLimit = constants.VOTE_LIMIT;
          this.result.rankType = rankType;
          res.json(this.result);
        });
      }
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
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
        return contestService.getUserAudition(req.user, contest).then(function(audition) {
          res.json({
            contest: contest,
            audition: audition
          });
        });
      }
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/contests', function(req, res, next) {
    contestService.latestContests(constants.FIRST_PAGE, constants.NUMBER_OF_CONTESTS_IN_PAGE).then(function(contests) {
      return Promise.all([contestService.totalVotes(contests), contestService.totalAuditions(contests), contestService.listWinnerAuditions(contests)]).spread(function(totalVotes, totalAuditions, winnerAuditions) {
        res.json({
          contests: contests,
          totalVotes: totalVotes,
          totalAuditions: totalAuditions,
          winnerAuditions: winnerAuditions
        });
      });
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/contestants', function(req, res, next) {
    contestService.latestContestants(constants.FIRST_PAGE, constants.NUMBER_OF_CONTESTANTS_IN_PAGE).then(function(contestants) {
      res.json({
        contestants: contestants
      });
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
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
        return Promise.props({
          totalUserVotes: contestService.countUserVotes(req.user, contest),
          userVote: contestService.getUserVote(req.user, audition),
          votes: contestService.getAuditionVotes(audition),
          score: contestService.getAuditionScore(audition),
          bestAuditions: contestService.bestAuditions(contest, 1, 8),
          latestAuditions: contestService.latestAuditions(contest, 1, 8),
          totalAuditions: contestService.totalAuditions(contest),
          comments: contestService.listComments(audition),
          fan: userService.isFan(req.user, audition.related('user'))
        }).then(function(result) {
          result.contest = contest;
          result.audition = audition;
          result.voteLimit = constants.VOTE_LIMIT;
          res.json(result);
        });
      }
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  var getUserInfos = function(user, req, res) {
    return Promise.props({
      fan: userService.isFan(req.user, user),
      fans: userService.latestFans(user, constants.FIRST_PAGE, constants.NUMBER_OF_FANS_IN_PAGE),
      totalFans: userService.totalFans(user),
      auditions: contestService.getUserAuditions(user)
    }).then(function(result) {
      result.user = user;
      res.json(result);
    });
  };

  router.get('/user/:username', function(req, res, next) {
    var username = req.param('username');
    userService.findByUsername(username, true).then(function(user) {
      if(!user) {
        messages.respondWithNotFound(res);
      } else {
        return getUserInfos(user, req, res);
      }
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/user', function(req, res, next) {
    var id = req.param('id');
    userService.findById(id, true).then(function(user) {
      if(!user) {
        messages.respondWithNotFound(res);
      } else if(user.get('username')) {
        messages.respondWithMovedPermanently('user', {username: user.get('username')}, res);
      } else {
        return getUserInfos(user, req, res);
      }
    }).catch(function(err) {
      logger.error(err);
      messages.respondWithError(err, res);
    });
  });

  router.get('/verify', function(req, res, next) {
    var token = req.param('token');
    if(!token) {
      messages.respondWithMovedPermanently('home', {}, res);
    } else {
      userService.verifyEmail(token).then(function(user) {
        res.json({user: user});
      }).catch(function(err) {
        logger.error(err);
        messages.respondWithMovedPermanently('home', {}, res);
      });
    }
  });

  router.get('/emails/disable', function(req, res, next) {
    var token = req.param('token');
    if(!token) {
      messages.respondWithMovedPermanently('home', {}, res);
    } else {
      userService.disableEmails(token).then(function(user) {
        res.json({user: user});
      }).catch(function(err) {
        logger.error(err);
        messages.respondWithMovedPermanently('home', {}, res);
      });
    }
  });

  app.use('/view', router);

};