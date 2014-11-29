angular
.module('coverAcademy.controllers')
.controller('registerController', ['$scope', '$state', '$timeout', 'backendResponse', 'authenticationService', 'alertService', 'userService', 'seoService', 'translationService', function($scope, $state, $timeout, backendResponse, authenticationService, alertService, userService, seoService, translationService) {
  $scope.user = backendResponse.data.temporaryUser;
  $scope.emailChecked = false;
  $scope.userRegistered = false;
  $scope.userFound = null;
  $scope.previousState = null;

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    $scope.previousState = {state: fromState, params: fromParams};
  });

  $scope.getNetworkConnection = function() {
    return userService.getPrimaryNetworkConnection($scope.user);
  };
  $scope.isNetworkConnection = function(network) {
    return userService.isPrimaryNetworkConnection($scope.user, network);
  };
  $scope.checkEmail = function() {
    userService.getByEmail($scope.user.email).then(function(response) {
      $scope.emailChecked = true;
      $scope.userFound = response.data;
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
  var confirmConnection = function() {
    authenticationService.updateUser().then(function(userUpdated) {
      $scope.userRegistered = true;
      if($scope.previousState) {
        $timeout(function() {
          $state.go($scope.previousState.state.name, $scope.previousState.params);
        }, 10000);
      }
    });
  };
  $scope.register = function() {
    userService.create($scope.user).then(function(response) {
      confirmConnection();
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
  $scope.confirm = function() {
    var connection = $scope.getNetworkConnection();
    userService.connect($scope.userFound.email, $scope.userFound.password, $scope.userFound, connection.type, connection.account).then(function(response) {
      confirmConnection();
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
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
.controller('settingsController', ['$scope', '$translate', 'authenticationService', 'alertService', 'userService', 'seoService', 'translationService', function($scope, $translate, authenticationService, alertService, userService, seoService, translationService) {
  $scope.user = authenticationService.getUser();

  $translate('settings').then(function(translation) {
    seoService.setTitle(translation);
  });

  $scope.hasNetworkConnection = function(network) {
    return userService.hasNetworkConnection($scope.user, network);
  };
  $scope.selectPrimaryNetwork = function(network) {
    $scope.user.primary_network = network;
  };
  $scope.isPrimaryNetwork = function(network) {
    return userService.isPrimaryNetworkConnection($scope.user, network);
  };
  $scope.saveChanges = function() {
    userService.update($scope.user).then(function(response) {
      $translate('alerts.changes_saved_successfully').then(function(translation) {
        alertService.addAlert('success', translation);
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
}]);