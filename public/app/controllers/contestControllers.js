angular
.module('coverAcademy.controllers')
.controller('contestController', ['$scope', '$stateParams', 'constants', 'backendResponse', 'seoService', function($scope, $stateParams, constants, backendResponse, seoService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.rankType = $stateParams.rank || 'best';
  $scope.contest = backendResponse.data.contest;
  $scope.audition = backendResponse.data.audition;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.auditions = backendResponse.data.auditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.votesByAudition = backendResponse.data.votesByAudition;
  $scope.currentPage = 1;
  $scope.auditionsPerPage = 20;

  $scope.isContestant = function() {
    return Boolean($scope.audition && angular.isDefined($scope.audition.id))
  };
  $scope.hasAuditions = function() {
    return $scope.auditions.length !== 0;
  }
  $scope.isContestProgress = function(expectedProgress) {
    return $scope.contest.progress === expectedProgress;
  };
  $scope.remainingOneDay = function() {
    if($scope.isContestProgress('running')) {
      var now = new Date();
      var end = new Date($scope.contest.end_date);
      return end.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
    } else {
      return false;
    }
  };
  $scope.contestantsRemaining = function() {
    if($scope.isContestProgress('waiting')) {
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
    var promise = $scope.rankType === 'best' ? contestService.bestAuditions : contestService.latestAuditions;
    promise($scope.contest, $scope.currentPage).then(function(response) {
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
.controller('joinContestController', ['$scope', '$state', '$stateParams', '$translate', 'authEvents', 'backendResponse', 'seoService', 'authenticationService', 'alertService', 'translationService', 'contestService', function($scope, $state, $stateParams, $translate, authEvents, backendResponse, seoService, authenticationService, alertService, translationService, contestService) {
  $scope.contest = backendResponse.data.contest;
  $scope.audition = {contest_id: $scope.contest.id};
  $scope.userAudition = null;
  $scope.usingGoogleAccount = false;
  $scope.usingYoutubeAccount = false;

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getUserAudition($scope.contest).then(function(response) {
      $scope.userAudition = response.data;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.userAudition = null;
    $scope.usingGoogleAccount = false;
    $scope.usingYoutubeAccount = false;
  });

  $scope.isContestant = function() {
    return Boolean($scope.userAudition && angular.isDefined($scope.userAudition.id))
  };
  $scope.isContestProgress = function(expectedProgress) {
    return $scope.contest.progress === expectedProgress;
  };
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
.controller('auditionController', ['$scope', '$translate', 'authEvents', 'constants', 'backendResponse', 'authenticationService', 'translationService', 'alertService', 'seoService', 'contestService', function($scope, $translate, authEvents, constants, backendResponse, authenticationService, translationService, alertService, seoService, contestService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.contest = backendResponse.data.contest;
  $scope.audition = backendResponse.data.audition;
  $scope.auditionVote = backendResponse.data.auditionVote;
  $scope.bestAuditions = backendResponse.data.bestAuditions;
  $scope.latestAuditions = backendResponse.data.latestAuditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.votes = backendResponse.data.votes || 0;
  $scope.score = backendResponse.data.score || 0;

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getAuditionVote($scope.audition).then(function(response) {
      $scope.auditionVote = response.data;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.auditionVote = null;
  });

  $scope.isContestProgress = function(expectedProgress) {
    return $scope.contest.progress === expectedProgress;
  };
  $scope.contestantsRemaining = function() {
    if($scope.isContestProgress('waiting')) {
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
  $scope.voted = function() {
    return Boolean($scope.auditionVote && angular.isDefined($scope.auditionVote.id));
  };
  $scope.vote = function(audition) {
    contestService.voteInAudition(audition).then(function(response) {
      $scope.auditionVote = response.data;
      $scope.votes++;
      $scope.score += $scope.auditionVote.voting_power;
      $scope.score = Number($scope.score.toFixed(1));
      $translate('alerts.thank_you_for_voting', {user: $scope.audition.user.name}).then(function(message) {
        alertService.addAlert('success', message);
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
  $scope.removeVote = function(audition) {
    contestService.removeVoteInAudition(audition).then(function(response) {
      $scope.votes--;
      $scope.score -= response.data.voting_power;
      $scope.score = Number($scope.score.toFixed(1));
      $scope.auditionVote = null;
    }).catch(function(err) {
      translationService.translateError(err).then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
}]);