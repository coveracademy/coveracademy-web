angular
.module('coverAcademy.factories', [])
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
//   var completeProgress = function(result) {
//     if(!isView(result) && working === true) {
//       working = false;
//       var ngProgress = getNGProgress();
//       ngProgress.complete();
//     }
//   };
//   var isView = function(result) {
//     var url = result.url || result.config.url;
//     return url.indexOf('.html') > 0;
//   };
//   return {
//     request: function(request) {
//       if(!isView(request) && working === false) {
//         working = true;
//         var ngProgress = getNGProgress();
//         ngProgress.reset();
//         ngProgress.start();
//       }
//       return request;
//     },
//     requestError: function(request) {
//       completeProgress(request);
//       return request;
//     },
//     response: function(response) {
//       completeProgress(response);
//       return response;
//     },
//     responseError: function(response) {
//       completeProgress(response);
//       return response;
//     }
//   }
// }])