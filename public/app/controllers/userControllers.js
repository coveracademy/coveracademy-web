'use strict'

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
.controller('userController', ['$scope', '$underscore', 'authEvents', 'backendResponse', 'userService', 'seoService', 'translationService', 'alertService', function($scope, $underscore, authEvents, backendResponse, userService, seoService, translationService, alertService) {
  $scope.user = backendResponse.data.user;
  $scope.auditions = backendResponse.data.auditions;
  $scope.isFan = backendResponse.data.fan;
  $scope.totalFans = backendResponse.data.totalFans;
  $scope.fans = backendResponse.data.fans;
  $scope.loadMoreFans = true;
  var nextFanPage = 2;

  seoService.setTitle($scope.user.name);
  seoService.setDescription($scope.user.biography);

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    userService.isFan($scope.user).then(function(response) {
      $scope.isFan = response.data;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.isFan = false;
  });

  $scope.loadFans = function() {
    if($scope.loadMoreFans === true) {
      userService.latestFans($scope.user, nextFanPage).then(function(response) {
        nextFanPage++;
        var fans = response.data;
        if(fans.length < 60) {
          $scope.loadMoreFans = false;
        }
        $scope.fans = $scope.fans.concat(fans);
      }).catch(function(err) {
        translationService.translateError(err).then(function(translation) {
          alertService.alert('danger', translation);
        });
      });
    }
  };
  $scope.hasFans = function() {
    return $scope.totalFans > 0;
  };
  $scope.isContestant = function() {
    return $scope.user.contestant === 1;
  };
  $scope.isOwner = function() {
    return $scope.userAuthenticated() && $scope.userAuthenticated().id === $scope.user.id;
  };
  $scope.hasAuditions = function() {
    return $scope.auditions && $scope.auditions.length > 0;
  };
  $scope.showNetworkLink = function(network) {
    var socialAccount = userService.getSocialAccount($scope.user, network);
    if(socialAccount) {
      return socialAccount.show_link === 1 ? true : false;
    } else {
      return false;
    }
  };
  $scope.getNetworkProfileUrl = function(network) {
    return userService.getNetworkProfileUrl($scope.user, network);
  };
  $scope.showFanButtons = function() {
    return !$scope.isOwner() || !$scope.isAuthenticated();
  };
  $scope.fan = function() {
    userService.fan($scope.user).then(function(response) {
      $scope.isFan = true;
      $scope.totalFans++;
      $scope.fans.unshift($scope.userAuthenticated());
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.unfan = function() {
    userService.unfan($scope.user).then(function(response) {
      $scope.isFan = false;
      $scope.totalFans--;
      $scope.fans = $underscore.filter($scope.fans, function(fan) {
        return $scope.userAuthenticated().id !== fan.id;
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
}])
.controller('settingsController', ['$scope', '$translate', 'constants', 'alertService', 'userService', 'seoService', 'translationService', 'authenticationService', function($scope, $translate, constants, alertService, userService, seoService, translationService, authenticationService) {
  $scope.siteUrl = constants.SITE_URL;

  $scope.setUser = function(user) {
    $scope.user = user;
    $scope.initialUsername = $scope.user.username;
    $scope.initialEmail = $scope.user.email;
  };

  $scope.setUser($scope.userAuthenticated());
  $scope.showNetworks = {};

  $scope.user.socialAccounts.forEach(function(socialAccount) {
    $scope.showNetworks[socialAccount.network] = socialAccount.show_link === 1 ? true : false
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
}])
.controller('disableEmailsController', ['$state', '$translate', 'alertService', 'authenticationService', function($state, $translate, alertService, authenticationService) {
  authenticationService.updateUser();
  $state.go('app.index');
  $translate('alerts.emails_disabled').then(function(translation) {
    alertService.alert('success', translation);
  });
}]);