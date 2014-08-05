angular
.module('coverChallengeApp')
.directive('nullIfEmpty', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      ctrl.$parsers.push(function(value) {
        return angular.isUndefined(value) || value === '' ? null : value;
      });
    }
  };
})
.directive('coverList', function() {
  return {
    restrict: 'E',
    require: 'ngModel',
    transclude: true,
    scope: {
      thumbSize: '@thumbSize',
      covers: '=ngModel'
    },
    templateUrl: 'app/partials/widgets/cover-list.html',
    link: function(scope, element, attrs, crtl) {
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
});