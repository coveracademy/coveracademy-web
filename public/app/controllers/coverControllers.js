angular
.module('coverChallengeApp')
.controller('indexController', ['$scope', '$state', 'dataResponse', function($scope, $state, dataResponse) {
  $scope.latestCovers = dataResponse.data.latestCovers;
  $scope.bestCovers = dataResponse.data.bestCovers;
  $scope.topCover = dataResponse.data.topCover;
  $scope.musicGenres = dataResponse.data.musicGenres;
  $scope.viewCover = function(cover) {
    $state.go('viewCover', {id : cover.id});
  };
}])
.controller('addCoverController', ['$scope', '$state', 'dataResponse', 'alertService', 'coverService', function($scope, $state, dataResponse, alertService, coverService) {
  $scope.youtubeRegex = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
  $scope.musicGenres = dataResponse.data;
  $scope.videoUrlPasted = function(event) {
    $scope.cover = {};
    var url = event.originalEvent.clipboardData.getData("text/plain");
    if($scope.youtubeRegex.test(url)) {
      $scope.cover.url = url;
    } else {
      alertService.addAlert('For now we support only Youtube videos =(');
    }
  };
  $scope.searchArtists = function(query) {
    return coverService.searchArtists(query).then(function(response) {
      return response.data;
    });
  };
  $scope.selectArtist = function(artist) {
    $scope.cover.artist = artist;
  };
  $scope.searchMusics = function(query) {
    return coverService.searchMusics($scope.cover.artist.id, query).then(function(response) {
      return response.data;
    });
  };
  $scope.selectMusic = function(music) {
    $scope.cover.music = music;
  };
  $scope.addCover = function() {
    coverService.addCover($scope.cover).then(function(response) {
      $state.go('viewCover', {id : response.data.id});
    });
  };
}])
.controller('viewCoverController', ['$scope', '$stateParams', 'dataResponse', function($scope, $stateParams, dataResponse) {
  $scope.cover = dataResponse.data.cover;
  $scope.bestCoversOfMusic = dataResponse.data.bestCoversOfMusic;
  $scope.bestCoversByArtist = dataResponse.data.bestCoversByArtist;
}])
.controller('coversRankController', ['$scope', '$stateParams', 'settings', 'dataResponse', 'coverService', function($scope, $stateParams, settings, dataResponse, coverService) {
  $scope.pageTitle = $stateParams.rank === 'best' ? 'Best covers from this Week' : 'Latest covers songs from this Week';
  $scope.currentPage = settings.defaultCurrentPage;
  $scope.currentPeriod = settings.defaultCurrentPeriod;
  $scope.coversPerPage = settings.coversRankView.coversPerPage;
  $scope.coversRank = dataResponse.data.coversRank;
  $scope.totalCoversRank = dataResponse.data.totalCoversRank;
  $scope.pageChanged = function() {
    var nextPage = $stateParams.rank === 'best' ? coverService.bestCovers($scope.currentPeriod, $scope.currentPage, $scope.coversPerPage) : coverService.latestCovers($scope.currentPeriod, $scope.currentPage, $scope.coversPerPage);
    nextPage.then(function(response) {
      $scope.coversRank = response.data;
    });
  };
}])
.controller('viewArtistController', ['$scope', 'dataResponse', function($scope, dataResponse) {
  $scope.artist = dataResponse.data.artist;
}]);