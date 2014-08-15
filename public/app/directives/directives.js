angular
.module('coverChallengeApp')
.directive('coverSongs', function() {
  return {
    restrict: 'E',
    require: 'ngModel',
    transclude: true,
    scope: {
      thumbSize: '@',
      covers: '=ngModel'
    },
    templateUrl: 'app/partials/widgets/cover-songs.html',
    link: function(scope, element, attrs, ctrl) {
      if(!scope.thumbSize) {
        scope.thumbSize = 'normal';
      }
      if(scope.thumbSize === 'normal') {
        scope.coversPerRow = 4;
        scope.columnSize = 12/scope.coversPerRow;
      } else if(scope.thumbSize === 'small') {
        scope.coversPerRow = 6;
        scope.columnSize = 12/scope.coversPerRow;
        scope.fontSizeCss = 'font-small';
      }
    }
  };
})
.directive('cover', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      link: '@',
      legend: '@',
      image: '@',
      height: '@'
    },
    templateUrl: 'app/partials/widgets/cover.html'
  };
});