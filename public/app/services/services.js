angular
.module('coverAcademy.services', [])
.service('seoService', ['$location', 'constants', function($location, constants) {
  var title = null;
  var description = null;
  var keywords = null;
  var image = null;

  this.getSiteName = function() {
    return constants.SITE_NAME;
  };
  this.getUrl = function() {
    return $location.absUrl();;
  };
  this.getTitle = function() {
    return title;
  };
  this.setTitle = function(newTitle) {
    title = newTitle;
  };
  this.getDescription = function() {
    return description;
  };
  this.setDescription = function(newDescription) {
    description = newDescription;
  };
  this.getImage = function() {
    return image;
  };
  this.setImage = function(newImage) {
    image = newImage;
  };
  this.setKeywords = function(newKeywords) {
    if(_.isString(newKeywords)) {
      keywords = newKeywords;
    } else if(_.isArray(newKeywords)) {
      _.forEach(newKeywords, function(newKeyword) {
        if (keywords === '') {
          keywords += newKeyword;
        } else {
          keywords += ', ' + newKeyword;
        }
      });
    }
  };
  this.getKeywords = function() {
    return keywords;
  };
  this.reset = function() {
    title = null;
    description = null;
    keywords = null;
    image = null;
  };
}])
.service('alertService', ['$timeout', function($timeout) {
  var $ = this;
  var alerts = [];
  this.getAlerts = function() {
    return alerts;
  };
  this.addAlert = function(type, message) {
    var that = this;
    var alert = {type: type, msg: message};
    $.getAlerts().push(alert);
    $timeout(function() {
      $.getAlerts().splice(that.getAlerts().indexOf(alert), 1);
    }, 5000);
  };
}])
.service('authenticationService', ['$rootScope', '$modal', '$window', '$q', '$cookieStore', 'constants', 'authEvents', 'userService', function($rootScope, $modal, $window, $q, $cookieStore, constants, authEvents, userService) {
  var $ = this;
  var user = $cookieStore.get(constants.USER_COOKIE) || null;
  var changeUser = function(newUser) {
    if(newUser) {
      user = newUser;
      $cookieStore.put(constants.USER_COOKIE, newUser);
    } else {
      user = null;
      $cookieStore.remove(constants.USER_COOKIE);
    }
  };
  userService.getAuthenticatedUser().then(function(response) {
    if(!response.data) {
      changeUser(null);
    }
  });

  this.getUser = function() {
    return user;
  };
  this.isAuthenticated = function() {
    return user ? true : false;
  };
  this.isAuthorized = function (accessLevel) {
    var userRole = $.isAuthenticated() ? $.getUser().permission : 'public';
    return !accessLevel || _.contains(accessLevel.roles, userRole);
  };
  this.login = function(provider) {
    var deferred = $q.defer();
    var left = ($window.screen.width / 2) - (780 / 2);
    var top = ($window.screen.height / 2) - (410 / 2);
    var win = $window.open(userService.loginEndpoint(provider), 'SignIn', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=' + left + ',top=' + top);
    win.focus();
    $window.authResult = function(result) {
      if(result === 'success') {
        userService.getAuthenticatedUser().then(function(response) {
          changeUser(response.data);
          deferred.resolve(user);
          $rootScope.$broadcast(authEvents.LOGIN_SUCCESS);
        }).catch(function(err) {
          deferred.reject(err);
          $rootScope.$broadcast(authEvents.LOGIN_FAILED);
        });
      } else if(result === 'fail') {
        deferred.reject();
        $rootScope.$broadcast(authEvents.LOGIN_FAILED);
      }
    }
    return deferred.promise;
  };
  this.logout = function() {
    var deferred = $q.defer();
    userService.logout().then(function(response) {
      changeUser(null);
      deferred.resolve();
      $rootScope.$broadcast(authEvents.LOGOUT_SUCCESS);
    }).catch(function(err) {
      deferred.reject();
      $rootScope.$broadcast(authEvents.LOGOUT_FAILED);
    });
    return deferred.promise;
  };

  var modalOptions = {
    backdrop: true,
    keyboard: true,
    templateUrl: '/app/partials/widgets/login-modal.html',
    controller: function($scope, $modalInstance) {
      $scope.modalScope = {};
      $scope.modalScope.close = function(result) {
        $modalInstance.dismiss('cancel');
      };
      $scope.modalScope.auth = function(provider) {
        $.login(provider).then(function(user) {
          $modalInstance.close($.isAuthenticated());
        }).catch(function(err) {
          $modalInstance.close($.isAuthenticated());
        });
      };
    }
  };
  this.ensureAuth = function() {
    var deferred = $q.defer();
    if(!$.isAuthenticated()) {
      $modal.open(modalOptions).result.then(function(authenticated) {
        if(authenticated === true) {
          deferred.resolve(true);
        } else {
          deferred.reject(false);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  };
}])
.service('modalService', ['$modal', function($modal) {
  var modalOptions = {
    backdrop: true,
    keyboard: true,
    templateUrl: '/partials/widgets/modal.html',
  };
  var modalScope = {
    headerText: 'Do you really want to procede with this action?',
    bodyText: '',
    closeButtonText: 'No',
    actionButtonText: 'Yes',
  };
  this.show = function(customModalOptions, customModalScope) {
    var extendedOptions = {};
    var extendedScope = {};
    angular.extend(extendedOptions, modalOptions, customModalOptions);
    angular.extend(extendedScope, modalScope, customModalScope);
    extendedOptions.controller = function($scope, $modalInstance) {
      $scope.modalScope = extendedScope;
      $scope.modalScope.action = function() {
        $modalInstance.close('action');
      };
      $scope.modalScope.close = function() {
        $modalInstance.dismiss('cancel');
      };
    };
    return $modal.open(extendedOptions).result;
  };
}])
.service('translationService', ['$q', '$translate', function($q, $translate) {
  var errorKeys = {
    'contest.join.videoNotOwnedByUser': 'errors.join_contest_video_not_owned_by_user',
    'contest.join.videoURLNotValid': 'errors.join_contest_video_url_not_valid',
    'contest.join.userAlreadyInContest': 'errors.join_contest_user_already_in_contest',
    'audition.vote.cantVoteYourself': 'errors.audition_vote_cant_vote_yourself',
    'status.401': 'errors.authentication_required',
    'status.500': 'errors.unexpected_error'
  }

  this.translateError = function(err) {
    var deferred = $q.defer();
    var translationKey = errorKeys[err.data.errorKey];
    if(translationKey) {
      deferred.resolve($translate(translationKey));
    } else {
      if(err.status == 400) {
        deferred.resolve(err.errorMessage);
      } else {
        translationKey = errorKeys['status.' + err.status];
        deferred.resolve($translate(translationKey));
      }
    }
    return deferred.promise;
  }
}])
.service('userService', ['$http', function($http) {
  this.loginEndpoint = function(provider) {
    return '/api/auth/' + provider;
  };
  this.logout = function() {
    return $http.get('/api/auth/logout');
  };
  this.getAuthenticatedUser = function() {
    return $http.get('/api/user/authenticated');
  };
  this.sendEmail = function(name, email, subject, message) {
    return $http.post('/api/user/email', {name: name, email: email, subject: subject, message: message});
  };
}])
.service('oembedService', ['$http', function($http) {
  this.getOEmbed = function(url) {
    return $http.get('/oembed', {params: {url: url}});
  };
}])
.service('viewService', ['$http', function($http) {
  this.adminView = function() {
    return $http.get('/view/admin');
  };
  this.indexView = function() {
    return $http.get('/view/index');
  };
  this.addCoverView = function() {
    return $http.get('/view/addCover');
  };
  this.coverView = function(id, slug) {
    return $http.get('/view/cover/' + id + '/' + slug);
  };
  this.coversRankView = function(rank) {
    return $http.get('/view/covers/' + rank);
  };
  this.artistView = function(artist, rank) {
    return $http.get('/view/artist/' + artist, {params: {rank: rank}});
  };
  this.artistsView = function(genre) {
    return $http.get('/view/artists', {params: {genre: genre}});
  };
  this.musicView = function(music, rank) {
    return $http.get('/view/music/' + music, {params: {rank: rank}});
  };
  this.musicGenreView = function(genre, rank) {
    return $http.get('/view/genre/' + genre, {params: {rank: rank}});
  };
  this.musicGenreRankView = function(genre, rank) {
    return $http.get('/view/genre/' + genre + '/' + rank);
  };
  this.searchView = function(query) {
    return $http.get('/view/search', {params: {query: query}});
  };
  this.contestView = function(id, slug) {
    return $http.get('/view/contest/' + id + '/' + slug);
  };
  this.joinContestView = function(id, slug) {
    return $http.get('/view/contest/' + id + '/' + slug + '/join');
  };
  this.auditionView = function(id, slug) {
    return $http.get('/view/audition/' + id + '/' + slug);
  };
  this.userView = function(id) {
    return $http.get('/view/user/' + id);
  };
}])
.service('coverService', ['$http', function($http) {
  this.acceptCover = function(potentialCover) {
    return $http.post('/api/cover/accept', {potentialCover: potentialCover});
  };
  this.refuseCover = function(potentialCover) {
    return $http.post('/api/cover/refuse', {potentialCover: potentialCover});
  };
  this.addCover = function(cover) {
    return $http.post('/api/cover', {cover: cover});
  };
  this.getCover = function(id) {
    return $http.get('/api/cover/' + id);
  };
  this.latestCovers = function(page) {
    return $http.get('/api/cover/latest', {params: {page: page}});
  };
  this.bestCovers = function(page) {
    return $http.get('/api/cover/best', {params: {page: page}});
  };
  this.latestCoversOfMusic = function(music, page) {
    return $http.get('/api/cover/latestOfMusic', {params: {music: music.id, page: page}});
  };
  this.bestCoversOfMusic = function(music, page) {
    return $http.get('/api/cover/bestOfMusic', {params: {music: music.id, page: page}});
  };
  this.latestCoversOfMusicGenre = function(musicGenre, page) {
    return $http.get('/api/cover/latestOfMusicGenre', {params: {musicGenre: musicGenre.id, page: page}});
  };
  this.bestCoversOfMusicGenre = function(musicGenre, page) {
    return $http.get('/api/cover/bestOfMusicGenre', {params: {musicGenre: musicGenre.id, page: page}});
  };
}])
.service('artistService', ['$http', function($http) {
  this.listArtists = function(musicGenre, page) {
    return $http.get('/api/artist', {params: {musicGenre: musicGenre.id, page: page}});
  };
  this.saveArtist = function(artist) {
    return $http.post('/api/artist', {artist: artist});
  };
}])
.service('musicService', ['$http', function($http) {
  this.saveMusic = function(music) {
    return $http.post('/api/music', {music: music});
  };
}])
.service('searchService', ['$http', function($http) {
  this.searchMusicOrArtist = function(query) {
    return $http.get('/api/search/musicOrArtist', {params: {query: query}});
  };
  this.searchArtists = function(query, related) {
    return $http.get('/api/search/artist', {params: {query: query, related: related}});
  };
  this.searchMusics = function(query, artist) {
    return $http.get('/api/search/music', {params: {artist: artist, query: query}});
  };
}])
.service('contestService', ['$http', function($http) {
  this.getAuditionVideoInfos = function(url) {
    return $http.get('/api/contest/audition/videoInfos', {params: {url: url}});
  };
  this.joinContest = function(audition) {
    return $http.post('/api/contest/join', {audition: audition});
  };
  this.voteInAudition = function(audition) {
    return $http.post('/api/contest/audition/vote', {audition_id: audition.id});
  };
  this.removeVoteInAudition = function(audition) {
    return $http.post('/api/contest/audition/removeVote', {audition_id: audition.id});
  };
  this.getAuditionVote = function(audition) {
    return $http.get('/api/contest/audition/vote', {params: {audition_id: audition.id}});
  };
}]);