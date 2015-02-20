angular
.module('coverAcademy.services', [])
.service('stateService', ['$state', function($state) {
  var latestState = undefined;
  var latestStatusCode = undefined;
  var State = function(name, params, opts) {
    this.stateName = name;
    this.stateParams = params;
    this.stateOpts = opts;
    this.statusCode = 200;

    this.withStatusCode = function(code) {
      this.statusCode = code;
      return this;
    };
    this.go = function() {
      latestStatusCode = this.statusCode;
      latestState = this;
      return $state.go(this.stateName, this.stateParams, this.stateOpts);
    };
    this.getStatusCode = function() {
      return statusCode;
    };
    this.getStateName = function() {
      return stateName;
    };
    this.getStateParams = function() {
      return stateParams;
    };
    this.getStateOpts = function() {
      return stateOpts;
    };
  };

  this.newState = function(name, params, opts) {
    return new State(name, params, opts);
  };
  this.getLatestState = function() {
    return latestState;
  };
  this.getLatestStatusCode = function() {
    return latestStatusCode;
  };
  this.releaseLatestStatusCode = function() {
    var latest = latestStatusCode;
    latestStatusCode = undefined;
    return latest;
  };
}])
.service('seoService', ['$location', 'constants', function($location, constants) {
  var title = null;
  var description = null;
  var keywords = null;
  var image = null;

  this.getSiteName = function() {
    return constants.SITE_NAME;
  };
  this.getUrl = function() {
    return $location.absUrl();
  };
  this.getTitle = function() {
    return title;
  };
  this.setTitle = function(newTitle) {
    title = newTitle;
  };
  this.getDescription = function() {
    return description;
  };
  this.setDescription = function(newDescription) {
    description = newDescription;
  };
  this.getImage = function() {
    if(!image) {
      return constants.LOGO_URL;
    }
    return image;
  };
  this.setImage = function(newImage) {
    image = newImage.slice(0, 1) === '/' ? constants.SITE_URL + newImage : newImage;
  };
  this.setKeywords = function(newKeywords) {
    if(angular.isString(newKeywords)) {
      keywords = newKeywords;
    } else if(angular.isArray(newKeywords)) {
      angular.forEach(newKeywords, function(newKeyword) {
        if (keywords === '') {
          keywords += newKeyword;
        } else {
          keywords += ', ' + newKeyword;
        }
      });
    }
  };
  this.getKeywords = function() {
    return keywords;
  };
  this.reset = function() {
    title = null;
    description = null;
    keywords = null;
    image = null;
  };
}])
.service('alertService', ['$timeout', function($timeout) {
  var $ = this;
  var messages = [];
  this.alerts = function() {
    return messages;
  };
  this.alert = function(type, message) {
    var alertMessage = {type: type, msg: message};
    $.alerts().push(alertMessage);
    $timeout(function() {
      $.alerts().splice($.alerts().indexOf(alertMessage), 1);
    }, 8000);
  };
}])
.service('authenticationService', ['$rootScope', '$modal', '$window', '$q', '$cookieStore', '$underscore', 'constants', 'authEvents', 'userService', function($rootScope, $modal, $window, $q, $cookieStore, $underscore, constants, authEvents, userService) {
  var $ = this;
  var user = $cookieStore.get(constants.USER_COOKIE) || null;
  var changeUser = function(newUser) {
    if(newUser) {
      user = newUser;
      $cookieStore.put(constants.USER_COOKIE, newUser);
    } else {
      user = null;
      $cookieStore.remove(constants.USER_COOKIE);
    }
  };
  this.updateUser = function() {
    var deferred = $q.defer();
    userService.getAuthenticatedUser().then(function(response) {
      changeUser(response.data);
      deferred.resolve(user);
    }).catch(function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  $.updateUser();

  var loginModalOptions = {
    templateUrl: '/app/partials/widgets/login-modal.html',
    controller: 'loginController'
  };
  var registerModalOptions = {
    size: 'lg',
    templateUrl: '/app/partials/widgets/register-modal.html',
    resolve: {
      temporaryUser: function(userService) {
        return userService.getTemporaryUser().then(function(response) {
          return response.data;
        });
      }
    },
    controller: 'registerController'
  };
  this.isAuthenticated = function() {
    return user ? true : false;
  };
  this.getUser = function() {
    return $.isAuthenticated() ? user : null;
  };
  this.isAuthorized = function (accessLevel) {
    var authenticatedUser = $.getUser();
    var userRole = authenticatedUser && authenticatedUser.permission ? authenticatedUser.permission : 'public';
    return !accessLevel || $underscore.contains(accessLevel.roles, userRole);
  };
  this.login = function(provider) {
    var deferred = $q.defer();
    if(provider) {
      var left = ($window.screen.width / 2) - (780 / 2);
      var top = ($window.screen.height / 2) - (410 / 2);
      var win = $window.open(userService.loginEndpoint(provider), 'SignIn', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=' + left + ',top=' + top);
      win.focus();
      $window.authResult = function(result, message) {
        if(result === 'must-register') {
          win.close();
          $modal.open(registerModalOptions).result.then(function(registered) {
            if(registered === true) {
              $.updateUser().then(function(userUpdated) {
                deferred.resolve(userUpdated);
                $rootScope.$broadcast(authEvents.USER_REGISTERED);
              }).catch(function(err) {
                deferred.reject(err);
                $rootScope.$broadcast(authEvents.FAIL_REGISTERING_USER);
              });
            } else {
              deferred.reject();
              $rootScope.$broadcast(authEvents.FAIL_REGISTERING_USER);
            }
          });
        } else {
          if(result === 'success') {
            $.updateUser().then(function(userUpdated) {
              deferred.resolve(userUpdated);
              $rootScope.$broadcast(authEvents.LOGIN_SUCCESS, provider);
            }).catch(function(err) {
              deferred.reject(err);
              $rootScope.$broadcast(authEvents.LOGIN_FAILED, provider);
            });
          } else if(result === 'fail') {
            deferred.reject();
            $rootScope.$broadcast(authEvents.LOGIN_FAILED, message);
          }
          win.close();
        }
      }
      return deferred.promise;
    } else {
      $modal.open(loginModalOptions).result.then(function(authenticated) {
        if(authenticated === true) {
          deferred.resolve(user);
        } else {
          deferred.reject();
        }
      });
      return deferred.promise;
    }
  };
  this.logout = function() {
    var deferred = $q.defer();
    userService.logout().then(function(response) {
      changeUser(null);
      deferred.resolve();
      $rootScope.$broadcast(authEvents.LOGOUT_SUCCESS);
    }).catch(function(err) {
      deferred.reject();
      $rootScope.$broadcast(authEvents.LOGOUT_FAILED);
    });
    return deferred.promise;
  };
  this.ensureAuthentication = function() {
    var deferred = $q.defer();
    if(!this.isAuthenticated()) {
      deferred.resolve(this.login());
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  };
}])
.service('modalService', ['$modal', function($modal) {
  var modalOptions = {
    backdrop: true,
    keyboard: true,
    templateUrl: '/app/partials/widgets/modal.html',
  };
  var modalScope = {
    headerText: 'Do you really want to procede with this action?',
    bodyText: '',
    cancelText: 'No',
    confirmText: 'Yes',
  };
  this.show = function(customOptions, customScope) {
    var extendedOptions = {};
    var extendedScope = {};
    angular.extend(extendedOptions, modalOptions, customOptions);
    if(!extendedOptions.controller) {
      angular.extend(extendedScope, modalScope, customScope);
      extendedOptions.controller = function($scope, $modalInstance) {
        $scope.modalScope = extendedScope;
        $scope.modalScope.confirm = function(result) {
          $modalInstance.close(result);
        };
        $scope.modalScope.cancel = function(reason) {
          $modalInstance.dismiss(reason || 'cancel');
        };
      };
    }
    return $modal.open(extendedOptions).result;
  };
}])
.service('translationService', ['$q', '$translate', function($q, $translate) {
  var errorKeys = {
    'audition.vote.canNotVoteForYourself': 'errors.user_vote_can_not_vote_for_yourself',
    'audition.vote.contestWasFinished': 'errors.user_vote_contest_was_finished',
    'audition.vote.reachVoteLimit': 'errors.user_vote_reach_vote_limit',
    'audition.vote.userNotVerified': 'errors.user_vote_user_not_verified',
    'contest.join.alreadyFinished': 'errors.join_contest_already_finished',
    'contest.join.userAlreadyInContest': 'errors.join_contest_user_already_in_contest',
    'contest.join.userNotVerified': 'errors.join_contest_user_not_verified',
    'contest.join.videoDateIsNotValid': 'errors.join_contest_video_date_is_not_valid',
    'contest.join.videoNotOwnedByUser': 'errors.join_contest_video_not_owned_by_user',
    'user.connect.alreadyConnected': 'errors.user_connect_already_connected',
    'user.edit.invalidUsername': 'errors.user_edit_invalid_username',
    'user.verification.emailAlreadyVerified': 'errors.user_verification_email_already_verified',
    'user.verification.errorSendingVerificationEmail': 'errors.user_verification_error_sending_verification_email',
    'youtube.videoURLNotValid': 'errors.youtube_video_url_not_valid',
    'internalError': 'errors.unexpected_error',
    'unexpectedError': 'errors.unexpected_error',
    'status.400': 'errors.unexpected_error',
    'status.401': 'errors.authentication_required',
    'status.500': 'errors.unexpected_error'
  };
  this.translateError = function(err, vars) {
    var isError = Boolean(angular.isObject(err) && err.data && err.status);
    var translationKey = errorKeys[isError ? err.data.errorKey : err];
    if(!translationKey) {
      if(isError) {
        translationKey = errorKeys['status.' + err.status];
      } else {
        translationKey = errorKeys['internalError'];
      }
    }
    var deferred = $q.defer();
    deferred.resolve($translate(translationKey, vars));
    return deferred.promise;
  };
}])
.service('userService', ['$http', '$underscore', function($http, $underscore) {
  var $ = this;
  var networkPictures = {
    facebook: {
      url: 'http://graph.facebook.com/v2.2/{{ facebook_account }}/picture?type=large',
      token: '{{ facebook_account }}',
      get: function(user) {
        return this.url.replace(this.token, user.facebook_account);
      }
    },
    twitter: {
      url: '',
      token: '',
      get: function(user) {
        return user.twitter_picture;
      }
    },
    google: {
      url: '',
      token: '',
      get: function(user) {
        return user.google_picture;
      }
    }
  };
  var networkUrls = {
    facebook: {
      url: 'http://www.facebook.com/{{ facebook_account }}',
      token: '{{ facebook_account }}',
      get: function(user) {
        return this.url.replace(this.token, user.facebook_account);
      }
    },
    twitter: {
      url: 'http://www.twitter.com/{{ twitter_username }}',
      token: '{{ twitter_username }}',
      get: function(user) {
        var socialAccount = $.getSocialAccount(user, 'twitter');
        return socialAccount ? this.url.replace(this.token, socialAccount.url) : null;
      }
    },
    google: {
      url: 'http://plus.google.com/{{ google_account }}',
      token: '{{ google_account }}',
      get: function(user) {
        return this.url.replace(this.token, user.google_account);
      }
    },
    youtube: {
      url: 'https://www.youtube.com/channel/{{ youtube_account }}',
      token: '{{ youtube_account }}',
      get: function(user) {
        return this.url.replace(this.token, user.youtube_account);
      }
    },
    soundcloud: {
      url: 'http://www.soundcloud.com/{{ soundcloud_permalink }}',
      token: '{{ soundcloud_permalink }}',
      get: function(user) {
        var socialAccount = $.getSocialAccount(user, 'soundcloud');
        return socialAccount ? this.url.replace(this.token, socialAccount.url) : null;
      }
    }
  };
  this.loginEndpoint = function(provider) {
    return '/api/auth/' + provider;
  };
  this.logout = function() {
    return $http.get('/api/auth/logout');
  };
  this.getAuthenticatedUser = function() {
    return $http.get('/api/user/authenticated');
  };
  this.getTemporaryUser = function() {
    return $http.get('/api/user/temporary');
  };
  this.verificationEmail = function(user) {
    return $http.post('/api/user/verification', {user: user.id});
  };
  this.sendEmail = function(name, email, subject, message) {
    return $http.post('/api/user/email', {name: name, email: email, subject: subject, message: message});
  };
  this.create = function(user) {
    return $http.post('/api/user', {user: user});
  };
  this.update = function(user) {
    return $http.put('/api/user', {user: user});
  };
  this.get = function(id) {
    return $http.get('/api/user', {params: {id: id}});
  };
  this.getByEmail = function(email) {
    return $http.get('/api/user', {params: {email: email}});
  };
  this.disconnectNetwork = function(network) {
    return $http.post('/api/user/disconnect', {network: network});
  };
  this.showNetwork = function(network, show) {
    return $http.post('/api/user/showNetwork', {network: network, show: show});
  };
  this.getProfilePicture = function(user, network) {
    var url = '';
    var picture = networkPictures[network ? network : user.profile_picture];
    if(picture) {
      url = picture.get(user);
    }
    return url;
  };
  this.getNetworkProfileUrl = function(user, network) {
    var url = '';
    var networkUrl = networkUrls[network];
    if(networkUrl) {
      url = networkUrl.get(user);
    }
    return url;
  };
  this.isProfilePicture = function(user, network) {
    return user.profile_picture === network;
  };
  this.isConnectedWithNetwork = function(user, network) {
    return Boolean(user[network + '_account']);
  };
  this.getSocialAccount = function(user, network) {
    return $underscore.find(user.socialAccounts, function(socialAccount) {
      return socialAccount.network === network;
    });
  };
}])
.service('oembedService', ['$http', function($http) {
  this.getOEmbed = function(url) {
    return $http.get('/oembed', {params: {url: url}});
  };
}])
.service('viewService', ['$http', function($http) {
  this.indexView = function() {
    return $http.get('/view/index');
  };
  this.coversAdminView = function() {
    return $http.get('/view/covers/admin');
  };
  this.addCoverView = function() {
    return $http.get('/view/addCover');
  };
  this.coverView = function(id, slug) {
    return $http.get('/view/cover/' + id + '/' + slug);
  };
  this.coversView = function() {
    return $http.get('/view/covers');
  };
  this.coversRankView = function(rank) {
    return $http.get('/view/covers/' + rank);
  };
  this.artistView = function(artist, rank) {
    return $http.get('/view/artist/' + artist, {params: {rank: rank}});
  };
  this.artistsView = function(genre) {
    return $http.get('/view/artists', {params: {genre: genre}});
  };
  this.musicView = function(music, rank) {
    return $http.get('/view/music/' + music, {params: {rank: rank}});
  };
  this.musicGenreView = function(genre, rank) {
    return $http.get('/view/genre/' + genre, {params: {rank: rank}});
  };
  this.musicGenreRankView = function(genre, rank) {
    return $http.get('/view/genre/' + genre + '/' + rank);
  };
  this.searchView = function(query) {
    return $http.get('/view/search', {params: {query: query}});
  };
  this.contestView = function(id, slug, rank) {
    return $http.get('/view/contest/' + id + '/' + slug, {params: {rank: rank}});
  };
  this.contestsView = function() {
    return $http.get('/view/contests');
  };
  this.contestantsView = function() {
    return $http.get('/view/contestants');
  };
  this.contestsAdminView = function() {
    return $http.get('/view/contests/admin');
  };
  this.joinContestView = function(id, slug) {
    return $http.get('/view/contest/' + id + '/' + slug + '/join');
  };
  this.auditionView = function(id, slug) {
    return $http.get('/view/audition/' + id + '/' + slug);
  };
  this.userView = function(id) {
    return $http.get('/view/user/' + id);
  };
  this.userIdView = function(id) {
    return $http.get('/view/user', {params: {id: id}});
  };
  this.verifyView = function(token) {
    return $http.get('/view/verify', {params: {token: token}});
  };
  this.settingsView = function() {
    return $http.get('/view/settings');
  };
}])
.service('coverService', ['$http', function($http) {
  this.acceptCover = function(potentialCover) {
    return $http.post('/api/cover/accept', {potentialCover: potentialCover});
  };
  this.refuseCover = function(potentialCover) {
    return $http.post('/api/cover/refuse', {potentialCover: potentialCover});
  };
  this.addCover = function(cover) {
    return $http.post('/api/cover', {cover: cover});
  };
  this.getCover = function(id) {
    return $http.get('/api/cover/' + id);
  };
  this.latestCovers = function(page) {
    return $http.get('/api/cover/latest', {params: {page: page}});
  };
  this.bestCovers = function(page) {
    return $http.get('/api/cover/best', {params: {page: page}});
  };
  this.latestCoversOfMusic = function(music, page) {
    return $http.get('/api/cover/latestOfMusic', {params: {music: music.id, page: page}});
  };
  this.bestCoversOfMusic = function(music, page) {
    return $http.get('/api/cover/bestOfMusic', {params: {music: music.id, page: page}});
  };
  this.latestCoversOfMusicGenre = function(musicGenre, page) {
    return $http.get('/api/cover/latestOfMusicGenre', {params: {musicGenre: musicGenre.id, page: page}});
  };
  this.bestCoversOfMusicGenre = function(musicGenre, page) {
    return $http.get('/api/cover/bestOfMusicGenre', {params: {musicGenre: musicGenre.id, page: page}});
  };
}])
.service('artistService', ['$http', function($http) {
  this.listArtists = function(musicGenre, page) {
    return $http.get('/api/artist', {params: {musicGenre: musicGenre.id, page: page}});
  };
  this.saveArtist = function(artist) {
    return $http.post('/api/artist', {artist: artist});
  };
}])
.service('musicService', ['$http', function($http) {
  this.saveMusic = function(music) {
    return $http.post('/api/music', {music: music});
  };
}])
.service('searchService', ['$http', function($http) {
  this.searchMusicOrArtist = function(query) {
    return $http.get('/api/search/musicOrArtist', {params: {query: query}});
  };
  this.searchArtists = function(query, related) {
    return $http.get('/api/search/artist', {params: {query: query, related: related}});
  };
  this.searchMusics = function(query, artist) {
    return $http.get('/api/search/music', {params: {artist: artist, query: query}});
  };
}])
.service('contestService', ['$http', function($http) {
  this.listUnfinishedContests = function() {
    return $http.get('/api/contest/unfinished');
  };
  this.sendInscriptionEmail = function(contest) {
    return $http.post('/api/contest/inscriptionEmail', {contest: contest.id});
  };
  this.getAuditionVideoInfos = function(url) {
    return $http.get('/api/contest/audition/videoInfos', {params: {url: url}});
  };
  this.submitAudition = function(audition, contest) {
    return $http.post('/api/contest/audition/submit', {audition: audition, contest: contest.id});
  };
  this.updateContest = function(contest) {
    return $http.put('/api/contest/', {contest: contest});
  };
  this.isContestant = function(contest) {
    return $http.get('/api/contest/isContestant', {params: {contest: contest.id}});
  };
  this.getUserAudition = function(contest) {
    return $http.get('/api/contest/audition', {params: {contest: contest.id}});
  };
  this.vote = function(audition) {
    return $http.post('/api/contest/audition/vote', {audition: audition.id});
  };
  this.removeVote = function(audition) {
    return $http.delete('/api/contest/audition/vote', {params: {audition: audition.id}});
  };
  this.comment = function(audition, message) {
    return $http.post('/api/contest/audition/comment', {audition: audition.id, message: message});
  };
  this.replyComment = function(comment, message) {
    return $http.post('/api/contest/audition/replyComment', {comment: comment.id, message: message});
  };
  this.removeComment = function(comment) {
    return $http.delete('/api/contest/audition/comment', {params: {comment: comment.id}});
  };
  this.getUserVote = function(audition) {
    return $http.get('/api/contest/audition/vote', {params: {audition: audition.id}});
  };
  this.bestAuditions = function(contest, page) {
    return $http.get('/api/contest/audition/best', {params: {contest: contest.id, page: page}});
  };
  this.latestAuditions = function(contest, page) {
    return $http.get('/api/contest/audition/latest', {params: {contest: contest.id, page: page}});
  };
  this.randomAuditions = function(contest, size) {
    return $http.get('/api/contest/audition/random', {params: {contest: contest.id, size: size}});
  };
  this.approveAudition = function(audition) {
    return $http.post('/api/contest/audition/approve', {audition: audition.id});
  };
  this.disapproveAudition = function(audition, reason) {
    return $http.post('/api/contest/audition/disapprove', {audition: audition.id, reason: reason});
  };
}]);