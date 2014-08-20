angular
.module('coverChallengeApp',
  [
    'ui.router',
    'ui.bootstrap',
    'angularMoment',
    'infinite-scroll',
    'videosharing-embed',
    'ngProgress',
    'ngCookies'
  ]
)
.constant('constants', {
  USER_COOKIE: 'coverChallenge.user'
})
.constant('authEvents', {
  LOGIN_SUCCESS: 'loginSuccess',
  LOGIN_FAILED: 'loginFailed',
  LOGOUT_SUCCESS: 'logoutSuccess',
  LOGOUT_FAILED: 'logoutFailed',
  SESSION_TIMEOUT: 'sessionTimeout',
  NOT_AUTHORIZED: 'not_authorized',
  NOT_AUTHENTICATED: 'not_authenticated',
  HTTP_NOT_AUTHENTICATED: 'http_not_authenticated'
})
.constant('accessLevel', {
  ADMIN: {name: 'ADMIN', roles: ['ADMIN']},
  USER: {name: 'USER', roles: ['USER', 'ADMIN']},
  PUBLIC: {name: 'PUBLIC', roles: ['PUBLIC', 'USER', 'ADMIN']},
  ANONYMOUS: {name: 'ANONYMOUS', roles: ['PUBLIC']}
})
.config(function($stateProvider, $urlRouterProvider, $locationProvider, $uiViewScrollProvider, $httpProvider, accessLevel) {
  // $locationProvider.html5Mode(true);
  $uiViewScrollProvider.useAnchorScroll();
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: '/app/partials/index.html',
      controller: 'indexController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
          return viewService.indexView();
        }
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: '/app/partials/login.html',
      controller: 'loginController',
      accessLevel: accessLevel.ANONYMOUS
    })
    .state('addCover', {
      url: '/add-cover',
      templateUrl: '/app/partials/add-cover.html',
      controller: 'addCoverController',
      accessLevel: accessLevel.ADMIN,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
          return viewService.addCoverView();
        }
      }
    })
    .state('cover', {
      url: '/cover/:id',
      templateUrl: '/app/partials/cover.html',
      controller: 'coverController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.coverView($stateParams.id);
        }
      }
    })
    .state('coversRank', {
      url: '/covers/:rank',
      templateUrl: '/app/partials/covers-rank.html',
      controller: 'coversRankController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.coversRankView($stateParams.rank);
        }
      }
    })
    .state('artist', {
      url: '/artist/:artist?sort',
      templateUrl: '/app/partials/artist.html',
      controller: 'artistController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.artistView($stateParams.artist, $stateParams.sort);
        }
      }
    })
    .state('artists', {
      url: '/artists?genre',
      templateUrl: '/app/partials/artists.html',
      controller: 'artistsController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.artistsView($stateParams.genre);
        }
      }
    })
    .state('music', {
      url: '/music/:music?sort',
      templateUrl: '/app/partials/music.html',
      controller: 'musicController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.musicView($stateParams.music, $stateParams.sort);
        }
      }
    })
    .state('musicGenre', {
      url: '/genre/:genre',
      templateUrl: '/app/partials/music-genre.html',
      controller: 'musicGenreController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.musicGenreView($stateParams.genre);
        }
      }
    })
    .state('musicGenreRank', {
      url: '/genre/:genre/:rank',
      templateUrl: '/app/partials/music-genre-rank.html',
      controller: 'musicGenreRankController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.musicGenreRankView($stateParams.genre, $stateParams.rank);
        }
      }
    })
    .state('search', {
      url: '/search?q',
      templateUrl: '/app/partials/search.html',
      controller: 'searchController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.searchView($stateParams.q);
        }
      }
    })
    .state('admin', {
      url: '/admin',
      templateUrl: '/app/partials/admin.html',
      controller: 'adminController',
      accessLevel: accessLevel.ADMIN,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
          return viewService.adminView();
        }
      }
    });

  $httpProvider.interceptors.push(['$injector', function ($injector) {
    return $injector.get('httpAuthInterceptor');
  }]);
})
.run(['$rootScope', '$state', 'authEvents', 'authenticationService', 'alertService', function($rootScope, $state, authEvents, authenticationService, alertService) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if(error.status === 404) {
      $state.go('404', null, {location: false});
    } else if(error.status === 500) {
      $state.go('500', null, {location: false});
    }
  });
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!authenticationService.isAuthorized(toState.accessLevel)) {
      event.preventDefault();
      if (authenticationService.isAuthenticated()) {
        $rootScope.$broadcast(authEvents.NOT_AUTHORIZED);
      } else {
        $rootScope.$broadcast(authEvents.NOT_AUTHENTICATED);
      }
    }
  });
}]);