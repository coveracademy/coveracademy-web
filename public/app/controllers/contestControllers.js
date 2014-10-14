angular
.module('coverAcademy.controllers')
.controller('contestController', ['$scope', '$stateParams', 'backendResponse', 'seoService', function($scope, $stateParams, backendResponse, seoService) {
  $scope.rankType = $stateParams.rank || 'best';
  $scope.contest = backendResponse.data.contest;
  $scope.auditions = backendResponse.data.auditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.votesByAudition = backendResponse.data.votesByAudition;

  $scope.currentPage = 1;
  $scope.coversPerPage = 40;

  $scope.pageChanged = function() {
    contestService.bestAuditions($scope.contest, $scope.currentPage).then(function(response) {
      $scope.auditions = response.data;
    });
  };
  $scope.isRanked = function(type) {
    return $scope.rankType === type;
  };
  $scope.remainingOneDay = function(days) {
    console.log(days)
    return parseInt(days) === 0;
  };
  $scope.getVotesByAudition = function(audition) {
    console.log($scope.votesByAudition)
    console.log(audition)
    var votes = $scope.votesByAudition[audition.id];
    if(!votes) {
      votes = 0;
    }
    return votes;
  };
  $scope.contestIsGoing = function() {
    var startDate = new Date($scope.contest.start_date);
    var endDate = new Date($scope.contest.end_date);
    var now = new Date();
    return $scope.contest.start_date && now > startDate && now < endDate;
  };
  $scope.contestantsRemaining = function() {
    return 10;
  }
}])
.controller('joinContestController', ['$scope', '$state', '$stateParams', 'backendResponse', 'seoService', 'authenticationService', 'alertService', 'translationService', 'contestService', function($scope, $state, $stateParams, backendResponse, seoService, authenticationService, alertService, translationService, contestService) {
  $scope.contest = backendResponse.data.contest;
  $scope.audition = {contest_id: $scope.contest.id};
  $scope.usingGoogleAccount = false;
  $scope.usingYoutubeAccount = false;
  $scope.youtubeRegex = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;

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
      $scope.audition.video_title = response.data.title;
      $scope.audition.video_description = response.data.description;
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
    }).catch(function(err) {
      translationService.translateError(err).then(function(message) {
        alertService.addAlert('danger', message);
      });
    });
  };
}])
.controller('auditionController', ['$scope', 'authEvents', 'backendResponse', 'authenticationService', 'seoService', 'contestService', function($scope, authEvents, backendResponse, authenticationService, seoService, contestService) {
  $scope.contest = backendResponse.data.contest;
  $scope.audition = backendResponse.data.audition;
  $scope.auditionVote = backendResponse.data.auditionVote;
  $scope.votes = backendResponse.data.votes || 0;

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getAuditionVote($scope.audition).then(function(response) {
      $scope.auditionVote = response.data;
    });
  });
  $scope.canVote = function() {
    return !authenticationService.getUser() || (authenticationService.getUser().id === $scope.audition.user.id);
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