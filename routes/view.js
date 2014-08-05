var coverService = require('../apis/coverService'),
    Promise      = require('bluebird');

module.exports = function(router, app) {

  router.get('/index', function(req, res, next) {
    Promise
    .all([coverService.topCover(), coverService.bestCovers(7, 1, 8), coverService.latestCovers(7, 1, 8), coverService.allMusicGenres()])
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
        .all([coverService.bestCoversOfMusic(cover.related('music'), 1, 8), coverService.bestCoversByArtist(cover.related('artist'), 1, 8)])
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
    var period = req.param('period') || 7;
    var pageSize = req.param('pageSize');
    var promiseRank = rank === 'best' ? coverService.bestCovers(period, 1, pageSize) : coverService.latestCovers(period, 1, pageSize);
    var promiseTotal = rank === 'best' ? coverService.totalBestCovers(period) : coverService.totalLatestCovers(period);
    Promise.all([promiseRank, promiseTotal])
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
    coverService.getArtistBySlug(slug).bind({}).then(function(artist) {
      if(!artist) {

      } else {
        Promise.all([coverService.totalMusicsByArtist(artist), coverService.lastMusicsByArtist(artist, 1, 5)])
        .spread(function(totalMusicsByArtist, musicsByArtist) {
          this.totalMusicsByArtist = totalMusicsByArtist;
          this.musicsByArtist = musicsByArtist;
          return coverService.latestCoversOfMusics(musicsByArtist, 12);
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

  router.get('/music/:slug', function(req, res, next) {
  });

  router.get('/genre/:slug', function(req, res, next) {
  });

  app.use('/view', router);

}