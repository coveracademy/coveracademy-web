angular
.module('coverChallengeApp')
.controller('indexController', ['$scope', 'coverService', function($scope, coverService) {
  coverService.lastCovers(1, 20).then(function(response) {
    $scope.lastCovers = response.data;
  });
}])
.controller('newCoverController', ['$scope', '$state', 'alertService', 'coverService', function($scope, $state, alertService, coverService) {
  $scope.cover = {};
  $scope.youtubeRegex = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
  coverService.allMusicalGenres().then(function(response) {
    $scope.musicalGenres = response.data;
  });

  $scope.videoUrlPasted = function(event) {
    var url = event.originalEvent.clipboardData.getData("text/plain");
    if($scope.youtubeRegex.test(url)) {
      $scope.cover.url = url;
    } else {
      alertService.addAlert('For now we support only Youtube videos =(');
    }
  };
  $scope.searchMusicArtists = function(query) {
    return coverService.searchMusicArtists(query).then(function(response) {
      return response.data;
    });
  };
  $scope.selectMusicArtist = function(musicArtist) {
    $scope.cover.musicArtist = musicArtist;
  };
  $scope.searchMusicTitles = function(query) {
    return coverService.searchMusicTitles($scope.cover.musicArtist.id, query).then(function(response) {
      return response.data;
    });
  };
  $scope.selectMusicTitle = function(musicTitle) {
    $scope.cover.musicTitle = musicTitle;
  };
  $scope.addCover = function() {
    coverService.addCover($scope.cover).then(function(response) {
      $state.go('viewCover', {id : response.data.id});
    });
  };
}])
.controller('viewCoverController', ['$scope', '$state', '$stateParams', 'coverService', function($scope, $state, $stateParams, coverService) {
  coverService.getCover($stateParams.id).then(function(response) {
    $scope.cover = response.data;
  });




}]);