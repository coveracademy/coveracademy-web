angular
.module('coverAcademy.controllers', [])
.controller('applicationController', ['$scope', '$state', '$stateParams', '$translate', 'authEvents', 'authenticationService', 'alertService', 'seoService', function($scope, $state, $stateParams, $translate, authEvents, authenticationService, alertService, seoService) {
  $scope.locale = $translate.use;

  // SEO
  $scope.siteName = seoService.getSiteName;
  $scope.pageUrl = seoService.getUrl;
  $scope.pageTitle = seoService.getTitle;
  $scope.metaDescription = seoService.getDescription;
  $scope.metaKeywords = seoService.getKeywords;
  $scope.metaImage = seoService.getImage;

  $scope.user = authenticationService.getUser;
  $scope.login = authenticationService.ensureAuth;
  $scope.logout = authenticationService.logout;

  $scope.$on(authEvents.NOT_AUTHORIZED, function() {
    $state.go('app.index', {locale: $scope.locale()});
    $translate('alerts.not_authorized').then(function(message) {
      alertService.addAlert('warning', message);
    });
  });
  $scope.$on(authEvents.NOT_AUTHENTICATED, function() {
    $state.go('app.login', {locale: $scope.locale()});
    $translate('alerts.not_authenticated').then(function(message) {
      alertService.addAlert('warning', message);
    });
  });
  $scope.$on(authEvents.HTTP_NOT_AUTHENTICATED, function() {
    authenticationService.ensureAuth();
  });
  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    $translate('alerts.login_success').then(function(message) {
      alertService.addAlert('success', message);
    });
  });
  $scope.$on(authEvents.LOGIN_FAILED, function() {
    $translate('alerts.login_failed').then(function(message) {
      alertService.addAlert('danger', message);
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $state.transitionTo($state.current, $stateParams, {reload: true, inherit: false, notify: true});
  });

  $scope.isLocale = function(locale) {
    return $translate.use() === locale;
  };
}])
.controller('rootController', ['$scope', '$state', '$translate', function($scope, $state, $translate) {
  $state.go('app.index', {locale: $translate.use()});
}])
.controller('loginController', ['$rootScope', '$scope', '$state', 'authEvents', 'authenticationService', 'alertService', function($rootScope, $scope, $state, authEvents, authenticationService, alertService) {
  $scope.login = function(provider) {
    authenticationService.login(provider).then(function(user) {
      $state.go('app.index', {locale: $scope.locale()});
    });
  };
}])
.controller('headerController', ['$scope', '$state', '$languages', 'constants', 'authenticationService', 'coverService', 'searchService', function($scope, $state, $languages, constants, authenticationService, coverService, searchService) {
  $scope.siteName = constants.SITE_NAME;
  $scope.searchQuery = '';
  $scope.languages = $languages.all;
  $scope.isSectionActive = function(section) {
    return $state.current.name === 'app.' + section;
  };
  $scope.isLoginState = function() {
    return $state.current.name === 'app.login';
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
.controller('footerController', ['$scope', 'constants', function($scope, constants) {
  $scope.siteName = constants.SITE_NAME;
}])
.controller('alertController', ['$scope', 'alertService', function($scope, alertService) {
  $scope.alerts = alertService.getAlerts();
  $scope.closeAlert = alertService.closeAlert;
}])
.controller('contactController', ['$scope', '$translate', 'constants', 'seoService', 'alertService', 'userService', function($scope, $translate, constants, seoService, alertService, userService) {
  $scope.siteName = constants.SITE_NAME;

  $translate('seo.title.contact').then(function(message) {
    seoService.setTitle(message);
  });

  $scope.sendEmail = function() {
    userService.sendEmail($scope.name, $scope.email, $scope.subject, $scope.message).then(function(response) {
      $translate('contact_form.email_sended').then(function(message) {
        alertService.addAlert('success', message);
      });
      $scope.name = '';
      $scope.email = '';
      $scope.subject = '';
      $scope.message = '';
      $scope.contactForm.$setPristine();
    }).catch(function(response) {
      $translate('contact_form.error_sending_email').then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
}])
.controller('termsOfUseController', ['$translate', 'seoService', function($translate, seoService) {
  $translate('seo.title.terms_of_use').then(function(message) {
    seoService.setTitle(message);
  });
}])
.controller('privacyPolicyController', ['$translate', 'seoService', function($translate, seoService) {
  $translate('seo.title.privacy_policy').then(function(message) {
    seoService.setTitle(message);
  });
}]);
