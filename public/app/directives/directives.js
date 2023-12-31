'use strict';

angular
.module('coverAcademy.directives', ['coverAcademy.services'])
.directive('audition', function() {
  return {
    templateUrl: 'app/partials/widgets/audition.html',
    restrict: 'E',
    require: 'ngModel',
    scope: {
      locale: '@',
      showScore: '@',
      thumbSize: '@',
      audition: '=ngModel',
      scoreByAudition: '&',
      auditionClick: '&'
    },
    link: function(scope, element, attrs, ctrl) {
      scope.isShowScore = scope.showScore === 'true' ? true : false;
      scope.fontSize = scope.thumbSize ? scope.thumbSize : 'medium';
    }
  };
})
.directive('adsense', function() {
  return {
    templateUrl: 'app/partials/widgets/adsense.html',
    restrict: 'E',
    replace: true,
    controller: function() {
      (adsbygoogle = window.adsbygoogle || []).push({});
    }
  };
})
.directive('coverSongs', function() {
  return {
    templateUrl: 'app/partials/widgets/cover_songs.html',
    restrict: 'E',
    require: 'ngModel',
    scope: {
      thumbSize: '@',
      locale: '@',
      covers: '=ngModel'
    },
    link: function(scope, element, attrs, ctrl) {
      scope.thumbSizeFinal = scope.thumbSize ? scope.thumbSize : 'medium';
      if(scope.thumbSizeFinal === 'small') {
        scope.coversPerRow = 6;
        scope.columnSize = 12/scope.coversPerRow;
        scope.fontSize = 'small';
      } else if(scope.thumbSizeFinal === 'medium') {
        scope.coversPerRow = 4;
        scope.columnSize = 12/scope.coversPerRow;
        scope.fontSize = 'medium';
      } else if(scope.thumbSizeFinal === 'large') {
        scope.coversPerRow = 3;
        scope.columnSize = 12/scope.coversPerRow;
        scope.fontSize = 'large';
      }
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
      theme: '@',
      border: '@',
      faces: '@'
    },
    link: function(scope, element, attrs, ctrl) {
      scope.colorScheme = scope.theme || 'dark';
      scope.showBorder = scope.border === 'true' ? true : false;
      scope.showFaces = scope.faces === 'true' ? true : false;
      scope.fbLikeBoxUrl = $sce.trustAsResourceUrl('//www.facebook.com/plugins/likebox.php?href=' + scope.link + '&width=' + scope.width + '&height=' + scope.height + '&colorscheme=' + scope.colorScheme + '&show_faces=' + scope.showFaces + '&header=false&stream=false&show_border=' + scope.showBorder + '&appId=329761620528304');
    }
  }
}])
.directive('profilePicture', ['userService', function(userService) {
  return {
    restrict: 'A',
    scope: {
      user: '=profilePicture',
      network: '@'
    },
    link: function(scope, element, attrs, ctrl) {
      var url = userService.getProfilePicture(scope.user, scope.network);
      if(url) {
        element.css({
          'background-image': 'url(' + url +')'
        });
      }
    }
  }
}])
.directive('profilePictureSrc', ['userService', function(userService) {
  return {
    restrict: 'A',
    scope: {
      user: '=profilePictureSrc',
      network: '@'
    },
    link: function(scope, element, attrs, ctrl) {
      var url = userService.getProfilePicture(scope.user, scope.network);
      if(url) {
        element.attr({
          'src': url
        });
      }
    }
  }
}])
.directive('contestTimer', [function() {
  return {
    templateUrl: 'app/partials/widgets/contest_timer.html',
    restrict: 'E',
    require: 'ngModel',
    scope: {
      contest: '=ngModel',
      fontSize: '@'
    }
  }
}]);