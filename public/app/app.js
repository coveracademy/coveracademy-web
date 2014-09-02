angular
.module('coverChallengeApp', [
  'coverChallengeApp.providers',
  'coverChallengeApp.factories',
  'coverChallengeApp.services',
  'coverChallengeApp.directives',
  'coverChallengeApp.filters',
  'coverChallengeApp.controllers',
  'angularMoment',
  'ngCookies',
  'ngProgress',
  'pascalprecht.translate',
  'ui.router',
  'ui.bootstrap',
  'videosharing-embed'
])
.constant('constants', {
  DOMAIN: 'http://www.promessadepolitico.com.br',
  USER_COOKIE: 'coverChallenge.user'
})
.constant('authEvents', {
  LOGIN_SUCCESS: 'loginSuccess',
  LOGIN_FAILED: 'loginFailed',
  LOGOUT_SUCCESS: 'logoutSuccess',
  LOGOUT_FAILED: 'logoutFailed',
  SESSION_TIMEOUT: 'sessionTimeout',
  NOT_AUTHORIZED: 'notAuthorized',
  NOT_AUTHENTICATED: 'notAuthenticated',
  HTTP_NOT_AUTHENTICATED: 'httpNotAuthenticated'
})
.constant('accessLevel', {
  ADMIN: {name: 'admin', roles: ['admin']},
  USER: {name: 'user', roles: ['user', 'admin']},
  PUBLIC: {name: 'public', roles: ['public', 'user', 'admin']},
  ANONYMOUS: {name: 'anonymous', roles: ['public']}
})
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$uiViewScrollProvider', '$httpProvider', '$translateProvider', '$languagesProvider', 'accessLevel', function($stateProvider, $urlRouterProvider, $locationProvider, $uiViewScrollProvider, $httpProvider, $translateProvider, $languagesProvider, accessLevel) {
  // Internationalization
  $languagesProvider.getLanguages().forEach(function(language) {
    $translateProvider.translations(language.id, language.table);
  });
  $translateProvider.preferredLanguage($languagesProvider.getPreferredLanguage().id);
  $translateProvider.fallbackLanguage($languagesProvider.getFallbackLanguage().id);
  $translateProvider.useCookieStorage();

  // Routes
  $httpProvider.interceptors.push('authHttpInterceptor');
  $locationProvider.html5Mode(true);
  $uiViewScrollProvider.useAnchorScroll();
  $urlRouterProvider.otherwise('/');
  $stateProvider
    // Admin states
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
    // Anonymous states
    .state('login', {
      url: '/login',
      templateUrl: '/app/partials/login.html',
      controller: 'loginController',
      accessLevel: accessLevel.ANONYMOUS
    })
    // Public states
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
    .state('about', {
      url: '/about',
      templateUrl: '/app/partials/about.html',
      accessLevel: accessLevel.PUBLIC
    })
    .state('contact', {
      url: '/contact',
      templateUrl: '/app/partials/contact.html',
      controller: 'contactController',
      accessLevel: accessLevel.PUBLIC
    })
    .state('cover', {
      url: '/cover/:id/:slug',
      templateUrl: '/app/partials/cover.html',
      controller: 'coverController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.coverView($stateParams.id, $stateParams.slug);
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
      url: '/artist/:artist?rank',
      templateUrl: '/app/partials/artist.html',
      controller: 'artistController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.artistView($stateParams.artist, $stateParams.rank);
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
      url: '/music/:music?rank',
      templateUrl: '/app/partials/music.html',
      controller: 'musicController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.musicView($stateParams.music, $stateParams.rank);
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
    // Error states
    .state('404', {
      templateUrl: '/app/partials/errors/404.html'
    })
    .state('500', {
      templateUrl: '/app/partials/errors/500.html'
    });
}])
.run(['$rootScope', '$state', '$translate', 'amMoment', 'paginationConfig', 'authEvents', 'authenticationService', 'seoService', function($rootScope, $state, $translate, amMoment, paginationConfig, authEvents, authenticationService, seoService) {
  // Ui-Router events
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
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if(error.status === 401) {
      if(authenticationService.isAuthenticated()) {
        $rootScope.$broadcast(authEvents.NOT_AUTHORIZED);
      } else {
        $rootScope.$broadcast(authEvents.NOT_AUTHENTICATED);
      }
    } else if(error.status === 404) {
      $state.go('404', null, {location: false});
    } else if(error.status === 500) {
      $state.go('500', null, {location: false});
    }
  });
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    seoService.reset();
  });
  $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
    $state.go('404', null, {location: false});
  });
  // Angular-Translate events
  $rootScope.$on('$translateChangeSuccess', function() {
    if($translate.use() === 'en') {
      amMoment.changeLanguage('en');
      paginationConfig.firstText = 'First';
      paginationConfig.lastText = 'Last';
      paginationConfig.previousText = 'Previous';
      paginationConfig.nextText = 'Next';
    } else {
      amMoment.changeLanguage('pt-br');
      paginationConfig.firstText = 'Primeira';
      paginationConfig.lastText = 'Última';
      paginationConfig.previousText = 'Anterior';
      paginationConfig.nextText = 'Próxima';
    }
  });
  // Force angular-translate to emit $translateChangeSuccess when run application
  $translate.use($translate.use());
}]);