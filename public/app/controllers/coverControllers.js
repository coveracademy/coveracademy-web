angular
.module('coverAcademy.controllers')
.controller('adminController', ['$scope', '$translate', 'backendResponse', 'seoService', 'alertService', 'modalService', 'coverService', 'searchService', 'artistService', 'musicService', function($scope, $translate, backendResponse, seoService, alertService, modalService, coverService, searchService, artistService, musicService) {
  $translate('seo.admin').then(function(message) {
    seoService.setTitle(message);
  });

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
        $scope.artistTab.artist = response.data;
      });
    }
  };
  $scope.musicTab = {
    searchMusics: function(query) {
      return searchService.searchMusics(query).then(function(response) {
        response.data.forEach(function(music) {
          music.displayTitle = music.title + ' by ' + music.artist.name;
        });
        return response.data;
      });
    },
    selectMusic: function(music) {
      $scope.musicTab.music = music;
      $scope.musicTab.music.artist = $scope.musicTab.music.artist.name;
    },
    searchArtists: function(query) {
      return searchService.searchArtists(query).then(function(response) {
        return response.data;
      });
    },
    selectArtist: function(artist) {
      $scope.musicTab.music.artist = artist.name;
    },
    saveMusic: function() {
      var music = {
        id: $scope.musicTab.music.id,
        title: $scope.musicTab.music.title,
        artist: $scope.musicTab.music.artist,
        small_thumbnail: $scope.musicTab.music.small_thumbnail,
        medium_thumbnail: $scope.musicTab.music.medium_thumbnail,
        large_thumbnail: $scope.musicTab.music.large_thumbnail,
      };
      musicService.saveMusic(music).then(function(response) {
        alertService.addAlert('success', 'Music saved successfully');
        $scope.musicTab.music = response.data;
        $scope.musicTab.music.artist = $scope.musicTab.music.artist.name
      });
    }
  };
}])
.controller('indexController', ['$scope', '$state', '$filter', '$translate', 'backendResponse', 'seoService', function($scope, $state, $filter, $translate, backendResponse, seoService) {
  $translate('seo.index').then(function(message) {
    seoService.setTitle(message);
  });

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
.controller('searchController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', function($scope, $stateParams, $translate, backendResponse, seoService) {
  $scope.searchQuery = $stateParams.q;
  $scope.artists = backendResponse.data.artists;
  $scope.musics = backendResponse.data.musics;
  $scope.coversByArtists = backendResponse.data.coversByArtists;
  $scope.coversOfMusics = backendResponse.data.coversOfMusics;
  $scope.totalResults = $scope.artists.length + $scope.musics.length;

  $translate('seo.search', {searchQuery: $scope.searchQuery}).then(function(message) {
    seoService.setTitle(message);
  });
}])
.controller('addCoverController', ['$scope', '$state', '$translate', 'backendResponse', 'seoService', 'alertService', 'coverService', 'searchService', function($scope, $state, $translate, backendResponse, seoService, alertService, coverService, searchService) {
  $translate('seo.add_cover').then(function(message) {
    seoService.setTitle(message);
  });

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
.controller('coverController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', 'constants', function($scope, $stateParams, $translate, backendResponse, seoService, constants) {
  $scope.cover = backendResponse.data.cover;
  $scope.bestCoversOfMusic = backendResponse.data.bestCoversOfMusic;
  $scope.bestCoversByArtist = backendResponse.data.bestCoversByArtist;
  $scope.siteUrl = constants.SITE_URL;

  $translate('seo.cover', {author: $scope.cover.author, music: $scope.cover.music.title, artist: $scope.cover.artist.name}).then(function(message) {
    seoService.setTitle(message);
  });
  seoService.setImage($scope.cover.medium_thumbnail);
}])
.controller('coversRankController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, $translate, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank;
  $scope.coversRank = backendResponse.data.coversRank;
  $scope.totalCoversRank = backendResponse.data.totalCoversRank;
  $scope.artistsOfCovers = backendResponse.data.artistsOfCovers;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  $translate('rank_type.' + $scope.rankType).then(function(rankType) {
    $translate('seo.covers_rank', {rankType: rankType}).then(function(message) {
      seoService.setTitle(message);
    });
  });


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
.controller('artistController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', function($scope, $stateParams, $translate, backendResponse, seoService) {
  $scope.rankType = $stateParams.rank ? $stateParams.rank : 'best';
  $scope.artist = backendResponse.data.artist;
  $scope.totalMusicsByArtist = backendResponse.data.totalMusicsByArtist;
  $scope.musicsByArtist = backendResponse.data.musicsByArtist;
  $scope.coversOfMusics = backendResponse.data.coversOfMusics;

  $translate('rank_type.' + $scope.rankType).then(function(rankType) {
    $translate('seo.artist', {rankType: rankType, artist: $scope.artist.name}).then(function(message) {
      seoService.setTitle(message);
    });
  });
  seoService.setImage($scope.artist.medium_thumbnail);

  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
}])
.controller('artistsController', ['$scope', '$translate', 'backendResponse', 'seoService', 'coverService', 'artistService', function($scope, $translate, backendResponse, seoService, coverService, artistService) {
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.artists = backendResponse.data.artists;
  $scope.totalArtists = backendResponse.data.totalArtists;

  $scope.currentPage = 1;
  $scope.artistsPerPage = 60;

  var titleTranslationKey = $scope.musicGenre ? 'seo.artists_music_genre' : 'seo.artists_all';
  var titleTranslationVars = $scope.musicGenre ? {musicGenre: $scope.musicGenre.name} : {};
  $translate(titleTranslationKey, titleTranslationVars).then(function(message) {
    seoService.setTitle(message);
  })

  $scope.pageChanged = function() {
    artistService.listArtists($scope.musicGenre, $scope.currentPage).then(function(response) {
      $scope.artists = response.data;
    });
  };
}])
.controller('musicController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, $translate, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank ? $stateParams.rank : 'best';
  $scope.music = backendResponse.data.music;
  $scope.totalCoversOfMusic = backendResponse.data.totalCoversOfMusic;
  $scope.coversOfMusic = backendResponse.data.coversOfMusic;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  $translate('rank_type.' + $scope.rankType).then(function(rankType) {
    $translate('seo.music', {rankType: rankType, music: $scope.music.title, artist: $scope.music.artist.name}).then(function(message) {
      seoService.setTitle(message);
    });
  });
  seoService.setImage($scope.music.medium_thumbnail);

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
.controller('musicGenreController', ['$scope', '$translate', 'constants', 'backendResponse', 'seoService', function($scope, $translate, constants, backendResponse, seoService) {
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.bestArtistsOfMusicGenre = backendResponse.data.bestArtistsOfMusicGenre;
  $scope.bestCoversOfMusicGenre = backendResponse.data.bestCoversOfMusicGenre;
  $scope.latestCoversOfMusicGenre = backendResponse.data.latestCoversOfMusicGenre;

  $translate('seo.music_genre', {musicGenre: $scope.musicGenre.name}).then(function(message) {
    seoService.setTitle(message);
  });
  seoService.setImage(constants.SITE_URL + '/img/genres/' + $scope.musicGenre.image);
}])
.controller('musicGenreRankController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, $translate, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank;
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.coversOfMusicGenre = backendResponse.data.coversOfMusicGenre;
  $scope.totalCoversOfMusicGenre = backendResponse.data.totalCoversOfMusicGenre;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  $translate('rank_type.' + $scope.rankType).then(function(rankType) {
    $translate('seo.music_genre_rank', {rankType: rankType, musicGenre: $scope.musicGenre.name}).then(function(message) {
      seoService.setTitle(message);
    });
  });

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