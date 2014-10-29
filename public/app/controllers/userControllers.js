angular
.module('coverAcademy.controllers')
.controller('userController', ['$scope', '$translate', 'backendResponse', 'authenticationService', 'alertService', 'userService', 'seoService', function($scope, $translate, backendResponse, authenticationService, alertService, userService, seoService) {
  $scope.user = backendResponse.data.user;
  $scope.auditions = backendResponse.data.auditions;
  $scope.editing = false;
  $scope.isOwner = function() {
    return authenticationService.getUser().id === $scope.user.id;
  };
  $scope.editProfile = function() {
    $scope.editing = true;
  };
  $scope.save = function() {
    userService.save($scope.user).then(function(backendResponse) {
      $scope.editing = false;
      $translate('informations_saved_successfully').then(function(message) {
        alertService.addAlert('success', message);
      });
    }).catch(function(err) {

    });
  };
  $scope.cancel = function() {
    $scope.editing = false;
  };
}]);