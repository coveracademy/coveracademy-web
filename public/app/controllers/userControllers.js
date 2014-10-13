angular
.module('coverAcademy.controllers')
.controller('userController', ['$scope', '$stateParams', 'backendResponse', 'seoService', function($scope, $stateParams, backendResponse, seoService) {
  $scope.user = backendResponse.data.user;
}]);