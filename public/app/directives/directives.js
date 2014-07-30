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
});