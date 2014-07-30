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
    templateUrl: '/partials/login-modal.html',
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
.service('coverService', ['$http', function($http) {
  this.allMusicalGenres = function() {
    return $http.get('/musicalGenre');
  };
  this.searchMusicArtists = function(query) {
    return $http.get('/musicArtist', {params: {query: query}});
  };
  this.searchMusicTitles = function(music_artist_id, query) {
    return $http.get('/musicTitle', {params: {music_artist_id: music_artist_id, query: query}});
  };
  this.getCover = function(id, related) {
    return $http.get('/cover/' + id, {params: {related: ['musicArtist', 'musicTitle', 'musicalGenres']}});
  };
  this.addCover = function(cover) {
    return $http.post('/cover', {cover: cover});
  };
  this.lastCovers = function(page, pageSize) {
    return $http.get('/cover/last', {params: {related: ['musicArtist', 'musicTitle', 'musicalGenres'], page: page, pageSize: pageSize}});
  };
  this.bestCoversWeek = function(page, pageSize) {
    return $http.get('/cover/bestWeek', {params: {related: ['musicArtist', 'musicTitle', 'musicalGenres'], page: page, pageSize: pageSize}});
  };
  this.topCover = function(page, pageSize) {
    return $http.get('/cover/top', {params: {related: ['musicArtist', 'musicTitle', 'musicalGenres']}});
  };
}]);