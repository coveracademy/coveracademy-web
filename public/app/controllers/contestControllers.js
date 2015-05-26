'use strict';

angular
.module('coverAcademy.controllers')
.controller('homeController', ['$scope', '$translate', 'backendResponse', 'modalService', 'seoService', function($scope, $translate, backendResponse, modalService, seoService) {
  $scope.runningContests = backendResponse.data.runningContests;
  $scope.waitingContests = backendResponse.data.waitingContests;
  $scope.latestRunningContestsAuditions = backendResponse.data.latestRunningContestsAuditions;
  $scope.latestWaitingContestsAuditions = backendResponse.data.latestWaitingContestsAuditions;
  $scope.totalRunningContestsAuditions = backendResponse.data.totalRunningContestsAuditions;
  $scope.totalWaitingContestsAuditions = backendResponse.data.totalWaitingContestsAuditions;
  $scope.bestCovers = backendResponse.data.bestCovers;
  $scope.latestCovers = backendResponse.data.latestCovers;
  $scope.latestContest = backendResponse.data.latestWinnerAuditions.contest;
  $scope.latestWinnerAuditions = backendResponse.data.latestWinnerAuditions.auditions;
  $scope.sponsors = backendResponse.data.sponsors;
  $translate(['seo.title.index', 'seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.index']);
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });

  var videoModalOptions = {
    size: 'lg',
    templateUrl: '/app/partials/widgets/video-modal.html',
    resolve: {
      url: function() {
        return 'https://www.youtube.com/embed/UyHqY7i_BEQ?autoplay=1';
      }
    },
    controller: function($scope, $modalInstance, url) {
      $scope.url = url;
    }
  };
  $scope.latestRunningAuditions = function(contest) {
    return $scope.latestRunningContestsAuditions[contest.id];
  };
  $scope.latestWaitingAuditions = function(contest) {
    return $scope.latestWaitingContestsAuditions[contest.id];
  };
  $scope.totalRunningAuditions = function(contest) {
    return $scope.totalRunningContestsAuditions[contest.id];
  };
  $scope.totalWaitingAuditions = function(contest) {
    return $scope.totalWaitingContestsAuditions[contest.id];
  };
  $scope.contestantsRemaining = function(contest) {
    var totalAuditions = $scope.totalWaitingAuditions(contest);
    var minimumContestants = contest.minimum_contestants;
    if(totalAuditions < minimumContestants) {
      return minimumContestants - totalAuditions;
    } else {
      return 0;
    }
  };
  $scope.openVideo = function() {
    modalService.show(videoModalOptions).then(function(reason) {
    });
  };
  $scope.hasSponsors = function() {
    return $scope.sponsors.length > 0;
  };
  $scope.hasContests = function(contests) {
    return contests.length > 0;
  };
  $scope.hasAuditions = function(contest) {
    var auditions = $scope.latestWaitingContestsAuditions[contest.id];
    return auditions && auditions.length > 0;
  };
  $scope.isPrizePlace = function(prize, place) {
    return prize.place === place;
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
.controller('contestantsController', ['$scope', '$translate', 'backendResponse', 'seoService', 'contestService', function($scope, $translate, backendResponse, seoService, contestService) {
  $scope.contestants = backendResponse.data.contestants;
  $scope.loadMoreContestants = true;
  var nextPage = 2;

  $translate(['seo.title.contestants', 'seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.contestants']);
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });
  seoService.setImage('/img/backgrounds/contestants.jpg');

  $scope.loadContestants = function() {
    if($scope.loadMoreContestants === true) {
      contestService.latestContestants(nextPage).then(function(response) {
        nextPage++;
        var contestants = response.data;
        if(contestants.length < 40) {
          $scope.loadMoreContestants = false;
        }
        $scope.contestants = $scope.contestants.concat(contestants);
      }).catch(function(err) {
        translationService.translateError(err).then(function(translation) {
          alertService.alert('danger', translation);
        });
      });
    }
  };
}])
.controller('contestsAdminController', ['$scope', '$translate', '$filter', '$underscore', 'backendResponse', 'contestService', 'alertService', 'modalService', 'seoService', function($scope, $translate, $filter, $underscore, backendResponse, contestService, alertService, modalService, seoService) {
  $scope.contests = backendResponse.data.contests;
  $scope.auditionsToReview = backendResponse.data.auditionsToReview;
  $scope.newContest = {};
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
  $scope.isContestProgress = function(contest, expectedProgress) {
    var progress;
    if(contest.progress === 'waiting' && contest.start_date && new Date() < new Date(contest.start_date)) {
      progress = 'waiting_time';
    } else {
      progress = contest.progress;
    }
    return progress === expectedProgress;
  };
  $scope.updateContest = function(contest) {
    contestService.updateContest(contest).then(function(contest) {
      alertService.alert('success', 'Contest updated');
    }).catch(function(err) {
      alertService.alert('danger', 'Error updating contest');
    });
  };
  $scope.createNewContest = function() {
    $scope.creatingContest = true;
  };
  $scope.createContest = function() {
    contestService.updateContest($scope.newContest).then(function(response) {
      contestService.listUnfinishedContests().then(function(response) {
        $scope.contests = response.data;
      });
      $scope.creatingContest = false;
      alertService.alert('success', 'Contest created');
    }).catch(function(err) {
      alertService.alert('danger', 'Error creating contest');
    });
  };
  $scope.cancelContest = function() {
    $scope.creatingContest = false;
    $scope.newContest = {};
  };
  $scope.sendInscriptionEmail = function(contest) {
    contestService.sendInscriptionEmail(contest).then(function() {
      alertService.alert('success', 'Inscription email sended');
    }).catch(function(err) {
      alertService.alert('danger', 'Error sending inscription email');
    });
  };
}])
.controller('contestController', ['$scope', '$stateParams', '$translate', '$underscore', 'authEvents', 'constants', 'backendResponse', 'contestService', 'seoService', function($scope, $stateParams, $translate, $underscore, authEvents, constants, backendResponse, contestService, seoService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.rankType = backendResponse.data.rankType;
  $scope.contest = backendResponse.data.contest;
  $scope.runningContests = backendResponse.data.runningContests;
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
  
  $scope.hidePrizes = true;
  if($scope.contest.progress === 'waiting') {
    $scope.hidePrizes = false;
  }

  $translate(['seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });
  seoService.setTitle($scope.contest.name);
  seoService.setImage($scope.contest.image);

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getUserVotes($scope.contest).then(function(response) {
      $scope.userVotes = response.data;
    });
    contestService.getUserAudition($scope.contest).then(function(response) {
      $scope.audition = response.data;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.audition = null;
    $scope.userVotes = null;
  });
  $scope.isContestProgress = function(expectedProgress) {
    var progress;
    if($scope.contest.progress === 'waiting' && $scope.contest.start_date && new Date() < new Date($scope.contest.start_date)) {
      progress = 'waiting_time';
    } else {
      progress = $scope.contest.progress;
    }
    return progress === expectedProgress;
  };
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
  $scope.showPrizes = function() {
    $scope.hidePrizes = !$scope.hidePrizes;
  };
  $scope.isShowPrizes = function() {
    return !$scope.hidePrizes;
  }
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
    return $scope.remainingVotes() > 0;
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
  $scope.hasRunningContests = function() {
    return $scope.runningContests.length > 0;
  };
}])
.controller('joinContestController', ['$scope', '$state', '$stateParams', '$translate', 'constants', 'authEvents', 'backendResponse', 'seoService', 'authenticationService', 'alertService', 'translationService', 'contestService', 'userService', function($scope, $state, $stateParams, $translate, constants, authEvents, backendResponse, seoService, authenticationService, alertService, translationService, contestService, userService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.contest = backendResponse.data.contest;
  $scope.audition = {contest_id: $scope.contest.id};
  $scope.userAudition = backendResponse.data.audition;

  $translate(['seo.title.join_contest', 'seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.join_contest']);
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });
  seoService.setImage($scope.contest.image);

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    contestService.getUserAudition($scope.contest).then(function(response) {
      $scope.userAudition = response.data;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.userAudition = null;
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
  $scope.isPrizePlace = function(prize, place) {
    return prize.place === place;
  };
  $scope.showVideo = function(url) {
    if(url) {
      contestService.getAuditionVideoInfos(url).then(function(response) {
        $scope.audition.url = url;
        $scope.audition.title = response.data.title;
        $scope.audition.description = response.data.description;
      }).catch(function(err) {
        translationService.translateError(err).then(function(translation) {
          alertService.alert('warning', translation);
        });
      });
    }
  };
  $scope.videoUrlPasted = function(event) {
    $scope.showVideo(event.clipboardData.getData('text/plain'));
  };
  $scope.joinContest = function() {
    contestService.submitAudition($scope.audition, $scope.contest).then(function(response) {
      var audition = response.data;
      $state.go('app.audition', {locale: $scope.locale(), id: audition.id, slug: audition.slug});
      $translate('alerts.congratulations_now_you_are_in_the_contest').then(function(translation) {
        alertService.alert('info', translation)
      });
    }).catch(function(err) {
      translationService.translateError(err, {user: $scope.userAuthenticated()}).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
}])
.controller('auditionController', ['$scope', '$translate', '$timeout', 'authEvents', 'constants', 'backendResponse', 'authenticationService', 'translationService', 'alertService', 'modalService', 'seoService', 'contestService', 'userService', function($scope, $translate, $timeout, authEvents, constants, backendResponse, authenticationService, translationService, alertService, modalService, seoService, contestService, userService) {
  $scope.siteUrl = constants.SITE_URL;
  $scope.contest = backendResponse.data.contest;
  $scope.audition = backendResponse.data.audition;
  $scope.userVote = backendResponse.data.userVote;
  $scope.otherAuditions = backendResponse.data.otherAuditions;
  $scope.totalAuditions = backendResponse.data.totalAuditions;
  $scope.totalUserVotes = backendResponse.data.totalUserVotes;
  $scope.voteLimit = backendResponse.data.voteLimit;
  $scope.votes = backendResponse.data.votes || 0;
  $scope.score = backendResponse.data.score || 0;
  $scope.isFan = backendResponse.data.fan;
  $scope.comments = backendResponse.data.comments;
  $scope.replyCommentFormOpened = {};

  seoService.setTitle($scope.audition.title + ' - ' + $scope.audition.user.name);
  seoService.setDescription($scope.audition.description);
  seoService.setImage($scope.audition.large_thumbnail);

  $scope.$on(authEvents.LOGIN_SUCCESS, function() {
    userService.isFan($scope.audition.user).then(function(response) {
      $scope.isFan = response.data;
    });
    contestService.getUserVote($scope.audition).then(function(response) {
      $scope.userVote = response.data.userVote;
      $scope.totalUserVotes = response.data.totalUserVotes;
    });
  });
  $scope.$on(authEvents.LOGOUT_SUCCESS, function() {
    $scope.isFan = false;
    $scope.userVote = null;
    $scope.totalUserVotes = 0;
  });
  $scope.showFanButtons = function() {
    return !$scope.userAuthenticated() || ($scope.userAuthenticated().id !== $scope.audition.user.id);
  };
  $scope.fan = function() {
    userService.fan($scope.audition.user).then(function(response) {
      $scope.isFan = true;
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.unfan = function() {
    userService.unfan($scope.audition.user).then(function(response) {
      $scope.isFan = false;
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.remainingVotes = function() {
    return $scope.voteLimit - $scope.totalUserVotes;
  };
  $scope.hasRemainingVotes = function() {
    return $scope.remainingVotes() > 0;
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
    return !$scope.userAuthenticated() || ($scope.userAuthenticated().id !== $scope.audition.user.id);
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
    contestService.vote(audition).then(function(response) {
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
      translationService.translateError(err, {user: $scope.userAuthenticated()}).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.removeVote = function(audition) {
    contestService.removeVote(audition).then(function(response) {
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
  $scope.comment = function(message) {
    contestService.comment($scope.audition, message).then(function(response) {
      $scope.comments.unshift(response.data);
      $scope.closeReplyCommentForm(response.data);
      message = '';
    }).catch(function(err) {
      translationService.translateError(err, {user: $scope.userAuthenticated()}).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.replyComment = function(comment, message) {
    contestService.replyComment(comment, message).then(function(response) {
      comment.replies.push(response.data);
      $scope.closeReplyCommentForm(comment);
    }).catch(function(err) {
      translationService.translateError(err, {user: $scope.userAuthenticated()}).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.openReplyCommentForm = function(comment) {
    authenticationService.ensureAuthentication().then(function() {
      $scope.replyCommentFormOpened[comment.id] = true;
    });
  };
  $scope.closeReplyCommentForm = function(comment) {
    $scope.replyCommentFormOpened[comment.id] = false;
  };
  $scope.isReplyCommentFormOpened = function(comment) {
    return $scope.replyCommentFormOpened[comment.id] === true;
  };
  $scope.canRemoveComment = function(comment) {
    var user = $scope.userAuthenticated();
    return user && (user.id === $scope.audition.user_id || user.id === comment.user_id);
  };
  $scope.removeComment = function(comment, parentComment) {
    contestService.removeComment(comment).then(function(response) {
      if(parentComment) {
        for(var index in parentComment.replies) {
          var reply = parentComment.replies[index];
          if(reply.id === comment.id) {
            parentComment.replies.splice(index, 1);
          }
        }
      } else {
        for(var index in $scope.comments) {
          var currentComment = $scope.comments[index];
          if(currentComment.id === comment.id) {
            $scope.comments.splice(index, 1);
          }
        }
      }
    }).catch(function(err) {
      translationService.translateError(err).then(function(translation) {
        alertService.alert('danger', translation);
      });
    });
  };
  $scope.commentHasReplies = function(comment) {
    return comment.replies.length > 0;
  };
}])
.controller('guidelineController', ['$translate', 'seoService', function($translate, seoService) {
  $translate(['seo.title.guideline', 'seo.description.contest', 'seo.keywords.contest']).then(function(translations) {
    seoService.setTitle(translations['seo.title.guideline']);
    seoService.setDescription(translations['seo.description.contest']);
    seoService.setKeywords(translations['seo.keywords.contest']);
  });
}]);