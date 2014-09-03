angular
.module('coverChallengeApp.directives', [])
.directive('coverSongs', function() {
  return {
    templateUrl: 'app/partials/widgets/cover-songs.html',
    restrict: 'E',
    require: 'ngModel',
    transclude: true,
    scope: {
      thumbSize: '@',
      locale: '@',
      covers: '=ngModel'
    },
    controller: ['$scope', function($scope) {
      $scope.thumbSizeFinal = $scope.thumbSize ? $scope.thumbSize : 'normal';
      if($scope.thumbSizeFinal === 'normal') {
        $scope.coversPerRow = 4;
        $scope.columnSize = 12/$scope.coversPerRow;
      } else if($scope.thumbSizeFinal === 'small') {
        $scope.coversPerRow = 6;
        $scope.columnSize = 12/$scope.coversPerRow;
        $scope.fontSizeCss = 'font-small';
      }
      $scope.isThumbSize = function(size) {
        return $scope.thumbSizeFinal === size;
      };
    }],
    link: function(scope, element, attrs, ctrl) {

    }
  };
})
.directive('cover', function() {
  return {
    templateUrl: 'app/partials/widgets/cover.html',
    restrict: 'E',
    transclude: true,
    scope: {
      link: '@',
      legend: '@',
      image: '@',
      height: '@',
      border: '&'
    },
    link: function(scope, element, attrs, ctrl) {
      if(!angular.isDefined(scope.border())) {
        scope.border = true;
      } else {
        scope.border = scope.border();
      }
    }
  };
});