angular
.module('coverAcademy.controllers')
.controller('contestController', ['$scope', '$stateParams', 'constants', 'backendResponse', 'seoService', function($scope, $stateParams, constants, backendResponse, seoService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.rankType = $stateParams.rank || 'best';
  $scope.contest = backendResponse.data.contest;
  $scope.isContestant = backendResponse.data.isContestant;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.auditions = backendResponse.data.auditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.votesByAudition = backendResponse.data.votesByAudition;

  $scope.currentPage = 1;
  $scope.coversPerPage = 40;

  $scope.isContestStatus = function(expectedStatus) {
    return $scope.contest.status === expectedStatus;
  };
  $scope.remainingOneDay = function() {
    if($scope.isContestStatus('running')) {
      var now = new Date();
      var end = new Date($scope.contest.end_date);
      return now.getTime() - end.getTime() < 24 * 60 * 60 * 1000;
    } else {
      return false;
    }
  };
  $scope.contestantsRemaining = function() {
    if($scope.isContestStatus('waiting')) {
      var totalAuditions = parseInt($scope.totalAuditions);
      var minimumContestants = parseInt($scope.contest.minimum_contestants);
      if(totalAuditions < minimumContestants) {
        return minimumContestants - totalAuditions;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  };
  $scope.pageChanged = function() {
    contestService.bestAuditions($scope.contest, $scope.currentPage).then(function(response) {
      $scope.auditions = response.data;
    });
  };
  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
  $scope.getVotesByAudition = function(audition) {
    var votes = $scope.votesByAudition[audition.id];
    if(!votes) {
      votes = 0;
    }
    return votes;
  };
}])
.controller('joinContestController', ['$scope', '$state', '$stateParams', '$translate', 'backendResponse', 'seoService', 'authenticationService', 'alertService', 'translationService', 'contestService', function($scope, $state, $stateParams, $translate, backendResponse, seoService, authenticationService, alertService, translationService, contestService) {
  $scope.contest = backendResponse.data.contest;
  $scope.audition = {contest_id: $scope.contest.id};
  $scope.usingGoogleAccount = false;
  $scope.usingYoutubeAccount = false;

  $scope.signinWithGoogle = function() {
    authenticationService.login('google').then(function(user) {
      $scope.usingGoogleAccount = true;
      if(user.youtube_account) {
        $scope.usingYoutubeAccount = true;
      }
    });
  };
  $scope.signinWithYoutube = function() {
    authenticationService.login('youtube').then(function(user) {
      $scope.usingYoutubeAccount = true;
    });
  };
  $scope.videoUrlPasted = function(event) {
    var url = event.clipboardData.getData("text/plain");
    contestService.getAuditionVideoInfos(url).then(function(response) {
      $scope.audition.url = url;
      $scope.audition.title = response.data.title;
      $scope.audition.description = response.data.description;
    }).catch(function(err) {
      translationService.translateError(err).then(function(message) {
        alertService.addAlert('warning', message);
      });
    });
  };
  $scope.joinContest = function() {
    contestService.joinContest($scope.audition).then(function(response) {
      var audition = response.data;
      $state.go('app.audition', {locale: $scope.locale(), id: audition.id, slug: audition.slug});
      $translate('alerts.congratulations_now_you_are_in_the_contest').then(function(message) {
        alertService.addAlert('info', message)
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
}])
.controller('auditionController', ['$scope', 'authEvents', 'constants', 'backendResponse', 'authenticationService', 'translationService', 'alertService', 'seoService', 'contestService', function($scope, authEvents, constants, backendResponse, authenticationService, translationService, alertService, seoService, contestService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.contest = backendResponse.data.contest;
  $scope.audition = backendResponse.data.audition;
  $scope.auditionVote = backendResponse.data.auditionVote;
  $scope.bestAuditions = backendResponse.data.bestAuditions;
  $scope.latestAuditions = backendResponse.data.latestAuditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.votes = backendResponse.data.votes || 0;

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getAuditionVote($scope.audition).then(function(response) {
      $scope.auditionVote = response.data;
    });
  });
  $scope.isContestStatus = function(expectedStatus) {
    return $scope.contest.status === expectedStatus;
  };
  $scope.contestantsRemaining = function() {
    if($scope.isContestStatus('waiting')) {
      var totalAuditions = parseInt($scope.totalAuditions);
      var minimumContestants = parseInt($scope.contest.minimum_contestants);
      if(totalAuditions < minimumContestants) {
        return minimumContestants - totalAuditions;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  };
  $scope.canVote = function() {
    return !authenticationService.getUser() || (authenticationService.getUser().id !== $scope.audition.user.id);
  };
  $scope.vote = function(audition) {
    contestService.voteInAudition(audition).then(function(response) {
      $scope.auditionVote = response.data;
      $scope.votes++;
    }).catch(function(err) {
      translationService.translateError(err).then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
  $scope.removeVote = function(audition) {
    contestService.removeVoteInAudition(audition).then(function(response) {
      $scope.auditionVote = null;
      $scope.votes--;
    }).catch(function(err) {
      translationService.translateError(err).then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
}]);