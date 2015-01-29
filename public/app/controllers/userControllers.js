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
      $translate('alerts.confirm_your_email').then(function(translation) {
        alertService.alert('success', translation)
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
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
.controller('settingsController', ['$scope', '$translate', 'constants', 'alertService', 'userService', 'seoService', 'translationService', 'authenticationService', function($scope, $translate, constants, alertService, userService, seoService, translationService, authenticationService) {
  $scope.siteUrl = constants.SITE_URL;

  $scope.setUser = function(user) {
    $scope.user = user;
    $scope.initialUsername = $scope.user.username;
    $scope.initialEmail = $scope.user.email;
  };

  $scope.setUser($scope.user());
  $scope.showNetworks = {};

  $scope.user.socialAccounts.forEach(function(socialAccount) {
    $scope.showNetworks[socialAccount.network] = socialAccount.show === 1 ? true : false
  });

  $translate('seo.title.settings').then(function(translation) {
    seoService.setTitle(translation);
  });
  $scope.isUnverifiedEmail = function() {
    return $scope.user.verified === 0;
  };
  $scope.resendVerificationEmail = function() {
    userService.verificationEmail($scope.user).then(function(response) {
      $translate('alerts.verification_email_sended').then(function(translation) {
        alertService.alert('success', translation);
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.sampleUsername = function() {
    if(!$scope.user.username || $scope.user.username.length === 0) {
      return '<username>';
    }
    return $scope.user.username.toLowerCase();
  };
  $scope.canEditUsername = function() {
    return Boolean(!$scope.initialUsername);
  };
  $scope.selectProfilePicture = function(network) {
    $scope.user.profile_picture = network;
  };
  $scope.isProfilePicture = function(network) {
    return userService.isProfilePicture($scope.user, network);
  };
  $scope.saveChanges = function() {
    userService.update($scope.user).then(function(response) {
      $scope.setUser(response.data);
      $translate('alerts.changes_saved_successfully').then(function(translation) {
        alertService.alert('success', translation);
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.connectNetwork = function(network) {
    authenticationService.login(network).then(function() {
      return authenticationService.updateUser();
    }).then(function(user) {
      $scope.setUser(user);
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.disconnectNetwork = function(network) {
    userService.disconnectNetwork(network).then(function(user) {
      return authenticationService.updateUser();
    }).then(function(user) {
      $scope.setUser(user);
      delete $scope.showNetworks[network];
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.isConnectedWithNetwork = function(network) {
    return userService.isConnectedWithNetwork($scope.user, network);
  };
  $scope.showNetwork = function(network) {
    userService.showNetwork(network, $scope.showNetworks[network]).then(function(response) {
      $translate('alerts.changes_saved_successfully').then(function(translation) {
        alertService.alert('success', translation);
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
}])
.controller('verifyEmailController', ['$state', '$translate', 'alertService', 'authenticationService', function($state, $translate, alertService, authenticationService) {
  authenticationService.updateUser();
  $state.go('app.index');
  $translate('alerts.email_verified').then(function(translation) {
    alertService.alert('success', translation);
  });
}]);