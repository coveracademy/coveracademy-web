angular
.module('coverChallengeApp.controllers')
.controller('adminController', ['$scope', 'backendResponse', 'seoService', 'alertService', 'modalService', 'coverService', 'searchService', 'artistService', 'musicService', function($scope, backendResponse, seoService, alertService, modalService, coverService, searchService, artistService, musicService) {
  seoService.setTitle('Administration console');
  $scope.potentialCoversTab = {
    potentialCovers: backendResponse.data.potentialCovers,
    acceptCover: function(potentialCover) {
      coverService.acceptCover(potentialCover).then(function(response) {
        alertService.addAlert('success', 'Potential cover accepted successfully');
        $scope.potentialCoversTab.potentialCovers = _.reject($scope.potentialCoversTab.potentialCovers, function(cover) {
          return potentialCover.id == cover.id;
        });
      });
    },
    refuseCover: function(potentialCover) {
      coverService.refuseCover(potentialCover).then(function(response) {
        alertService.addAlert('success', 'Potential cover refused successfully');
        $scope.potentialCoversTab.potentialCovers = _.reject($scope.potentialCoversTab.potentialCovers, function(cover) {
          return potentialCover.id == cover.id;
        });
      });
    }
  };
  $scope.coverTab = {
    searchCoverByID: function(searchID) {
      coverService.getCover(searchID).then(function(response) {
        $scope.coverTab.cover = {};
        $scope.coverTab.cover.id = response.data.id;
        $scope.coverTab.cover.url = response.data.url;
        $scope.coverTab.cover.author = response.data.author;
        $scope.coverTab.cover.artist = response.data.artist.name;
        $scope.coverTab.cover.music = response.data.music.title;
      })
    },
    searchArtists: function(query) {
      return searchService.searchArtists(query).then(function(response) {
        return response.data;
      });
    },
    selectArtist: function(artist) {
      $scope.coverTab.cover.artist = artist.name;
      $scope.coverTab.cover.music = null;
    },
    searchMusics: function(query) {
      return searchService.searchMusics(query, $scope.coverTab.cover.artist).then(function(response) {
        return response.data;
      });
    },
    selectMusic: function(music) {
      $scope.coverTab.cover.music = music.title;
    },
    saveCover: function() {
      coverService.addCover($scope.coverTab.cover).then(function(response) {
        alertService.addAlert('success', 'Cover saved successfully');
      });
    },
    removeCover: function() {
      var modalScope = {
        headerText: 'Remove cover song',
        bodyText: 'Do you really want to remove this cover song?'
      };
      modalService.show({}, modalScope).then(function() {
        coverService.removeCover($scope.coverTab.cover).then(function(response) {
          alertService.addAlert('success', 'Cover removed successfully');
          $scope.coverTab.cover = null;
        });
      });
    }
  };
  $scope.artistTab = {
    musicGenres: backendResponse.data.musicGenres,
    searchArtists: function(query) {
      return searchService.searchArtists(query, ['musicGenre']).then(function(response) {
        return response.data;
      });
    },
    selectArtist: function(artist) {
      $scope.artistTab.artist = artist;
    },
    saveArtist: function() {
      var artist = {
        id: $scope.artistTab.artist.id,
        name: $scope.artistTab.artist.name,
        music_genre_id: $scope.artistTab.artist.musicGenre.id,
        small_thumbnail: $scope.artistTab.artist.small_thumbnail,
        medium_thumbnail: $scope.artistTab.artist.medium_thumbnail,
        large_thumbnail: $scope.artistTab.artist.large_thumbnail,
      };
      artistService.saveArtist(artist).then(function(response) {
        alertService.addAlert('success', 'Artist saved successfully');
      });
    }
  };
  $scope.musicTab = {
    searchArtists: function(query) {
      return searchService.searchArtists(query).then(function(response) {
        return response.data;
      });
    },
    selectArtist: function(artist) {
      $scope.artistTab.artist = artist;
    },
    searchMusics: function(query) {
      return searchService.searchMusics(query).then(function(response) {
        return response.data;
      });
    },
    selectMusic: function(music) {
      $scope.musicTab.music = music;
    },
    saveMusic: function() {
      var music = {
        id: $scope.musicTab.music.id,
        title: $scope.musicTab.music.title,
        artist_id: $scope.musicTab.music.artist.id,
        small_thumbnail: $scope.musicTab.music.small_thumbnail,
        medium_thumbnail: $scope.musicTab.music.medium_thumbnail,
        large_thumbnail: $scope.musicTab.music.large_thumbnail,
      };
      musicService.saveMusic(music).then(function(response) {
        alertService.addAlert('success', 'Music saved successfully');
      });
    }
  };
}])
.controller('indexController', ['$scope', '$state', '$filter', 'backendResponse', 'seoService', function($scope, $state, $filter, backendResponse, seoService) {
  seoService.setTitle('The best covers in one place');

  $scope.latestCovers = backendResponse.data.latestCovers;
  $scope.bestCovers = backendResponse.data.bestCovers;
  $scope.topCover = backendResponse.data.topCover;
  $scope.musicGenres = backendResponse.data.musicGenres;
  $scope.bestArtistsOfMusicGenre = backendResponse.data.bestArtistsOfMusicGenre;
  $scope.firstArtist = $scope.bestArtistsOfMusicGenre[0];
  $scope.secondArtist = $scope.bestArtistsOfMusicGenre[1];
  $scope.thirdAndFourthArtists = $scope.bestArtistsOfMusicGenre.slice(2);

  $scope.carouselSlidesInterval = 10000;
  $scope.carouselSlides = $filter('partition')($scope.musicGenres, 6);
  for(index in $scope.carouselSlides) {
    $scope.carouselSlides[index] = {item: $scope.carouselSlides[index], active: false};
  }
}])
.controller('searchController', ['$scope', '$stateParams', 'backendResponse', 'seoService', function($scope, $stateParams, backendResponse, seoService) {
  $scope.searchQuery = $stateParams.q;
  $scope.artists = backendResponse.data.artists;
  $scope.musics = backendResponse.data.musics;
  $scope.coversByArtists = backendResponse.data.coversByArtists;
  $scope.coversOfMusics = backendResponse.data.coversOfMusics;
  $scope.totalResults = $scope.artists.length + $scope.musics.length;

  seoService.setTitle('Search results for "' + $scope.searchQuery + '"');
}])
.controller('addCoverController', ['$scope', '$state', 'backendResponse', 'seoService', 'alertService', 'coverService', 'searchService', function($scope, $state, backendResponse, seoService, alertService, coverService, searchService) {
  seoService.setTitle('Add a new cover');

  $scope.youtubeRegex = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
  $scope.musicGenres = backendResponse.data.musicGenres;
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
    return searchService.searchArtists(query).then(function(response) {
      return response.data;
    });
  };
  $scope.selectArtist = function(artist) {
    $scope.cover.artist = artist.name;
    $scope.cover.music = null;
  };
  $scope.searchMusics = function(query) {
    return searchService.searchMusics($scope.cover.artist, query).then(function(response) {
      return response.data;
    });
  };
  $scope.selectMusic = function(music) {
    $scope.cover.music = music.title;
  };
  $scope.addCover = function() {
    coverService.addCover($scope.cover).then(function(response) {
      alertService.addAlert('success', 'Cover added successfully');
      $state.go('app.cover', {locale: $scope.locale(), id : response.data.id, slug: response.data.slug});
    });
  };
}])
.controller('coverController', ['$scope', '$stateParams', 'backendResponse', 'seoService', 'constants', function($scope, $stateParams, backendResponse, seoService, constants) {
  $scope.cover = backendResponse.data.cover;
  $scope.bestCoversOfMusic = backendResponse.data.bestCoversOfMusic;
  $scope.bestCoversByArtist = backendResponse.data.bestCoversByArtist;
  $scope.domain = constants.DOMAIN;
  seoService.setTitle($scope.cover.author + '\'s cover of "' + $scope.cover.music.title + '" by ' + $scope.cover.artist.name);
}])
.controller('coversRankController', ['$scope', '$stateParams', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank;
  $scope.coversRank = backendResponse.data.coversRank;
  $scope.totalCoversRank = backendResponse.data.totalCoversRank;
  $scope.artistsOfCovers = backendResponse.data.artistsOfCovers;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  seoService.setTitle('The ' + $scope.rankType + ' covers from this week');

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
.controller('artistController', ['$scope', '$stateParams', 'backendResponse', 'seoService', function($scope, $stateParams, backendResponse, seoService) {
  $scope.rankType = $stateParams.rank ? $stateParams.rank : 'best';
  $scope.artist = backendResponse.data.artist;
  $scope.totalMusicsByArtist = backendResponse.data.totalMusicsByArtist;
  $scope.musicsByArtist = backendResponse.data.musicsByArtist;
  $scope.coversOfMusics = backendResponse.data.coversOfMusics;

  seoService.setTitle('The ' + $scope.rankType + ' covers of musics by ' + $scope.artist.name);

  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
}])
.controller('artistsController', ['$scope', 'backendResponse', 'seoService', 'coverService', 'artistService', function($scope, backendResponse, seoService, coverService, artistService) {
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.artists = backendResponse.data.artists;
  $scope.totalArtists = backendResponse.data.totalArtists;

  $scope.currentPage = 1;
  $scope.artistsPerPage = 60;

  seoService.setTitle(($scope.musicGenre ? $scope.musicGenre.name : 'All') + ' artists');

  $scope.pageChanged = function() {
    artistService.listArtists($scope.musicGenre, $scope.currentPage).then(function(response) {
      $scope.artists = response.data;
    });
  };
}])
.controller('musicController', ['$scope', '$stateParams', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank ? $stateParams.rank : 'best';
  $scope.music = backendResponse.data.music;
  $scope.totalCoversOfMusic = backendResponse.data.totalCoversOfMusic;
  $scope.coversOfMusic = backendResponse.data.coversOfMusic;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  seoService.setTitle('The ' + $scope.rankType + ' covers of "' + $scope.music.title + '" by ' + $scope.music.artist.name);

  $scope.pageChanged = function() {
    var nextPage = $scope.rankType === 'best' ? coverService.bestCoversOfMusic($scope.music, $scope.currentPage) : coverService.latestCoversOfMusic($scope.music, $scope.currentPage);
    console.log(nextPage)
    nextPage.then(function(response) {
      $scope.coversOfMusic = response.data;
    });
  };
  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
}])
.controller('musicGenreController', ['$scope', 'backendResponse', 'seoService', function($scope, backendResponse, seoService) {
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.bestArtistsOfMusicGenre = backendResponse.data.bestArtistsOfMusicGenre;
  $scope.bestCoversOfMusicGenre = backendResponse.data.bestCoversOfMusicGenre;
  $scope.latestCoversOfMusicGenre = backendResponse.data.latestCoversOfMusicGenre;

  seoService.setTitle($scope.musicGenre.name + ' cover songs');
}])
.controller('musicGenreRankController', ['$scope', '$stateParams', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank;
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.coversOfMusicGenre = backendResponse.data.coversOfMusicGenre;
  $scope.totalCoversOfMusicGenre = backendResponse.data.totalCoversOfMusicGenre;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  seoService.setTitle('The ' + $scope.rankType + ' ' + $scope.musicGenre.name + ' cover songs')

  $scope.pageChanged = function() {
    var nextPage = $scope.rankType === 'best' ? coverService.bestCoversOfMusicGenre($scope.musicGenre, $scope.currentPage) : coverService.latestCoversOfMusicGenre($scope.musicGenre, $scope.currentPage);
    nextPage.then(function(response) {
      $scope.coversOfMusicGenre = response.data;
    });
  };
  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
}]);