angular
.module('coverChallengeApp')
.controller('headerController', ['$scope', '$state', 'coverService', function($scope, $state, coverService) {
  $scope.searchMusicOrArtist = function(query) {
    return coverService.searchMusicOrArtist(query).then(function(response) {
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
      $state.go('music', {music : item.slug});
    } else {
      $state.go('artist', {artist : item.slug});
    }
  };
  $scope.submitSearch = function() {
    $state.go('search', {q: $scope.searchQuery});
  };
}])
.controller('alertController', ['$scope', 'alertService', function($scope, alertService) {
  $scope.alerts = alertService.getAlerts();
  $scope.closeAlert = alertService.closeAlert;
}])
.controller('contactController', ['$scope', 'alertService', 'userService', function($scope, alertService, userService) {
  $scope.sendEmail = function() {
    NProgress.start();
    userService.sendEmail($scope.name, $scope.email, $scope.subject, $scope.message).then(function(response) {
      alertService.addAlert('success', 'E-mail enviado com sucesso, aguarde o nosso contato.');
      $scope.name = '';
      $scope.email = '';
      $scope.subject = '';
      $scope.message = '';
      $scope.contactForm.$setPristine();
    }).catch(function(response) {
      alertService.addAlert('danger', 'Erro ao enviar e-mail, por favor tente novamente mais tarde.');
    }).finally(function() {
      NProgress.done();
    });
  };
}]);
