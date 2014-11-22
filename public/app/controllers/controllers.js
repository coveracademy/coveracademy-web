angular
.module('coverAcademy.controllers', [])
.controller('applicationController', ['$scope', '$state', '$stateParams', '$translate', 'authEvents', 'authenticationService', 'alertService', 'translationService', 'seoService', function($scope, $state, $stateParams, $translate, authEvents, authenticationService, alertService, translationService, seoService) {
  $scope.locale = $translate.use;

  // SEO
  $scope.siteName = seoService.getSiteName;
  $scope.pageUrl = seoService.getUrl;
  $scope.pageTitle = seoService.getTitle;
  $scope.metaDescription = seoService.getDescription;
  $scope.metaKeywords = seoService.getKeywords;
  $scope.metaImage = seoService.getImage;

  $scope.isAuthenticated = authenticationService.isAuthenticated;
  $scope.user = authenticationService.getUser;
  $scope.temporaryUser = authenticationService.getTemporaryUser;
  $scope.login = authenticationService.ensureAuth;
  $scope.logout = authenticationService.logout;

  $scope.$on(authEvents.MUST_REGISTER, function() {
    $state.go('app.register', {locale: $scope.locale()});
  });
  $scope.$on(authEvents.NOT_AUTHORIZED, function() {
    $state.go('app.index', {locale: $scope.locale()});
    // $translate('alerts.not_authorized').then(function(translation) {
    //   alertService.addAlert('warning', translation);
    // });
  });
  $scope.$on(authEvents.NOT_AUTHENTICATED, function() {
    $state.go('app.index', {locale: $scope.locale()});
    // $translate('alerts.not_authenticated').then(function(translation) {
    //   alertService.addAlert('warning', translation);
    // });
  });
  $scope.$on(authEvents.HTTP_NOT_AUTHENTICATED, function() {
    authenticationService.ensureAuth();
  });
  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    // $translate('alerts.login_success').then(function(translation) {
    //   alertService.addAlert('success', translation);
    // });
  });
  $scope.$on(authEvents.LOGIN_FAILED, function(event, errorKey) {
    if(errorKey && errorKey.length > 0) {
      translationService.translateError(errorKey).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    } else {
      $translate('alerts.login_failed').then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    }
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $state.go($state.current, $stateParams, {reload: true});
  });

  $scope.isLocale = function(locale) {
    return $translate.use() === locale;
  };
}])
.controller('rootController', ['$scope', '$state', '$translate', function($scope, $state, $translate) {
  $state.go('app.index', {locale: $translate.use()});
}])
.controller('headerController', ['$scope', '$state', '$languages', 'authenticationService', 'coverService', 'searchService', function($scope, $state, $languages, authenticationService, coverService, searchService) {
  $scope.searchQuery = '';
  $scope.languages = $languages.all;
  $scope.isSectionActive = function(section) {
    return $state.current.name === 'app.' + section;
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
  $scope.alerts = alertService.getAlerts();
  $scope.closeAlert = alertService.closeAlert;
}])
.controller('contactController', ['$scope', '$translate', 'seoService', 'alertService', 'userService', function($scope, $translate, seoService, alertService, userService) {
  $translate('seo.title.contact').then(function(translation) {
    seoService.setTitle(translation);
  });

  $scope.sendEmail = function() {
    userService.sendEmail($scope.name, $scope.email, $scope.subject, $scope.message).then(function(response) {
      $translate('forms.email_sended').then(function(translation) {
        alertService.addAlert('success', translation);
      });
      $scope.name = '';
      $scope.email = '';
      $scope.subject = '';
      $scope.message = '';
      $scope.contactForm.$setPristine();
    }).catch(function(response) {
      $translate('forms.error_sending_email').then(function(translation) {
        alertService.addAlert('danger', translation);
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
}]);
