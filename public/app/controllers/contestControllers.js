angular
.module('coverAcademy.controllers')
.controller('indexController', ['$scope', '$state', '$filter', '$translate', '$underscore', 'backendResponse', 'seoService', function($scope, $state, $filter, $translate, $underscore, backendResponse, seoService) {
  $scope.contests = backendResponse.data.contests;
  $scope.sponsors = backendResponse.data.sponsors;
  $translate(['seo.title.index', 'seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.index']);
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });

  $scope.hasSponsors = function() {
    return $scope.sponsors.length !== 0;
  };
  $scope.hasUnfinishedContests = function() {
    return $scope.contests.length > 0;
  };
  $scope.getLatestUnfinishedContest = function() {
    if($scope.hasUnfinishedContests()) {
      return $scope.contests[0];
    } else {
      return null;
    }
  };
}])
.controller('contestsController', ['$scope', '$stateParams', '$translate', 'authEvents', 'constants', 'backendResponse', 'seoService', function($scope, $stateParams, $translate, authEvents, constants, backendResponse, seoService) {
  $scope.contests = backendResponse.data.contests;
  $scope.totalVotes = backendResponse.data.totalVotes;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.winnerAuditions = backendResponse.data.winnerAuditions;
  $translate(['seo.title.contests', 'seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.contests']);
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });

  $scope.getTotalVotes = function(contest) {
    return $scope.totalVotes[contest.id] ? $scope.totalVotes[contest.id] : 0;
  };
  $scope.getTotalAuditions = function(contest) {
    return $scope.totalAuditions[contest.id] ? $scope.totalAuditions[contest.id] : 0;
  };
  $scope.hasWinnerAuditions = function(contest) {
    return $scope.winnerAuditions[contest.id] && $scope.winnerAuditions[contest.id].length > 0;
  };
  $scope.getWinnerAuditions = function(contest) {
    return $scope.winnerAuditions[contest.id]
  };
  $scope.isContestFinished = function(contest) {
    return contest.progress === 'finished';
  };
}])
.controller('contestsAdminController', ['$scope', '$translate', '$filter', '$underscore', 'backendResponse', 'contestService', 'alertService', 'modalService', 'seoService', function($scope, $translate, $filter, $underscore, backendResponse, contestService, alertService, modalService, seoService) {
  $scope.contests = backendResponse.data.contests;
  $scope.auditionsToReview = backendResponse.data.auditionsToReview;
  $translate('seo.title.admin').then(function(translation) {
    seoService.setTitle(translation);
  });

  var disapproveModalOptions = {
    templateUrl: '/app/partials/widgets/disapprove-audition-modal.html',
    controller: function($scope, $modalInstance) {
      $scope.disapprove = function() {
        $modalInstance.close($scope.reason);
      };
      $scope.cancel = function() {
        $modalInstance.dismiss();
      };
    }
  };

  $scope.partitionAuditionsToReview = function() {
    return $filter('partition')($scope.auditionsToReview, 2);
  };
  $scope.approveAudition = function(audition) {
    contestService.approveAudition(audition).then(function(response) {
      alertService.alert('success', 'Audition approved');
      $scope.auditionsToReview = $underscore.reject($scope.auditionsToReview, function(auditionToReview) {
        return audition.id == auditionToReview.id;
      });
    }).catch(function(err) {
      alertService.alert('danger', 'Error approving audition');
    });
  };
  $scope.disapproveAudition = function(audition) {
    modalService.show(disapproveModalOptions).then(function(reason) {
      if(!reason || reason.trim().length === 0) {
        alertService.alert('danger', 'You must tell the reason');
      } else {
        contestService.disapproveAudition(audition, reason).then(function(response) {
          alertService.alert('success', 'Audition disapproved');
          $scope.auditionsToReview = $underscore.reject($scope.auditionsToReview, function(auditionToReview) {
            return audition.id == auditionToReview.id;
          });
        }).catch(function(err) {
          alertService.alert('danger', 'Error disapproving audition');
        });
      }
    });
  };
}])
.controller('contestController', ['$scope', '$stateParams', '$translate', '$underscore', 'authEvents', 'constants', 'backendResponse', 'contestService', 'seoService', function($scope, $stateParams, $translate, $underscore, authEvents, constants, backendResponse, contestService, seoService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.rankType = $stateParams.rank || 'best';
  $scope.contest = backendResponse.data.contest;
  $scope.audition = backendResponse.data.audition;
  $scope.auditions = backendResponse.data.auditions;
  $scope.userVotes = backendResponse.data.userVotes;
  $scope.voteLimit = backendResponse.data.voteLimit;
  $scope.totalUserVotes = backendResponse.data.totalUserVotes;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.votesByAudition = backendResponse.data.votesByAudition;
  $scope.scoreByAudition = backendResponse.data.scoreByAudition;
  $scope.winnerAuditions = backendResponse.data.winnerAuditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;

  $scope.prizesCollapsed = true;
  $scope.currentPage = 1;
  $scope.auditionsPerPage = 35;
  $scope.prizeDetailsToShow = {};

  $translate(['seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
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
  $scope.isAuditionApproved = function() {
    return $scope.isContestant() && $scope.audition.approved === 1;
  };
  $scope.isContestant = function() {
    return Boolean($scope.audition && $scope.audition.id);
  };
  $scope.isContestDraw = function() {
    return $scope.contest.draw === 1;
  };
  $scope.isUrl = function(value) {
    return $underscore.isUrl(value);
  };
  $scope.hasAuditions = function() {
    return $scope.auditions.length !== 0;
  };
  $scope.hasSponsors = function() {
    return $scope.contest.sponsorsInContest.length !== 0;
  };
  $scope.isPrizePlace = function(prize, place) {
    return prize.place === place;
  };
  $scope.hasPrizeDetails = function(prize) {
    return prize.full_name || prize.description || prize.link;
  };
  $scope.showPrizeDetails = function(prize) {
    if(!$scope.prizeDetailsToShow[prize.id]) {
      $scope.prizeDetailsToShow[prize.id] = true;
    } else {
      delete $scope.prizeDetailsToShow[prize.id];
    }
  };
  $scope.isShowPrizeDetails = function(prize) {
    return $scope.prizeDetailsToShow && $scope.prizeDetailsToShow[prize.id];
  };
  $scope.hasWinners = function() {
    return $scope.winnerAuditions.length > 0;
  };
  $scope.hasUserVotes = function() {
    return $scope.userVotes && $scope.userVotes.length > 0;
  };
  $scope.hasRemainingVotes = function() {
    return $scope.remainingVotes() > 0
  };
  $scope.remainingVotes = function() {
    return $scope.voteLimit - $scope.totalUserVotes;
  };
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
    var progress;
    if($scope.contest.progress === 'waiting' && $scope.contest.start_date && new Date() < new Date($scope.contest.start_date)) {
      progress = 'waiting_time';
    } else {
      progress = $scope.contest.progress;
    }
    return progress === expectedProgress;
  };
  $scope.remainingOneDay = function(date) {
    var now = new Date();
    var end = new Date(date);
    return end.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
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
  $scope.changePage = function(page) {
    $scope.currentPage = page;
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
  $scope.userAudition = backendResponse.data.audition;
  $scope.usingYoutubeAccount = false;

  $translate(['seo.title.join_contest', 'seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.join_contest']);
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });
  seoService.setImage('/img/contests/' + $scope.contest.image);

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getUserAudition($scope.contest).then(function(response) {
      $scope.userAudition = response.data;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.userAudition = null;
    $scope.usingYoutubeAccount = false;
  });
  $scope.isContestant = function() {
    return Boolean($scope.userAudition && $scope.userAudition.id);
  };
  $scope.isContestProgress = function(expectedProgress) {
    var progress;
    if($scope.contest.progress === 'waiting' && $scope.contest.start_date && new Date() < new Date($scope.contest.start_date)) {
      progress = 'waiting_time';
    } else {
      progress = $scope.contest.progress;
    }
    return progress === expectedProgress;
  };
  $scope.remainingOneDay = function(date) {
    var now = new Date();
    var end = new Date(date);
    return end.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
  };
  $scope.videoUrlPasted = function(event) {
    var url = event.clipboardData.getData("text/plain");
    contestService.getAuditionVideoInfos(url).then(function(response) {
      $scope.audition.url = url;
      $scope.audition.title = response.data.title;
      $scope.audition.description = response.data.description;
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('warning', translation);
      });
    });
  };
  $scope.joinContest = function() {
    contestService.submitAudition($scope.audition, $scope.contest).then(function(response) {
      var audition = response.data;
      $state.go('app.audition', {locale: $scope.locale(), id: audition.id, slug: audition.slug});
      $translate('alerts.congratulations_now_you_are_in_the_contest').then(function(translation) {
        alertService.alert('info', translation)
      });
    }).catch(function(err) {
      translationService.translateError(err, {user: $scope.user()}).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
}])
.controller('auditionController', ['$scope', '$translate', '$timeout', 'authEvents', 'constants', 'backendResponse', 'authenticationService', 'translationService', 'alertService', 'modalService', 'seoService', 'contestService', function($scope, $translate, $timeout, authEvents, constants, backendResponse, authenticationService, translationService, alertService, modalService, seoService, contestService) {
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

  seoService.setTitle($scope.audition.title + ' - ' + $scope.audition.user.name);
  seoService.setDescription($scope.audition.description);
  seoService.setImage($scope.audition.large_thumbnail);

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

  $scope.remainingVotes = function() {
    return $scope.voteLimit - $scope.totalUserVotes;
  };
  $scope.hasRemainingVotes = function() {
    return $scope.remainingVotes() > 0
  };
  $scope.isAuditionApproved = function() {
    return $scope.audition.approved === 1;
  };
  $scope.hasAuditions = function(auditions) {
    return auditions && auditions.length > 0;
  };
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
    var progress;
    if($scope.contest.progress === 'waiting' && $scope.contest.start_date && new Date() < new Date($scope.contest.start_date)) {
      progress = 'waiting_time';
    } else {
      progress = $scope.contest.progress;
    }
    return progress === expectedProgress;
  };
  $scope.remainingOneDay = function(date) {
    var now = new Date();
    var end = new Date(date);
    return end.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
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

  var incentiveVoteModalOptions = {
    size: 'lg',
    templateUrl: '/app/partials/widgets/incentive-vote-modal.html',
    resolve: {
      remainingVotes: function() {
        return $scope.remainingVotes();
      },
      randomAuditions: function() {
        return contestService.randomAuditions($scope.contest, 6).then(function(response) {
          return response.data;
        });
      },
      locale: function() {
        return $scope.locale();
      }
    },
    controller: function($scope, $modalInstance, remainingVotes, randomAuditions, locale) {
      $scope.remainingVotes = remainingVotes;
      $scope.randomAuditions = randomAuditions;
      $scope.locale = locale;
      $scope.close = function() {
        $modalInstance.dismiss();
      };
    }
  };

  $scope.vote = function(audition) {
    contestService.voteInAudition(audition).then(function(response) {
      $scope.userVote = response.data;
      $scope.totalUserVotes++;
      $scope.votes++;
      $scope.score += $scope.userVote.voting_power;
      $scope.score = Number($scope.score.toFixed(3));
      $translate('alerts.thank_you_for_voting', {user: $scope.audition.user.name}).then(function(translation) {
        alertService.alert('success', translation);
      });
      if($scope.remainingVotes() > 2) {
        $timeout(function() {
          modalService.show(incentiveVoteModalOptions);
        }, 2000);
      }
    }).catch(function(err) {
      translationService.translateError(err, {user: $scope.user()}).then(function(translation) {
        alertService.alert('danger', translation);
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
        alertService.alert('danger', translation);
      });
    });
  };
}])
.controller('guidelineController', ['$translate', 'seoService', function($translate, seoService) {
  $translate(['seo.title.guideline', 'seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.guideline']);
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });
}]);