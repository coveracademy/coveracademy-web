angular
.module('coverAcademy.controllers')
.controller('userController', ['$scope', '$translate', 'backendResponse', 'authenticationService', 'alertService', 'userService', 'seoService', 'translationService', function($scope, $translate, backendResponse, authenticationService, alertService, userService, seoService, translationService) {
  $scope.user = backendResponse.data.user;
  $scope.auditions = backendResponse.data.auditions;
  $scope.editing = false;
  $scope.flowModel = {};
  $scope.flowConfig = {
    target: '/api/upload/user',
    singleFile: true,
    query: function(flowFile, flowChunk) {
      return {user: $scope.editedUser.id};
    }
  };

  var fixUserImage = function() {
    $scope.user.image = $scope.user.image + '?date=' + new Date().getTime();
  };

  fixUserImage();
  seoService.setTitle($scope.user.name);

  $scope.isOwner = function() {
    return authenticationService.getUser() && authenticationService.getUser().id === $scope.user.id;
  };
  $scope.editProfile = function() {
    $scope.editing = true;
    $scope.editedUser = angular.copy($scope.user);
  };
  $scope.save = function() {
    $scope.flowModel.flow.on('complete', function () {
      userService.get($scope.user.id).then(function(response) {
        $scope.user = response.data;
        fixUserImage();
        $scope.editing = false;
        $translate('informations_saved_successfully').then(function(message) {
          alertService.addAlert('success', message);
        });
      });
    });

    userService.save($scope.editedUser).then(function(response) {
      $scope.flowModel.flow.upload();
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