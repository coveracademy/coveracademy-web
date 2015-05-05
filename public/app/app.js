'use strict';

angular
.module('coverAcademy', [
  'coverAcademy.providers',
  'coverAcademy.factories',
  'coverAcademy.services',
  'coverAcademy.directives',
  'coverAcademy.filters',
  'coverAcademy.controllers',
  'angular-loading-bar',
  'angularMoment',
  'angulartics',
  'angulartics.google.analytics',
  'infinite-scroll',
  'ngCookies',
  'ngProgress',
  'ngSanitize',
  'pascalprecht.translate',
  'timer',
  'textAngular',
  'ui.router',
  'ui.bootstrap',
  'videosharing-embed'
])
.constant('constants', {
  SITE_NAME: 'Cover Academy',
  SITE_URL: 'http://www.coveracademy.com',
  LOGO_URL: 'http://www.coveracademy.com/img/logos/pretty-logo.jpg',
  USER_COOKIE: 'coverAcademy.user'
})
.constant('authEvents', {
  USER_REGISTERED: 'userRegistered',
  FAIL_REGISTERING_USER: 'failRegisteringUser',
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
  contests: 'app.contests',
  cover: 'app.cover',
  covers: 'app.covers',
  index: 'app.index',
  joinContest: 'app.joinContest',
  user: 'app.user'
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

  // Settings
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
  $uiViewScrollProvider.useAnchorScroll();

  // States
  $stateProvider
    // Basic states
    .state('root', {
      url: '/',
      accessLevel: accessLevel.PUBLIC
    })
    .state('app', {
      url: '/:locale',
      abstract: true,
      template: '<ui-view autoscroll="true"/>',
      accessLevel: accessLevel.PUBLIC
    })
    // Admin level states
    .state('app.contestsAdmin', {
      url: '/contests/admin',
      templateUrl: '/app/partials/contests-admin.html',
      controller: 'contestsAdminController',
      accessLevel: accessLevel.ADMIN,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
          return viewService.contestsAdminView();
        }
      }
    })
    .state('app.coversAdmin', {
      url: '/covers/admin',
      templateUrl: '/app/partials/covers-admin.html',
      controller: 'coversAdminController',
      accessLevel: accessLevel.ADMIN,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
          return viewService.coversAdminView();
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
    .state('app.settings', {
      url: '/settings',
      templateUrl: '/app/partials/settings.html',
      controller: 'settingsController',
      accessLevel: accessLevel.USER,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
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
    .state('app.contests', {
      url: '/contests',
      templateUrl: '/app/partials/contests.html',
      controller: 'contestsController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
          return viewService.contestsView();
        }
      }
    })
    .state('app.contestants', {
      url: '/contestants',
      templateUrl: '/app/partials/contestants.html',
      controller: 'contestantsController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function(viewService) {
          return viewService.contestantsView();
        }
      }
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
      url: '/user/:username',
      templateUrl: '/app/partials/user.html',
      controller: 'userController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.userView($stateParams.username);
        }
      }
    })
    .state('app.userId', {
      url: '/user?id',
      templateUrl: '/app/partials/user.html',
      controller: 'userController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.userIdView($stateParams.id);
        }
      }
    })
    .state('app.verify', {
      url: '/verify?token',
      templateUrl: '/app/partials/verify.html',
      controller: 'verifyEmailController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.verifyView($stateParams.token);
        }
      }
    })
    .state('app.disableEmails', {
      url: '/emails/disable?token',
      templateUrl: '/app/partials/disable-emails.html',
      controller: 'disableEmailsController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        viewService: 'viewService',
        backendResponse: function($stateParams, viewService) {
          return viewService.disableEmailsView($stateParams.token);
        }
      }
    })
    .state('app.contestGuideline', {
      url: '/contest/guideline',
      templateUrl: '/app/partials/contest-guideline.html',
      controller: 'guidelineController',
      accessLevel: accessLevel.PUBLIC
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
      templateUrl: '/app/partials/errors/404.html',
      controller: 'errorController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        errorCode: function() {
          return 404;
        }
      }
    })
    .state('app.500', {
      templateUrl: '/app/partials/errors/500.html',
      controller: 'errorController',
      accessLevel: accessLevel.PUBLIC,
      resolve: {
        errorCode: function() {
          return 500;
        }
      }
    })
    .state('otherwise', {
      url: '*path',
      accessLevel: accessLevel.PUBLIC
    });
}])
.run(['$rootScope', '$translate', '$languages', 'amMoment', 'paginationConfig', 'authEvents', 'redirections', 'authenticationService', 'seoService', 'stateService', function($rootScope, $translate, $languages, amMoment, paginationConfig, authEvents, redirections, authenticationService, seoService, stateService) {
  // Angular-Translate events
  $rootScope.$on('$translateChangeSuccess', function() {
    if($translate.use() === 'en') {
      // Change modules locale to 'en'
      amMoment.changeLocale('en');
      paginationConfig.firstText = 'First';
      paginationConfig.lastText = 'Last';
      paginationConfig.previousText = 'Previous';
      paginationConfig.nextText = 'Next';
    } else {
      // Change modules locale to default
      amMoment.changeLocale('pt-br');
      paginationConfig.firstText = 'Primeira';
      paginationConfig.lastText = 'Última';
      paginationConfig.previousText = 'Anterior';
      paginationConfig.nextText = 'Próxima';
    }
  });
  // Ui-Router events
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    // Root view must redirect to index view with locale param
    if(toState.name === 'root') {
      event.preventDefault();
      stateService.newState('app.index', {locale: $translate.use()}).withStatusCode(301).go();
    // Check if locale param is a supported language
    } else if(!$languages.contains(toParams.locale)) {
      event.preventDefault();
      stateService.newState('app.404', {locale: $translate.use()}, {location: false}).withStatusCode(404).go();
    // Check if user has permission to access a view
    } else if(!authenticationService.isAuthorized(toState.accessLevel)) {
      event.preventDefault();
      stateService.newState('app.index', {locale: $translate.use()}).withStatusCode(401).go();
    }
  });
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if(error.status === 401) {
      stateService.newState('app.index', {locale: $translate.use()}).withStatusCode(error.status).go();
    } else if(error.status === 404) {
      stateService.newState('app.404', {locale: $translate.use()}, {location: false}).withStatusCode(error.status).go();
    } else if(error.status === 500) {
      stateService.newState('app.500', {locale: $translate.use()}, {location: false}).withStatusCode(error.status).go();
    } else if(error.status === 301 || error.status === 302) {
      stateService.newState(redirections[error.data.toView], angular.extend(error.data.toParams, {locale: $translate.use()})).withStatusCode(error.status).go();
    }
  });
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    seoService.reset();
    // Force angular-translate to emit $translateChangeSuccess and set the language
    $translate.use(toParams.locale);
  });
  $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
    stateService.newState('app.404', {locale: $translate.use()}, {location: false}).withStatusCode(404).go();
  });
}]);