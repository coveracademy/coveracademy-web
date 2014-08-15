angular
.module('coverChallengeApp',
  [
    'ui.router',
    'ui.bootstrap',
    'angularMoment',
    'infinite-scroll',
    'nya.bootstrap.select',
    'videosharing-embed',
    'ngProgress'
  ]
)
.config(function($stateProvider, $urlRouterProvider, $locationProvider, $uiViewScrollProvider) {
  $uiViewScrollProvider.useAnchorScroll();
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
        viewService: 'viewService',
        dataResponse: function(viewService) {
          return viewService.addCoverView();
        }
      }
    })
    .state('cover', {
      url: '/cover/:id',
      templateUrl: '/app/partials/cover.html',
      controller: 'coverController',
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
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.coversRankView($stateParams.rank);
        }
      }
    })
    .state('artist', {
      url: '/artist/:artist?sort',
      templateUrl: '/app/partials/artist.html',
      controller: 'artistController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.artistView($stateParams.artist, $stateParams.sort);
        }
      }
    })
    .state('artists', {
      url: '/artists?genre',
      templateUrl: '/app/partials/artists.html',
      controller: 'artistsController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.artistsView($stateParams.genre);
        }
      }
    })
    .state('music', {
      url: '/music/:music?sort',
      templateUrl: '/app/partials/music.html',
      controller: 'musicController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.musicView($stateParams.music, $stateParams.sort);
        }
      }
    })
    .state('musicGenre', {
      url: '/genre/:genre',
      templateUrl: '/app/partials/music-genre.html',
      controller: 'musicGenreController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.musicGenreView($stateParams.genre);
        }
      }
    })
    .state('musicGenreRank', {
      url: '/genre/:genre/:rank',
      templateUrl: '/app/partials/music-genre-rank.html',
      controller: 'musicGenreRankController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.musicGenreRankView($stateParams.genre, $stateParams.rank);
        }
      }
    })
    .state('search', {
      url: '/search?q',
      templateUrl: '/app/partials/search.html',
      controller: 'searchController',
      resolve: {
        viewService: 'viewService',
        dataResponse: function($stateParams, viewService) {
          return viewService.searchView($stateParams.q);
        }
      }
    })
    .state('404', {
      url: '/404',
      templateUrl: '/app/partials/errors/404.html'
    });
})
.run(['$rootScope', '$state', function ($rootScope, $state) {
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
     if(error.status === 404) {
      $state.go("404", null, {location: false});
    } else if(error.status === 500) {
      $state.go("500", null, {location: false});
    }
  });
}]);