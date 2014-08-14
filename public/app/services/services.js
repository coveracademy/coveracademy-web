angular
.module('coverChallengeApp')
.service('dataService', [function() {
  this.mergeData = function(source, destiny) {
    for (var attr in source) {
      destiny[attr] = source[attr];
    }
  };
}])
.service('alertService', ['$timeout', function($timeout) {
  var alerts = [];
  this.getAlerts = function() {
    return alerts;
  };
  this.addAlert = function(type, message) {
    var that = this;
    var alert = {type: type, msg: message};
    this.getAlerts().push(alert);
    $timeout(function() {
      that.getAlerts().splice(that.getAlerts().indexOf(alert), 1);
    }, 5000);
  };
}])
.service('authenticationService', ['$modal', '$window', function($modal, $window) {
  var $ = this;
  var user = null;
  var userAuthenticated = false;
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
        var authWindow = $window.open('/auth/' + provider + '', '', '');
        $window.authResult = function(result) {
          if('success' === result) {
            userAuthenticated = true;
            $modalInstance.close($.isUserAuthenticated());
          } else if('fail' === result) {
            userAuthenticated = false;
            $modalInstance.close($.isUserAuthenticated());
          }
        }
      };
    }
  };
  this.getUser = function() {
    return user;
  };
  this.isUserAuthenticated = function() {
    return userAuthenticated;
  };
  this.ensureAuth = function() {
    if(!this.isUserAuthenticated()) {
      $modal.open(modalOptions).result.then(function(authenticated) {
        if(authenticated === true) {
          $window.location.reload();
        } else {
          return false;
        }
      });
    } else {
      return true;
    }
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
  this.getAuthenticatedUser = function() {
    return $http.post('/ajax', {key: 'getAuthenticatedUser'});
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
  this.indexView = function() {
    return $http.get('/view/index');
  };
  this.addCoverView = function() {
    return $http.get('/view/addCover');
  };
  this.coverView = function(id) {
    return $http.get('/view/cover/' + id);
  };
  this.coversRankView = function(rank) {
    return $http.get('/view/covers/' + rank);
  };
  this.artistView = function(artist, sort) {
    return $http.get('/view/artist/' + artist, {params: {sort: sort}});
  };
  this.artistsView = function(genre) {
    return $http.get('/view/artists', {params: {genre: genre}});
  };
  this.musicView = function(music, sort) {
    return $http.get('/view/music/' + music, {params: {sort: sort}});
  };
  this.musicGenreView = function(genre, sort) {
    return $http.get('/view/genre/' + genre, {params: {sort: sort}});
  };
  this.musicGenreRankView = function(genre, rank) {
    return $http.get('/view/genre/' + genre + '/' + rank);
  };
  this.searchView = function(query) {
    return $http.get('/view/search', {params: {query: query}});
  };
}])
.service('coverService', ['$http', function($http) {
  this.addCover = function(cover) {
    return $http.post('/api/cover', {cover: cover});
  };
  this.latestCovers = function(period, page, pageSize) {
    return $http.get('/api/cover/latest', {params: {period: period, page: page, pageSize: pageSize}});
  };
  this.bestCovers = function(period, page, pageSize) {
    return $http.get('/api/cover/best', {params: {period: period, page: page, pageSize: pageSize}});
  };
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