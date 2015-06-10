'use strict';

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 1000);

angular
.module('coverAcademy.controllers', [])
.controller('applicationController', ['$rootScope', '$scope', '$state', '$stateParams', '$translate', '$underscore', 'authEvents', 'authenticationService', 'alertService', 'translationService', 'seoService', 'stateService', function($rootScope, $scope, $state, $stateParams, $translate, $underscore, authEvents, authenticationService, alertService, translationService, seoService, stateService) {
  $scope.locale = $translate.use;

  // SEO
  $scope.siteName = seoService.getSiteName;
  $scope.pageUrl = seoService.getUrl;
  $scope.pageTitle = seoService.getTitle;
  $scope.metaDescription = seoService.getDescription;
  $scope.metaKeywords = seoService.getKeywords;
  $scope.metaImage = seoService.getImage;

  // Authentication
  $scope.isAuthenticated = authenticationService.isAuthenticated;
  $scope.userAuthenticated = authenticationService.getUser;
  $scope.login = authenticationService.login;
  $scope.logout = authenticationService.logout;

  // Events
  $scope.$on(authEvents.NOT_AUTHORIZED, function() {
    $state.go('app.home', {locale: $scope.locale()});
  });
  $scope.$on(authEvents.NOT_AUTHENTICATED, function() {
    $state.go('app.home', {locale: $scope.locale()});
  });
  $scope.$on(authEvents.HTTP_NOT_AUTHENTICATED, function() {
    authenticationService.login();
  });
  $scope.$on(authEvents.LOGIN_FAILED, function(event, errorKey) {
    if(errorKey && errorKey.length > 0) {
      translationService.translateError(errorKey).then(function(translation) {
        alertService.alert('danger', translation);
      });
    } else {
      $translate('alerts.login_failed').then(function(translation) {
        alertService.alert('danger', translation);
      });
    }
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $state.go($state.current, $stateParams, {reload: true});
  });
  $rootScope.$on('$stateChangeSuccess', function() {
    $scope.statusCode = stateService.releaseLatestStatusCode();
  });

  // Utilities
  $scope.isLocale = function(locale) {
    return $translate.use() === locale;
  };
  $scope.userState = function(user) {
    if(user.username) {
      return 'app.user({locale: "' + $scope.locale() + '", username: "' + user.username + '"})';
    } else {
      return 'app.userId({locale: "' + $scope.locale() + '", id: "' + user.id + '"})';
    }
  };
  $scope.isState = function(states) {
    return $underscore.contains(states, $state.current.name);
  };
  $scope.isRedirectionStatusCode = function() {
    return $scope.statusCode === 301;
  };
  $scope.isUserVerified = function() {
    return $scope.isAuthenticated() && $scope.userAuthenticated().verified === 1;
  };
}])
.controller('headerController', ['$scope', '$state', '$languages', 'authenticationService', 'coverService', 'searchService', function($scope, $state, $languages, authenticationService, coverService, searchService) {
  $scope.searchQuery = '';
  $scope.languages = $languages.all;
  $scope.sectionActive = '';
  $scope.sections = {
    contests: ['app.contests'],
    contestants: ['app.contestants'],
    covers: ['app.cover', 'app.covers', 'app.coversRank', 'app.artist', 'app.artists', 'app.music', 'app.musicGenre', 'app.musicGenreRank', 'app.search']
  };
  $scope.isSectionActive = function(section) {
    var sectionExistent = $scope.sections[section];
    return sectionExistent && sectionExistent.indexOf($state.current.name) >= 0;
  };
  $scope.isRegisterState = function() {
    return $state.current.name === 'app.register';
  };
  $scope.searchMusicOrArtist = function(query) {
    return searchService.searchMusicOrArtist(query).then(function(response) {
      var queryResult = [];
      response.data.musics.forEach(function(music) {
        music.itemType = 'music';
        music.displayName = music.title + ' (' + music.artist.name + ')';
        queryResult.push(music);
      });
      response.data.artists.forEach(function(artist) {
        artist.itemType = 'artist';
        artist.displayName = artist.name;
        queryResult.push(artist);
      });
      return queryResult;
    });
  };
  $scope.selectItem = function(item) {
    if(item.itemType === 'music') {
      $state.go('app.music', {locale: $scope.locale(), music : item.slug});
    } else {
      $state.go('app.artist', {locale: $scope.locale(), artist : item.slug});
    }
  };
  $scope.submitSearch = function() {
    $state.go('app.search', {locale: $scope.locale(), q: $scope.searchQuery});
  };
}])
.controller('alertController', ['$scope', 'alertService', function($scope, alertService) {
  $scope.alerts = alertService.alerts();
  $scope.closeAlert = alertService.closeAlert;
}])
.controller('contactController', ['$scope', '$translate', 'seoService', 'alertService', 'userService', function($scope, $translate, seoService, alertService, userService) {
  $translate('seo.title.contact').then(function(translation) {
    seoService.setTitle(translation);
  });

  $scope.sendEmail = function() {
    userService.sendEmail($scope.name, $scope.email, $scope.subject, $scope.message).then(function(response) {
      $translate('forms.email_sended').then(function(translation) {
        alertService.alert('success', translation);
      });
      $scope.name = '';
      $scope.email = '';
      $scope.subject = '';
      $scope.message = '';
      $scope.contactForm.$setPristine();
    }).catch(function(response) {
      $translate('forms.error_sending_email').then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
}])
.controller('termsOfUseController', ['$translate', 'seoService', function($translate, seoService) {
  $translate('seo.title.terms_of_use').then(function(translation) {
    seoService.setTitle(translation);
  });
}])
.controller('privacyPolicyController', ['$translate', 'seoService', function($translate, seoService) {
  $translate('seo.title.privacy_policy').then(function(translation) {
    seoService.setTitle(translation);
  });
}])
.controller('errorController', ['$translate', 'errorCode', 'seoService', function($translate, errorCode, seoService) {
  $translate('seo.title.error_' + errorCode).then(function(translation) {
    seoService.setTitle(translation);
  });
}]);