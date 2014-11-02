angular
.module('coverAcademy.controllers')
.controller('userController', ['$scope', '$translate', 'backendResponse', 'authenticationService', 'alertService', 'userService', 'seoService', 'translationService', function($scope, $translate, backendResponse, authenticationService, alertService, userService, seoService, translationService) {
  $scope.user = backendResponse.data.user;
  $scope.auditions = backendResponse.data.auditions;
  $scope.editing = false;
  $scope.flowModel = {};
  $scope.flowConfig = {
    target: "/upload/user",
    singleFile: true,
    query: function(flowFile, flowChunk) {
      return {user: $scope.editedUser.id};
    }
  };
  $scope.isOwner = function() {
    return authenticationService.getUser() && authenticationService.getUser().id === $scope.user.id;
  };
  $scope.editProfile = function() {
    $scope.editing = true;
    $scope.editedUser = angular.copy($scope.user);
  };
  $scope.save = function() {
    userService.save($scope.editedUser).then(function(backendResponse) {
      $scope.editing = false;
      $scope.user = angular.copy($scope.editedUser);
      $translate('informations_saved_successfully').then(function(message) {
        alertService.addAlert('success', message);
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
  $scope.cancel = function() {
    $scope.editing = false;
  };
}]);