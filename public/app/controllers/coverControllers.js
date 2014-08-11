angular
.module('coverChallengeApp')
.controller('indexController', ['$scope', '$state', '$filter', 'dataResponse', function($scope, $state, $filter, dataResponse) {
  $scope.latestCovers = dataResponse.data.latestCovers;
  $scope.bestCovers = dataResponse.data.bestCovers;
  $scope.topCover = dataResponse.data.topCover;
  $scope.musicGenres = dataResponse.data.musicGenres;
  $scope.carouselSlidesInterval = 5000;
  $scope.carouselSlides = $filter('partition')($scope.musicGenres, 6);
  for(index in $scope.carouselSlides) {
    $scope.carouselSlides[index] = {item: $scope.carouselSlides[index], active: false};
  }
  $scope.viewCover = function(cover) {
    $state.go('cover', {id : cover.id});
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
    $scope.cover.artist = artist.name;
  };
  $scope.searchMusics = function(query) {
    return coverService.searchMusics($scope.cover.artist.id, query).then(function(response) {
      return response.data;
    });
  };
  $scope.selectMusic = function(music) {
    $scope.cover.music = music.name;
  };
  $scope.addCover = function() {
    coverService.addCover($scope.cover).then(function(response) {
      $state.go('cover', {id : response.data.id});
    });
  };
}])
.controller('coverController', ['$scope', '$stateParams', 'dataResponse', function($scope, $stateParams, dataResponse) {
  $scope.cover = dataResponse.data.cover;
  $scope.bestCoversOfMusic = dataResponse.data.bestCoversOfMusic;
  $scope.bestCoversByArtist = dataResponse.data.bestCoversByArtist;
}])
.controller('coversRankController', ['$scope', '$stateParams', 'dataResponse', 'coverService', function($scope, $stateParams, dataResponse, coverService) {
  $scope.rankType = $stateParams.rank;
  $scope.coversRank = dataResponse.data.coversRank;
  $scope.totalCoversRank = dataResponse.data.totalCoversRank;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  $scope.pageChanged = function() {
    var nextPage = $scope.rankType === 'best' ? coverService.bestCovers($scope.currentPage) : coverService.latestCovers($scope.currentPage);
    nextPage.then(function(response) {
      $scope.coversRank = response.data;
    });
  };
  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
}])
.controller('artistController', ['$scope', '$stateParams', 'dataResponse', function($scope, $stateParams, dataResponse) {
  $scope.sortType = $stateParams.sort ? $stateParams.sort : 'best';
  $scope.artist = dataResponse.data.artist;
  $scope.totalMusicsByArtist = dataResponse.data.totalMusicsByArtist;
  $scope.musicsByArtist = dataResponse.data.musicsByArtist;
  $scope.coversOfMusics = dataResponse.data.coversOfMusics;
  $scope.isSorted = function(type) {
    return $scope.sortType === type;
  };
}])
.controller('artistsController', ['$scope', 'dataResponse', function($scope, dataResponse) {
  $scope.musicGenre = dataResponse.data.musicGenre;
  $scope.artists = dataResponse.data.artists;
  $scope.totalArtists = dataResponse.data.totalArtists;
  $scope.currentPage = 1;
  $scope.nextPage = function() {
    $scope.currentPage++;
  };
}])
.controller('musicController', ['$scope', '$stateParams', 'dataResponse', function($scope, $stateParams, dataResponse) {
  $scope.sortType = $stateParams.sort ? $stateParams.sort : 'best';
  $scope.music = dataResponse.data.music;
  $scope.totalCoversOfMusic = dataResponse.data.totalCoversOfMusic;
  $scope.coversOfMusic = dataResponse.data.coversOfMusic;
  $scope.isSorted = function(type) {
    return $scope.sortType === type;
  };
}])
.controller('musicGenreController', ['$scope', 'dataResponse', function($scope, dataResponse) {
  $scope.musicGenre = dataResponse.data.musicGenre;
  $scope.bestArtistsOfMusicGenre = dataResponse.data.bestArtistsOfMusicGenre;
  $scope.bestCoversOfMusicGenre = dataResponse.data.bestCoversOfMusicGenre;
  $scope.latestCoversOfMusicGenre = dataResponse.data.latestCoversOfMusicGenre;
}])
.controller('musicGenreRankController', ['$scope', '$stateParams', 'dataResponse', function($scope, $stateParams, dataResponse) {
  $scope.rankType = $stateParams.rank;
  $scope.musicGenre = dataResponse.data.musicGenre;
  $scope.coversOfMusicGenre = dataResponse.data.coversOfMusicGenre;
  $scope.totalCoversOfMusicGenre = dataResponse.data.totalCoversOfMusicGenre;

  $scope.coversPerPage = 20;
  $scope.currentPage = 1;

  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
}]);