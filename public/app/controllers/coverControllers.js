angular
.module('coverAcademy.controllers')
.controller('coversController', ['$scope', '$state', '$filter', '$translate', 'backendResponse', 'seoService', function($scope, $state, $filter, $translate, backendResponse, seoService) {
  $translate('seo.title.covers').then(function(translation) {
    seoService.setTitle(translation);
  });

  $scope.latestCovers = backendResponse.data.latestCovers;
  $scope.bestCovers = backendResponse.data.bestCovers;
  $scope.topCover = backendResponse.data.topCover;
  $scope.musicGenres = backendResponse.data.musicGenres;
  $scope.bestArtistsOfMusicGenre = backendResponse.data.bestArtistsOfMusicGenre;

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

  $translate('seo.title.search', {searchQuery: $scope.searchQuery}).then(function(translation) {
    seoService.setTitle(translation);
  });
}])
.controller('addCoverController', ['$scope', '$state', '$translate', 'backendResponse', 'seoService', 'alertService', 'coverService', 'searchService', function($scope, $state, $translate, backendResponse, seoService, alertService, coverService, searchService) {
  $translate('seo.title.add_cover').then(function(translation) {
    seoService.setTitle(translation);
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
    return searchService.searchMusics(query, $scope.cover.artist).then(function(response) {
      return response.data;
    });
  };
  $scope.selectMusic = function(music) {
    $scope.cover.music = music.title;
  };
  $scope.addCover = function() {
    coverService.addCover($scope.cover).then(function(response) {
      alertService.addAlert('success', 'Cover added successfully');
      $state.go('app.cover', {locale: $scope.locale(), id: response.data.id, slug: response.data.slug});
    });
  };
}])
.controller('coverController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', 'constants', function($scope, $stateParams, $translate, backendResponse, seoService, constants) {
  $scope.cover = backendResponse.data.cover;
  $scope.bestCoversOfMusic = backendResponse.data.bestCoversOfMusic;
  $scope.bestCoversByArtist = backendResponse.data.bestCoversByArtist;
  $scope.siteUrl = constants.SITE_URL;

  $translate('seo.title.cover', {author: $scope.cover.author, music: $scope.cover.music.title, artist: $scope.cover.artist.name}).then(function(translation) {
    seoService.setTitle(translation);
  });
  seoService.setImage($scope.cover.large_thumbnail);
}])
.controller('coversRankController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, $translate, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank;
  $scope.coversRank = backendResponse.data.coversRank;
  $scope.totalCoversRank = backendResponse.data.totalCoversRank;
  $scope.artistsOfCovers = backendResponse.data.artistsOfCovers;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  $translate('rank_type.' + $scope.rankType).then(function(rankType) {
    $translate('seo.title.covers_rank', {rankType: rankType}).then(function(translation) {
      seoService.setTitle(translation);
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
  $scope.rankType = $stateParams.rank || 'best';
  $scope.artist = backendResponse.data.artist;
  $scope.totalMusicsByArtist = backendResponse.data.totalMusicsByArtist;
  $scope.musicsByArtist = backendResponse.data.musicsByArtist;
  $scope.coversOfMusics = backendResponse.data.coversOfMusics;

  $translate('rank_type.' + $scope.rankType).then(function(rankType) {
    $translate('seo.title.artist', {rankType: rankType, artist: $scope.artist.name}).then(function(translation) {
      seoService.setTitle(translation);
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

  var titleTranslationKey = $scope.musicGenre ? 'seo.title.artists_music_genre' : 'seo.title.artists_all';
  var titleTranslationVars = $scope.musicGenre ? {musicGenre: $scope.musicGenre.name} : {};
  $translate(titleTranslationKey, titleTranslationVars).then(function(translation) {
    seoService.setTitle(translation);
  })

  $scope.pageChanged = function() {
    artistService.listArtists($scope.musicGenre, $scope.currentPage).then(function(response) {
      $scope.artists = response.data;
    });
  };
}])
.controller('musicController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, $translate, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank || 'best';
  $scope.music = backendResponse.data.music;
  $scope.totalCoversOfMusic = backendResponse.data.totalCoversOfMusic;
  $scope.coversOfMusic = backendResponse.data.coversOfMusic;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  $translate('rank_type.' + $scope.rankType).then(function(rankType) {
    $translate('seo.title.music', {rankType: rankType, music: $scope.music.title, artist: $scope.music.artist.name}).then(function(translation) {
      seoService.setTitle(translation);
    });
  });
  seoService.setImage($scope.music.medium_thumbnail);

  $scope.pageChanged = function() {
    var nextPage = $scope.rankType === 'best' ? coverService.bestCoversOfMusic($scope.music, $scope.currentPage) : coverService.latestCoversOfMusic($scope.music, $scope.currentPage);
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

  $translate('seo.title.music_genre', {musicGenre: $scope.musicGenre.name}).then(function(translation) {
    seoService.setTitle(translation);
  });
  seoService.setImage('/img/genres/' + $scope.musicGenre.image);
}])
.controller('musicGenreRankController', ['$scope', '$stateParams', '$translate', 'backendResponse', 'seoService', 'coverService', function($scope, $stateParams, $translate, backendResponse, seoService, coverService) {
  $scope.rankType = $stateParams.rank;
  $scope.musicGenre = backendResponse.data.musicGenre;
  $scope.coversOfMusicGenre = backendResponse.data.coversOfMusicGenre;
  $scope.totalCoversOfMusicGenre = backendResponse.data.totalCoversOfMusicGenre;

  $scope.currentPage = 1;
  $scope.coversPerPage = 20;

  $translate('rank_type.' + $scope.rankType).then(function(rankType) {
    $translate('seo.title.music_genre_rank', {rankType: rankType, musicGenre: $scope.musicGenre.name}).then(function(translation) {
      seoService.setTitle(translation);
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