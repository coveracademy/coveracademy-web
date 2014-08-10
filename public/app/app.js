angular
.module('coverChallengeApp',
  [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'angularMoment',
    'infinite-scroll',
    'nya.bootstrap.select',
    'videosharing-embed',
    'ngProgress'
  ]
)
.constant('settings', {
  defaultCurrentPage: 1,
  defaultCurrentPeriod: 7,
  coversRankView: {
    coversPerPage: 20
  }
})
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: '/app/partials/index.html',
      controller: 'indexController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function(viewService) {
          return viewService.indexView();
        }
      }
    })
    .state('addCover', {
      url: '/add-cover',
      templateUrl: '/app/partials/add-cover.html',
      controller: 'addCoverController',
      resolve: {
        coverService: 'coverService',
        dataResponse: function(coverService) {
          return coverService.allMusicGenres();
        }
      }
    })
    .state('viewCover', {
      url: '/cover/:id',
      templateUrl: '/app/partials/view-cover.html',
      controller: 'viewCoverController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.coverView($stateParams.id);
        }
      }
    })
    .state('coversRank', {
      url: '/covers/:rank',
      templateUrl: '/app/partials/covers-rank.html',
      controller: 'coversRankController',
      resolve: {
        settings: 'settings',
        viewService: 'viewService',
        dataResponse: function($stateParams, settings, viewService) {
          return viewService.coversRankView($stateParams.rank, settings.coversRankView.coversPerPage);
        }
      }
    })
    .state('viewArtist', {
      url: '/artist/:artist?sort',
      templateUrl: '/app/partials/view-artist.html',
      controller: 'viewArtistController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.artistView($stateParams.artist, $stateParams.sort);
        }
      }
    })
    .state('viewMusic', {
      url: '/music/:music?sort',
      templateUrl: '/app/partials/view-music.html',
      controller: 'viewMusicController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.musicView($stateParams.music, $stateParams.sort);
        }
      }
    })
    .state('viewMusicGenre', {
      url: '/genre/:genre?sort',
      templateUrl: '/app/partials/view-music-genre.html',
      controller: 'viewMusicGenreController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.musicGenreView($stateParams.genre, $stateParams.sort);
        }
      }
    })
    .state('contact', {
      url: '/contact',
      templateUrl: '/app/partials/contact.html',
      controller: 'contactController'
    })
    .state('404', {templateUrl: '/app/partials/errors/404.html'});
});