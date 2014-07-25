angular
.module('coverChallengeApp')
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
}])
.controller('headerController', ['$scope', '$window', 'authenticationService', function($scope, $window, authenticationService) {
  $scope.user = authenticationService.getUser();
  $scope.isSectionActive = function(section) {
    return true === $scope[section];
  };
}]);
