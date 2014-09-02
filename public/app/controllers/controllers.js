angular
.module('coverChallengeApp.controllers', [])
.controller('applicationController', ['$scope', '$state', '$stateParams', '$translate', 'authEvents', 'authenticationService', 'alertService', 'seoService', function($scope, $state, $stateParams, $translate, authEvents, authenticationService, alertService, seoService) {
  $scope.pageTitle = seoService.getTitle;
  $scope.metaDescription = seoService.getDescription;
  $scope.metaKeywords = seoService.getKeywords;
  $scope.user = authenticationService.getUser;
  $scope.login = authenticationService.ensureAuth;
  $scope.logout = authenticationService.logout;

  $scope.$on(authEvents.NOT_AUTHORIZED, function() {
    $state.go('index');
    $translate('ALERTS.NOT_AUTHORIZED').then(function(message) {
      alertService.addAlert('warning', message);
    });
  });
  $scope.$on(authEvents.NOT_AUTHENTICATED, function() {
    $state.go('login');
    $translate('ALERTS.NOT_AUTHENTICATED').then(function(message) {
      alertService.addAlert('warning', message);
    });
  });
  $scope.$on(authEvents.HTTP_NOT_AUTHENTICATED, function() {
    authenticationService.ensureAuth();
  });
  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    $translate('ALERTS.LOGIN_SUCCESS').then(function(message) {
      alertService.addAlert('success', message);
    });
  });
  $scope.$on(authEvents.LOGIN_FAILED, function() {
    $translate('ALERTS.LOGIN_FAILED').then(function(message) {
      alertService.addAlert('danger', message);
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $state.transitionTo($state.current, $stateParams, {reload: true, inherit: false, notify: true});
  });
}])
.controller('loginController', ['$rootScope', '$scope', '$state', 'authEvents', 'authenticationService', 'alertService', function($rootScope, $scope, $state, authEvents, authenticationService, alertService) {
  $scope.login = function(provider) {
    authenticationService.login(provider).then(function(user) {
      $state.go('index');
    });
  };
}])
.controller('headerController', ['$scope', '$state', '$translate', '$languages', 'authenticationService', 'coverService', 'searchService', function($scope, $state, $translate, $languages, authenticationService, coverService, searchService) {
  $scope.languages = $languages;
  $scope.isSectionActive = function(section) {
    return $state.current.name === section;
  };
  $scope.isLoginState = function() {
    return $state.current.name === 'login';
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
  $scope.changeLanguage = function(language) {
    $translate.use(language.id);
  };
  $scope.selectItem = function(item) {
    if(item.itemType === 'music') {
      $state.go('music', {music : item.slug});
    } else {
      $state.go('artist', {artist : item.slug});
    }
  };
  $scope.submitSearch = function() {
    $state.go('search', {q: $scope.searchQuery});
  };
}])
.controller('alertController', ['$scope', 'alertService', function($scope, alertService) {
  $scope.alerts = alertService.getAlerts();
  $scope.closeAlert = alertService.closeAlert;
}])
.controller('contactController', ['$scope', '$translate', 'alertService', 'userService', function($scope, $translate, alertService, userService) {
  $scope.sendEmail = function() {
    userService.sendEmail($scope.name, $scope.email, $scope.subject, $scope.message).then(function(response) {
      $translate('CONTACT_FORM.EMAIL_SENDED').then(function(message) {
        alertService.addAlert('success', message);
      });
      $scope.name = '';
      $scope.email = '';
      $scope.subject = '';
      $scope.message = '';
      $scope.contactForm.$setPristine();
    }).catch(function(response) {
      $translate('CONTACT_FORM.ERROR_SENDING_EMAIL').then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
}]);
