angular
.module('coverChallengeApp.factories', [])
.factory('authHttpInterceptor', ['$rootScope', '$q', 'authEvents', function($rootScope, $q, authEvents) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        0: authEvents.HTTP_CONNECTION_REFUSED,
        401: authEvents.HTTP_NOT_AUTHENTICATED,
        403: authEvents.NOT_AUTHORIZED,
        419: authEvents.SESSION_TIMEOUT,
        440: authEvents.SESSION_TIMEOUT
      }[response.status], response);
      return $q.reject(response);
    }
  };
}]);
// .factory('ngProgressHttpInterceptor', ['$injector', function($injector) {
//   var ngProgress = null;
//   var working = false;
//   var getNGProgress = function() {
//     if(!ngProgress) {
//       ngProgress = $injector.get('ngProgress');
//       ngProgress.height('3px');
//     }
//     return ngProgress;
//   };
//   var completeProgress = function() {
//     if (working === true) {
//       var ngProgress = getNGProgress();
//       ngProgress.complete();
//       working = false;
//     }
//   };
//   var isView = function(request) {
//     return request.url.indexOf('.html') > 0;
//   };
//   return {
//     request: function(request) {
//       if (!isView(request) && working === false) {
//         var ngProgress = getNGProgress();
//         ngProgress.start();
//         working = true;
//       }
//       return request;
//     },
//     requestError: function(request) {
//       completeProgress();
//       return request;
//     },
//     response: function(response) {
//       completeProgress();
//       return response;
//     },
//     responseError: function(response) {
//       completeProgress();
//       return response;
//     }
//   }
// }])