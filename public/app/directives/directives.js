angular
.module('coverAcademy.directives', [])
.directive('auditions', function() {
  return {
    templateUrl: 'app/partials/widgets/auditions.html',
    restrict: 'E',
    require: 'ngModel',
    scope: {
      locale: '@',
      auditions: '=ngModel'
    }
  };
})
.directive('coverSongs', function() {
  return {
    templateUrl: 'app/partials/widgets/cover-songs.html',
    restrict: 'E',
    require: 'ngModel',
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
})
.directive('fbLikeBox', ['$sce', function($sce) {
  return {
    template: '<iframe ng-src="{{ fbLikeBoxUrl }}" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width: {{ width }}px; height:{{ height }}px;" allowTransparency="true"></iframe>',
    restrict: 'E',
    scope: {
      link: '@',
      width: '@',
      height: '@',
    },
    link: function(scope, element, attrs, ctrl) {
      scope.fbLikeBoxUrl = $sce.trustAsResourceUrl('//www.facebook.com/plugins/likebox.php?href=' + scope.link + '&amp;width=' + scope.width + '&amp;height=' + scope.height + '&amp;colorscheme=light&amp;show_faces=true&amp;header=false&amp;stream=false&amp;show_border=true&amp;appId=329761620528304');
    }
  }
}]);