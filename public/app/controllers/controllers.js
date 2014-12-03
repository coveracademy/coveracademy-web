angular
.module('coverAcademy.controllers', [])
.controller('applicationController', ['$scope', '$state', '$stateParams', '$translate', 'authEvents', 'authenticationService', 'alertService', 'translationService', 'seoService', function($scope, $state, $stateParams, $translate, authEvents, authenticationService, alertService, translationService, seoService) {
  $scope.locale = $translate.use;

  // SEO
  $scope.siteName = seoService.getSiteName;
  $scope.pageUrl = seoService.getUrl;
  $scope.pageTitle = seoService.getTitle;
  $scope.metaDescription = seoService.getDescription;
  $scope.metaKeywords = seoService.getKeywords;
  $scope.metaImage = seoService.getImage;

  $scope.isAuthenticated = authenticationService.isAuthenticated;
  $scope.user = authenticationService.getUser;
  $scope.temporaryUser = authenticationService.getTemporaryUser;
  $scope.login = authenticationService.login;
  $scope.logout = authenticationService.logout;

  $scope.$on(authEvents.MUST_REGISTER, function() {
    $state.go('app.register', {locale: $scope.locale()});
  });
  $scope.$on(authEvents.NOT_AUTHORIZED, function() {
    $state.go('app.index', {locale: $scope.locale()});
    // $translate('alerts.not_authorized').then(function(translation) {
    //   alertService.addAlert('warning', translation);
    // });
  });
  $scope.$on(authEvents.NOT_AUTHENTICATED, function() {
    $state.go('app.index', {locale: $scope.locale()});
    // $translate('alerts.not_authenticated').then(function(translation) {
    //   alertService.addAlert('warning', translation);
    // });
  });
  $scope.$on(authEvents.HTTP_NOT_AUTHENTICATED, function() {
    authenticationService.login();
  });
  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    // $translate('alerts.login_success').then(function(translation) {
    //   alertService.addAlert('success', translation);
    // });
  });
  $scope.$on(authEvents.LOGIN_FAILED, function(event, errorKey) {
    if(errorKey && errorKey.length > 0) {
      translationService.translateError(errorKey).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    } else {
      $translate('alerts.login_failed').then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    }
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $state.go($state.current, $stateParams, {reload: true});
  });

  $scope.isLocale = function(locale) {
    return $translate.use() === locale;
  };
}])
.controller('rootController', ['$scope', '$state', '$translate', function($scope, $state, $translate) {
  $state.go('app.index', {locale: $translate.use()});
}])
.controller('indexController', ['$scope', '$state', '$filter', '$translate', 'backendResponse', 'seoService', function($scope, $state, $filter, $translate, backendResponse, seoService) {
}])
.controller('headerController', ['$scope', '$state', '$languages', 'authenticationService', 'coverService', 'searchService', function($scope, $state, $languages, authenticationService, coverService, searchService) {
  $scope.searchQuery = '';
  $scope.languages = $languages.all;
  $scope.sectionActive = '';
  $scope.sections = {
    contact: ['app.contact'],
    covers: ['app.cover', 'app.covers', 'app.coversRank', 'app.artist', 'app.artists', 'app.music', 'app.musicGenre', 'app.musicGenreRank', 'app.search']
  };
  $scope.isSectionActive = function(section) {
    var sectionExistent = $scope.sections[section];
    return sectionExistent && sectionExistent.indexOf($state.current.name) >= 0;
  };
  $scope.isRegisterState = function() {
    return $state.current.name === 'app.register';
  };
  $scope.searchMusicOrArtist = function(query) {
    return searchService.searchMusicOrArtist(query).then(function(response) {
      var queryResult = [];
      response.data.musics.forEach(function(music) {
        music.itemType = 'music';
        music.displayName = music.title + ' (' + music.artist.name + ')';
        queryResult.push(music);
      });
      response.data.artists.forEach(function(artist) {
        artist.itemType = 'artist';
        artist.displayName = artist.name;
        queryResult.push(artist);
      });
      return queryResult;
    });
  };
  $scope.selectItem = function(item) {
    if(item.itemType === 'music') {
      $state.go('app.music', {locale: $scope.locale(), music : item.slug});
    } else {
      $state.go('app.artist', {locale: $scope.locale(), artist : item.slug});
    }
  };
  $scope.submitSearch = function() {
    $state.go('app.search', {locale: $scope.locale(), q: $scope.searchQuery});
  };
}])
.controller('alertController', ['$scope', 'alertService', function($scope, alertService) {
  $scope.alerts = alertService.getAlerts();
  $scope.closeAlert = alertService.closeAlert;
}])
.controller('contactController', ['$scope', '$translate', 'seoService', 'alertService', 'userService', function($scope, $translate, seoService, alertService, userService) {
  $translate('seo.title.contact').then(function(translation) {
    seoService.setTitle(translation);
  });

  $scope.sendEmail = function() {
    userService.sendEmail($scope.name, $scope.email, $scope.subject, $scope.message).then(function(response) {
      $translate('forms.email_sended').then(function(translation) {
        alertService.addAlert('success', translation);
      });
      $scope.name = '';
      $scope.email = '';
      $scope.subject = '';
      $scope.message = '';
      $scope.contactForm.$setPristine();
    }).catch(function(response) {
      $translate('forms.error_sending_email').then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
}])
.controller('termsOfUseController', ['$translate', 'seoService', function($translate, seoService) {
  $translate('seo.title.terms_of_use').then(function(translation) {
    seoService.setTitle(translation);
  });
}])
.controller('privacyPolicyController', ['$translate', 'seoService', function($translate, seoService) {
  $translate('seo.title.privacy_policy').then(function(translation) {
    seoService.setTitle(translation);
  });
}])
.controller('adminController', ['$scope', '$filter', '$translate', '$underscore', 'backendResponse', 'seoService', 'alertService', 'modalService', 'coverService', 'searchService', 'artistService', 'musicService', function($scope, $filter, $translate, $underscore, backendResponse, seoService, alertService, modalService, coverService, searchService, artistService, musicService) {
  $translate('seo.title.admin').then(function(translation) {
    seoService.setTitle(translation);
  });
  var partitionPotentialCovers = function(potentialCovers) {
    return $filter('partition')(potentialCovers, 3);
  };
  $scope.potentialCoversTab = {
    potentialCovers: backendResponse.data.potentialCovers,
    potentialCoversPartitioned: partitionPotentialCovers(backendResponse.data.potentialCovers),
    acceptCover: function(potentialCover) {
      coverService.acceptCover(potentialCover).then(function(response) {
        alertService.addAlert('success', 'Potential cover accepted successfully');
        $scope.potentialCoversTab.potentialCovers = $underscore.reject($scope.potentialCoversTab.potentialCovers, function(cover) {
          return potentialCover.id == cover.id;
        });
        $scope.potentialCoversTab.potentialCoversPartitioned = partitionPotentialCovers($scope.potentialCoversTab.potentialCovers);
      });
    },
    refuseCover: function(potentialCover) {
      coverService.refuseCover(potentialCover).then(function(response) {
        alertService.addAlert('success', 'Potential cover refused successfully');
        $scope.potentialCoversTab.potentialCovers = $underscore.reject($scope.potentialCoversTab.potentialCovers, function(cover) {
          return potentialCover.id == cover.id;
        });
        $scope.potentialCoversTab.potentialCoversPartitioned = partitionPotentialCovers($scope.potentialCoversTab.potentialCovers);
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
}]);