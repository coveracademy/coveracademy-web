angular
.module('coverAcademy.controllers')
.controller('contestController', ['$scope', '$stateParams', '$translate', 'authEvents', 'constants', 'backendResponse', 'contestService', 'seoService', function($scope, $stateParams, $translate, authEvents, constants, backendResponse, contestService, seoService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.rankType = $stateParams.rank || 'best';
  $scope.contest = backendResponse.data.contest;
  $scope.audition = backendResponse.data.audition;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.auditions = backendResponse.data.auditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.votesByAudition = backendResponse.data.votesByAudition;
  $scope.scoreByAudition = backendResponse.data.scoreByAudition;
  $scope.winnerAuditions = backendResponse.data.winnerAuditions;
  $scope.prizesCollapsed = true;
  $scope.currentPage = 1;
  $scope.auditionsPerPage = 20;

  $translate('seo.description.contest').then(function(translation) {
    seoService.setDescription(translation);
  });
  seoService.setTitle($scope.contest.name);
  seoService.setImage('/img/contests/' + $scope.contest.image);

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getUserAudition($scope.contest).then(function(response) {
      $scope.audition = response.data;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.audition = null;
  });

  $scope.isContestant = function() {
    return Boolean($scope.audition && angular.isDefined($scope.audition.id))
  };
  $scope.hasAuditions = function() {
    return $scope.auditions.length !== 0;
  };
  $scope.hasWinners = function() {
    return $scope.winnerAuditions.length > 0;
  }
  $scope.isMedal = function(audition, expected) {
    return $scope.getMedal(audition) === expected;
  };
  $scope.getMedal = function(audition) {
    var medal;
    if(audition.place === 1) {
      medal = 'gold';
    } else if(audition.place === 2) {
      medal = 'silver';
    } else {
      medal = 'bronze';
    }
    return medal;
  };
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
  $scope.getScoreByAudition = function(audition) {
    var score = $scope.scoreByAudition[audition.id];
    if(!score) {
      score = 0;
    }
    return score;
  };
}])
.controller('joinContestController', ['$scope', '$state', '$stateParams', '$translate', 'constants', 'authEvents', 'backendResponse', 'seoService', 'authenticationService', 'alertService', 'translationService', 'contestService', function($scope, $state, $stateParams, $translate, constants, authEvents, backendResponse, seoService, authenticationService, alertService, translationService, contestService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.contest = backendResponse.data.contest;
  $scope.audition = {contest_id: $scope.contest.id};
  $scope.userAudition = null;
  $scope.usingGoogleAccount = false;
  $scope.usingYoutubeAccount = false;

  $translate(['seo.title.join_contest', 'seo.description.join_contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.join_contest']);
    seoService.setDescription(translations['seo.description.join_contest']);
  });
  seoService.setImage('/img/contests/' + $scope.contest.image);

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getUserAudition($scope.contest).then(function(response) {
      console.log(response.data)
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
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('warning', translation);
      });
    });
  };
  $scope.joinContest = function() {
    contestService.joinContest($scope.audition).then(function(response) {
      var audition = response.data;
      $state.go('app.audition', {locale: $scope.locale(), id: audition.id, slug: audition.slug});
      $translate('alerts.congratulations_now_you_are_in_the_contest').then(function(translation) {
        alertService.addAlert('info', translation)
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
}])
.controller('auditionController', ['$scope', '$translate', 'authEvents', 'constants', 'backendResponse', 'authenticationService', 'translationService', 'alertService', 'seoService', 'contestService', function($scope, $translate, authEvents, constants, backendResponse, authenticationService, translationService, alertService, seoService, contestService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.contest = backendResponse.data.contest;
  $scope.audition = backendResponse.data.audition;
  $scope.userVote = backendResponse.data.userVote;
  $scope.bestAuditions = backendResponse.data.bestAuditions;
  $scope.latestAuditions = backendResponse.data.latestAuditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.totalUserVotes = backendResponse.data.totalUserVotes;
  $scope.voteLimit = backendResponse.data.voteLimit;
  $scope.votes = backendResponse.data.votes || 0;
  $scope.score = backendResponse.data.score || 0;

  $translate('seo.title.audition', {audition: $scope.audition.title}).then(function(translation) {
    seoService.setTitle(translation);
  });
  seoService.setDescription($scope.audition.description);
  seoService.setImage($scope.audition.medium_thumbnail);

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getUserVote($scope.audition).then(function(response) {
      $scope.userVote = response.data.userVote;
      $scope.totalUserVotes = response.data.totalUserVotes;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.userVote = null;
    $scope.totalUserVotes = 0;
  });

  $scope.isWinner = function() {
    return angular.isDefined($scope.audition.place) && $scope.audition.place !== null;
  };
  $scope.getMedal = function() {
    var medal;
    if($scope.audition.place === 1) {
      medal = 'gold';
    } else if($scope.audition.place === 2) {
      medal = 'silver';
    } else {
      medal = 'bronze';
    }
    return medal;
  };
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
    return Boolean($scope.userVote && angular.isDefined($scope.userVote.id));
  };
  $scope.vote = function(audition) {
    contestService.voteInAudition(audition).then(function(response) {
      $scope.userVote = response.data;
      $scope.totalUserVotes++;
      $scope.votes++;
      $scope.score += $scope.userVote.voting_power;
      $scope.score = Number($scope.score.toFixed(3));
      $translate('alerts.thank_you_for_voting', {user: $scope.audition.user.name}).then(function(translation) {
        alertService.addAlert('success', translation);
      });
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
  $scope.removeVote = function(audition) {
    contestService.removeVoteInAudition(audition).then(function(response) {
      $scope.totalUserVotes--;
      $scope.votes--;
      $scope.score -= response.data.voting_power;
      $scope.score = Number($scope.score.toFixed(3));
      $scope.userVote = null;
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.addAlert('danger', translation);
      });
    });
  };
}])
.controller('guidelineController', ['$translate', 'seoService', function($translate, seoService) {
  $translate(['seo.title.guideline', 'seo.description.guideline']).then(function(translations) {
    seoService.setTitle(translations['seo.title.guideline']);
    seoService.setDescription(translations['seo.description.guideline']);
  });
}]);