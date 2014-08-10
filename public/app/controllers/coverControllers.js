angular
.module('coverChallengeApp')
.controller('indexController', ['$scope', '$state', '$filter', 'dataResponse', function($scope, $state, $filter, dataResponse) {
  $scope.latestCovers = dataResponse.data.latestCovers;
  $scope.bestCovers = dataResponse.data.bestCovers;
  $scope.topCover = dataResponse.data.topCover;
  $scope.musicGenres = dataResponse.data.musicGenres;
  $scope.carouselSlidesInterval = 5000;

  $scope.carouselSlides = [{}, {}, {}];
  // $scope.carouselSlides = $filter('partition')($scope.musicGenres, 6);
  // for(index in $scope.carouselSlides) {
  //   $scope.carouselSlides[index] = {item: $scope.carouselSlides[index], active: false};
  // }
  $scope.viewCover = function(cover) {
    $state.go('viewCover', {id : cover.id});
  };
  // $scope.carouselSlidesSize = function() {
  //   return carouselSlides.length
  // };
  // $scope.isFirstCarouselSlide = function(index) {
  //   return index === 0;
  // };
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
  $scope.rankType = $stateParams.rank;
  $scope.pageTitle = $scope.rankType === 'best' ? 'Best covers from this Week' : 'Latest covers songs from this Week';
  $scope.currentPage = settings.defaultCurrentPage;
  $scope.currentPeriod = settings.defaultCurrentPeriod;
  $scope.coversPerPage = settings.coversRankView.coversPerPage;
  $scope.coversRank = dataResponse.data.coversRank;
  $scope.totalCoversRank = dataResponse.data.totalCoversRank;
  $scope.pageChanged = function() {
    var nextPage = $scope.rankType === 'best' ? coverService.bestCovers($scope.currentPeriod, $scope.currentPage, $scope.coversPerPage) : coverService.latestCovers($scope.currentPeriod, $scope.currentPage, $scope.coversPerPage);
    nextPage.then(function(response) {
      $scope.coversRank = response.data;
    });
  };
  $scope.isRank = function(type) {
    return $scope.rankType === type;
  };
}])
.controller('viewArtistController', ['$scope', '$stateParams', 'dataResponse', function($scope, $stateParams, dataResponse) {
  $scope.sortType = $stateParams.sort ? $stateParams.sort : 'best';
  $scope.artist = dataResponse.data.artist;
  $scope.totalMusicsByArtist = dataResponse.data.totalMusicsByArtist;
  $scope.musicsByArtist = dataResponse.data.musicsByArtist;
  $scope.coversOfMusics = dataResponse.data.coversOfMusics;
  $scope.isSorted = function(type) {
    return $scope.sortType === type;
  };
}])
.controller('viewMusicController', ['$scope', '$stateParams', 'dataResponse', function($scope, $stateParams, dataResponse) {
  $scope.sortType = $stateParams.sort ? $stateParams.sort : 'best';
  $scope.music = dataResponse.data.music;
  $scope.totalCoversOfMusic = dataResponse.data.totalCoversOfMusic;
  $scope.coversOfMusic = dataResponse.data.coversOfMusic;
  $scope.isSorted = function(type) {
    return $scope.sortType === type;
  };
}])
.controller('viewMusicGenreController', ['$scope', '$stateParams', 'dataResponse', function($scope, $stateParams, dataResponse) {
  $scope.sortType = $stateParams.sort ? $stateParams.sort : 'best';
  $scope.musicGenre = dataResponse.data.musicGenre;
  $scope.bestArtistsOfMusicGenre = dataResponse.data.bestArtistsOfMusicGenre;
  $scope.bestCoversOfMusicGenre = dataResponse.data.bestCoversOfMusicGenre;
  $scope.latestCoversOfMusicGenre = dataResponse.data.latestCoversOfMusicGenre;
  $scope.isSorted = function(type) {
    return $scope.sortType === type;
  };
}]);