angular
.module('coverAcademy.controllers')
.controller('contestController', ['$scope', '$stateParams', 'backendResponse', 'seoService', function($scope, $stateParams, backendResponse, seoService) {
  $scope.rankType = $stateParams.rank || 'best';
  $scope.contest = backendResponse.data.contest;
  $scope.auditions = backendResponse.data.auditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.votesByAudition = backendResponse.data.votesByAudition;

  $scope.currentPage = 1;
  $scope.coversPerPage = 40;

  $scope.pageChanged = function() {
    contestService.bestAuditions($scope.contest, $scope.currentPage).then(function(response) {
      $scope.auditions = response.data;
    });
  };
  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
}])
.controller('joinContestController', ['$scope', '$stateParams', 'backendResponse', 'seoService', 'contestService', function($scope, $stateParams, backendResponse, seoService, contestService) {
  $scope.contest = backendResponse.data.contest;
  $scope.youtubeRegex = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;

  $scope.videoUrlPasted = function(event) {
    $scope.audition = {};
    var url = event.clipboardData.getData("text/plain");
    if($scope.youtubeRegex.test(url)) {
      $scope.audition.url = url;
    } else {
      alertService.addAlert('warning', 'For now we support only Youtube videos =(');
    }
  };
  $scope.joinContest = function() {
    contestService.joinContest($scope.audition).then(function(response) {

    });
  };
}]);