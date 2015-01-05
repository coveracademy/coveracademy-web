angular
.module('coverAcademy.factories', [])
.factory('$underscore', ['$window', function($window) {
    return $window._;
}])
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