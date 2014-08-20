angular
.module('coverChallengeApp')
.controller('adminController', ['$scope', 'backendResponse', 'alertService', 'coverService', function($scope, backendResponse, alertService, coverService) {
  $scope.potentialCovers = backendResponse.data.potentialCovers;
  $scope.acceptCover = function(potentialCover) {
    coverService.acceptCover(potentialCover).then(function(response) {
      alertService.addAlert('success', 'Potential cover accepted successfully');
      $scope.potentialCovers = _.reject($scope.potentialCovers, function(pCover) {
        return potentialCover.id == pCover.id;
      });
    });
  };
  $scope.refuseCover = function(potentialCover) {
    coverService.refuseCover(potentialCover).then(function(response) {
      alertService.addAlert('success', 'Potential cover refused successfully');
      $scope.potentialCovers = _.reject($scope.potentialCovers, function(pCover) {
        return potentialCover.id == pCover.id;
      });
    });
  };
}])
.controller('indexController', ['$scope', '$state', '$filter', 'backendResponse', function($scope, $state, $filter, backendResponse) {
  $scope.latestCovers = backendResponse.data.latestCovers;
  $scope.bestCovers = backendResponse.data.bestCovers;
  $scope.topCover = backendResponse.data.topCover;
  $scope.musicGenres = backendResponse.data.musicGenres;
  $scope.carouselSlidesInterval = 10000;
  $scope.carouselSlides = $filter('partition')($scope.musicGenres, 6);
  for(index in $scope.carouselSlides) {
    $scope.carouselSlides[index] = {item: $scope.carouselSlides[index], active: false};
  }
  $scope.viewCover = function(cover) {
    $state.go('cover', {id : cover.id});
  };
}])
.controller('searchController', ['$scope', '$stateParams', 'backendResponse', function($scope, $stateParams, backendResponse) {
  $scope.searchQuery = $stateParams.q;
  $scope.artists = backendResponse.data.artists;
  $scope.musics = backendResponse.data.musics;
  $scope.coversByArtists = backendResponse.data.coversByArtists;
  $scope.coversOfMusics = backendResponse.data.coversOfMusics;
  $scope.totalResults = $scope.artists.length + $scope.musics.length;
}])
.controller('addCoverController', ['$scope', '$state', 'backendResponse', 'alertService', 'coverService', function($scope, $state, backendResponse, alertService, coverService) {
  $scope.youtubeRegex = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
  $scope.musicGenres = backendResponse.data.allMusicGenres;
  $scope.videoUrlPasted = function(event) {
    $scope.cover = {};
    var url = event.clipboardData.getData("text/plain");
    if($scope.youtubeRegex.test(url)) {
      $scope.cover.url = url;
    } else {
      alertService.addAlert('warning', 'For now we support only Youtube videos =(');
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
    return coverService.searchMusics($scope.cover.artist, query).then(function(response) {
      return response.data;
    });
  };
  $scope.selectMusic = function(music) {
    $scope.cover.music = music.title;
  };
  $scope.addCover = function() {
    coverService.addCover($scope.cover).then(function(response) {
      alertService.addAlert('success', 'Cover added successfully');
      $state.go('cover', {id : response.data.id});
    });
  };
}])
.controller('coverController', ['$scope', '$stateParams', 'backendResponse', function($scope, $stateParams, backendResponse) {
  $scope.cover = backendResponse.data.cover;
  $scope.bestCoversOfMusic = backendResponse.data.bestCoversOfMusic;
  $scope.bestCoversByArtist = backendResponse.data.bestCoversByArtist;
}])
.controller('coversRankController', ['$scope', '$stateParams', 'backendResponse', 'coverService', function($scope, $stateParams, backendResponse, coverService) {
  $scope.rankType = $stateParams.rank;
  $scope.coversRank = backendResponse.data.coversRank;
  $scope.totalCoversRank = backendResponse.data.totalCoversRank;
  $scope.artistsOfCovers = backendResponse.data.artistsOfCovers;

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
.controller('artistController', ['$scope', '$stateParams', 'backendResponse', function($scope, $stateParams, backendResponse) {
  $scope.sortType = $stateParams.sort ? $stateParams.sort : 'best';
  $scope.artist = backendResponse.data.artist;
  $scope.totalMusicsByArtist = backendResponse.data.totalMusicsByArtist;
  $scope.musicsByArtist = backendResponse.data.musicsByArtist;
  $scope.coversOfMusics = backendResponse.data.coversOfMusics;
  $scope.isSorted = function(type) {
    return $scope.sortType === type;
  };
}])
.controller('artistsController', ['$scope', 'backendResponse', function($scope, backendResponse) {
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.artists = backendResponse.data.artists;
  $scope.totalArtists = backendResponse.data.totalArtists;
  $scope.currentPage = 1;
  $scope.nextPage = function() {
    $scope.currentPage++;
  };
}])
.controller('musicController', ['$scope', '$stateParams', 'backendResponse', function($scope, $stateParams, backendResponse) {
  $scope.sortType = $stateParams.sort ? $stateParams.sort : 'best';
  $scope.music = backendResponse.data.music;
  $scope.totalCoversOfMusic = backendResponse.data.totalCoversOfMusic;
  $scope.coversOfMusic = backendResponse.data.coversOfMusic;
  $scope.isSorted = function(type) {
    return $scope.sortType === type;
  };
}])
.controller('musicGenreController', ['$scope', 'backendResponse', function($scope, backendResponse) {
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.bestArtistsOfMusicGenre = backendResponse.data.bestArtistsOfMusicGenre;
  $scope.bestCoversOfMusicGenre = backendResponse.data.bestCoversOfMusicGenre;
  $scope.latestCoversOfMusicGenre = backendResponse.data.latestCoversOfMusicGenre;
}])
.controller('musicGenreRankController', ['$scope', '$stateParams', 'backendResponse', function($scope, $stateParams, backendResponse) {
  $scope.rankType = $stateParams.rank;
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.coversOfMusicGenre = backendResponse.data.coversOfMusicGenre;
  $scope.totalCoversOfMusicGenre = backendResponse.data.totalCoversOfMusicGenre;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
}]);