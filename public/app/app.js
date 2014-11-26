angular
.module('coverAcademy', [
  'coverAcademy.providers',
  'coverAcademy.factories',
  'coverAcademy.services',
  'coverAcademy.directives',
  'coverAcademy.filters',
  'coverAcademy.controllers',
  'angularMoment',
  'angulartics',
  'angulartics.google.analytics',
  'flow',
  'ngCookies',
  'ngPasswordStrength',
  'ngProgress',
  'ngSanitize',
  'pascalprecht.translate',
  'timer',
  'ui.router',
  'ui.bootstrap',
  'videosharing-embed'
])
.constant('constants', {
  SITE_NAME: 'Cover Academy',
  SITE_URL: 'http://www.coveracademy.com',
  LOGO_URL: 'http://www.coveracademy.com/img/logos/pretty-logo.jpg',
  USER_COOKIE: 'CoverAcademy.user'
})
.constant('authEvents', {
  MUST_REGISTER: 'mustRegister',
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
.constant('redirections', {
  audition: 'app.audition',
  contest: 'app.contest',
  cover: 'app.cover',
  covers: 'app.covers',
  index: 'app.index',
  joinContest: 'app.joinContest'
})
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$uiViewScrollProvider', '$httpProvider', '$translateProvider', '$languagesProvider', 'accessLevel', function($stateProvider, $urlRouterProvider, $locationProvider, $uiViewScrollProvider, $httpProvider, $translateProvider, $languagesProvider, accessLevel) {
  // Internationalization
  $languagesProvider.getLanguages().forEach(function(language) {
    $translateProvider.translations(language.id, language.table);
  });
  $translateProvider.preferredLanguage($languagesProvider.getPreferredLanguage().id);
  $translateProvider.fallbackLanguage($languagesProvider.getFallbackLanguage().id);
  $translateProvider.useCookieStorage();

  // Interceptors
  $httpProvider.interceptors.push('authHttpInterceptor');
  // $httpProvider.interceptors.push('ngProgressHttpInterceptor');

  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
  $uiViewScrollProvider.useAnchorScroll();
  $urlRouterProvider.otherwise('/');
  // Routes
  $stateProvider
    .state('root', {
      url: '/',
      controller: 'rootController',
      accessLevel: accessLevel.PUBLIC
    })
    .state('app', {
      url: '/:locale',
      abstract: true,
      template: '<ui-view autoscroll="true"/>'
    })
    // Admin level states
    .state('app.admin', {
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
    .state('app.addCover', {
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
    // User level states
    .state('app.register', {
      url: '/register',
      templateUrl: '/app/partials/register.html',
      controller: 'registerController',
      accessLevel: accessLevel.USER,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.registerView();
        }
      }
    })
    .state('app.settings', {
      url: '/settings',
      templateUrl: '/app/partials/settings.html',
      controller: 'settingsController',
      accessLevel: accessLevel.USER,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.settingsView();
        }
      }
    })
    // Public level states
    .state('app.index', {
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
    // .state('app.about', {
    //   url: '/about',
    //   templateUrl: '/app/partials/about.html',
    //   accessLevel: accessLevel.PUBLIC
    // })
    .state('app.contact', {
      url: '/contact',
      templateUrl: '/app/partials/contact.html',
      controller: 'contactController',
      accessLevel: accessLevel.PUBLIC
    })
    .state('app.covers', {
      url: '/covers',
      templateUrl: '/app/partials/covers.html',
      controller: 'coversController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
          return viewService.coversView();
        }
      }
    })
    .state('app.cover', {
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
    .state('app.coversRank', {
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
    .state('app.artist', {
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
    .state('app.artists', {
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
    .state('app.music', {
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
    .state('app.musicGenre', {
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
    .state('app.musicGenreRank', {
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
    .state('app.search', {
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
    .state('app.contest', {
      url: '/contest/:id/:slug?rank',
      templateUrl: '/app/partials/contest.html',
      controller: 'contestController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.contestView($stateParams.id, $stateParams.slug, $stateParams.rank);
        }
      }
    })
    .state('app.contestGuideline', {
      url: '/contest/guideline',
      templateUrl: '/app/partials/contest-guideline.html',
      controller: 'guidelineController',
      accessLevel: accessLevel.PUBLIC
    })
    .state('app.joinContest', {
      url: '/contest/:id/:slug/join',
      templateUrl: '/app/partials/join-contest.html',
      controller: 'joinContestController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.joinContestView($stateParams.id, $stateParams.slug);
        }
      }
    })
    .state('app.audition', {
      url: '/audition/:id/:slug',
      templateUrl: '/app/partials/audition.html',
      controller: 'auditionController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.auditionView($stateParams.id, $stateParams.slug);
        }
      }
    })
    .state('app.user', {
      url: '/user/:id',
      templateUrl: '/app/partials/user.html',
      controller: 'userController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.userView($stateParams.id);
        }
      }
    })
    .state('app.privacyPolicy', {
      url: '/privacy',
      templateUrl: '/app/partials/privacy-policy.html',
      controller: 'privacyPolicyController',
      accessLevel: accessLevel.PUBLIC
    })
    .state('app.termsOfUse', {
      url: '/terms',
      templateUrl: '/app/partials/terms-of-use.html',
      controller: 'termsOfUseController',
      accessLevel: accessLevel.PUBLIC
    })
    // Error states
    .state('app.404', {
      templateUrl: '/app/partials/errors/404.html'
    })
    .state('app.500', {
      templateUrl: '/app/partials/errors/500.html'
    });
}])
.run(['$rootScope', '$state', '$translate', '$languages', 'amMoment', 'paginationConfig', 'authEvents', 'redirections', 'authenticationService', 'seoService', function($rootScope, $state, $translate, $languages, amMoment, paginationConfig, authEvents, redirections, authenticationService, seoService) {
  // Angular-Translate events
  $rootScope.$on('$translateChangeSuccess', function() {
    if($translate.use() === 'en') {
      amMoment.changeLocale('en');
      paginationConfig.firstText = 'First';
      paginationConfig.lastText = 'Last';
      paginationConfig.previousText = 'Previous';
      paginationConfig.nextText = 'Next';
    } else {
      amMoment.changeLocale('pt-br');
      paginationConfig.firstText = 'Primeira';
      paginationConfig.lastText = 'Última';
      paginationConfig.previousText = 'Anterior';
      paginationConfig.nextText = 'Próxima';
    }
  });
  // Ui-Router events
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    // Check if locale param is a supported language
    if(toState.name !== 'root' && !$languages.contains(toParams.locale)) {
      event.preventDefault();
      $state.go('app.404', {locale: $translate.use()}, {location: false});
    } else {
      // Check if user has permission to access a view
      if (!authenticationService.isAuthorized(toState.accessLevel)) {
        event.preventDefault();
        if (authenticationService.isAuthenticated()) {
          $rootScope.$broadcast(authEvents.NOT_AUTHORIZED);
        } else {
          $rootScope.$broadcast(authEvents.NOT_AUTHENTICATED);
        }
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
      $state.go('app.404', {locale: $translate.use()}, {location: false});
    } else if(error.status === 500) {
      $state.go('app.500', {locale: $translate.use()}, {location: false});
    } else if(error.status === 301 || error.status === 302) {
      $state.go(redirections[error.data.toView], angular.extend(error.data.toParams, {locale: $translate.use()}));
    }
  });
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    seoService.reset();
    // Force angular-translate to emit $translateChangeSuccess and set the language
    $translate.use(toParams.locale);
  });
  $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
    $state.go('app.404', {locale: $translate.use()}, {location: false});
  });
}]);