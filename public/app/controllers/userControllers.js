angular
.module('coverAcademy.controllers')
.controller('registerController', ['$scope', '$modalInstance', '$translate', 'constants', 'temporaryUser', 'translationService', 'alertService', 'userService', function($scope, $modalInstance, $translate, constants, temporaryUser, translationService, alertService, userService) {
  $scope.temporaryUser = temporaryUser;
  $scope.siteUrl = constants.SITE_URL;
  $scope.locale = $translate.use();
  $scope.close = function(result) {
    $modalInstance.close(result);
  };
  $scope.cancel = function(reason) {
    $modalInstance.dismiss(reason || 'cancel');
  };
  $scope.sampleUsername = function() {
    if(!$scope.temporaryUser.username || $scope.temporaryUser.username.length === 0) {
      return '<username>';
    }
    return $scope.temporaryUser.username.toLowerCase();
  };
  $scope.confirm = function() {
    userService.create($scope.temporaryUser).then(function(response) {
      $scope.close(true);
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
}])
.controller('loginController', ['$scope', '$modalInstance', 'authenticationService', function($scope, $modalInstance, authenticationService) {
  $scope.close = function(result) {
    $modalInstance.close(result);
  };
  $scope.cancel = function(reason) {
    $modalInstance.dismiss(reason || 'cancel');
  };
  $scope.login = function(provider) {
    authenticationService.login(provider).finally(function() {
      $modalInstance.close(authenticationService.isAuthenticated());
    });
  };
}])
.controller('userController', ['$scope', 'backendResponse', 'authenticationService', 'userService', 'seoService', function($scope, backendResponse, authenticationService, userService, seoService) {
  $scope.user = backendResponse.data.user;
  $scope.auditions = backendResponse.data.auditions;

  seoService.setTitle($scope.user.name);
  seoService.setDescription($scope.user.biography);

  $scope.isOwner = function() {
    return authenticationService.getUser() && authenticationService.getUser().id === $scope.user.id;
  };
}])
.controller('settingsController', ['$scope', '$translate', 'constants', 'alertService', 'userService', 'seoService', 'translationService', function($scope, $translate, constants, alertService, userService, seoService, translationService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.user = $scope.user();
  $scope.initialUsername = $scope.user.username;
  $scope.initialEmail = $scope.user.email;

  $translate('seo.title.settings').then(function(translation) {
    seoService.setTitle(translation);
  });
  $scope.sampleUsername = function() {
    if(!$scope.user.username || $scope.user.username.length === 0) {
      return '<username>';
    }
    return $scope.user.username.toLowerCase();
  };
  $scope.canEditUsername = function() {
    return Boolean(!$scope.initialUsername);
  };
  $scope.hasProfilePicture = function(network) {
    return userService.hasProfilePicture($scope.user, network);
  };
  $scope.selectProfilePicture = function(network) {
    $scope.user.profile_picture = network;
  };
  $scope.isProfilePicture = function(network) {
    return userService.isProfilePicture($scope.user, network);
  };
  $scope.saveChanges = function() {
    userService.update($scope.user).then(function(response) {
      $scope.initialUsername = $scope.user.username;
      $translate('alerts.changes_saved_successfully').then(function(translation) {
        alertService.addAlert('success', translation);
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
}])
.controller('confirmationController', ['$state', '$translate', 'alertService', function($state, $translate, alertService) {
  $state.go('app.index');
  $translate('account_confirmed').then(function(translation) {
    alertService.addAlert('success', translation);
  });
}]);