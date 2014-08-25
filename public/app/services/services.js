angular
.module('coverChallengeApp')
.service('seoService', [function() {
  var title = '';
  var description = '';
  var keywords = '';
  var image = '';

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
    title = '';
    description = '';
    keywords = '';
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
    var win = $window.open(userService.loginEndpoint(provider), "SignIn", "width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=" + left + ",top=" + top);
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
    size: 'lg',
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
    templateUrl: '/partials/modal.html',
  };
  var modalScope = {
    headerText: 'Deseja realmente proceder ?',
    bodyText: '',
    closeButtonText: 'Cancelar',
    actionButtonText: 'Continuar',
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
    return $http.post('/ajax', {key: 'sendEmail', params: [name, email, subject, message]});
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
}])
.service('searchService', ['$http', function($http) {
  this.searchMusicOrArtist = function(query) {
    return $http.get('/api/search/musicOrArtist', {params: {query: query}});
  };
  this.searchArtists = function(query) {
    return $http.get('/api/search/artist', {params: {query: query}});
  };
  this.searchMusics = function(artist, query) {
    return $http.get('/api/search/music', {params: {artist: artist, query: query}});
  };
}]);