angular
.module('coverAcademy.services', [])
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
  var alerts = [];
  this.getAlerts = function() {
    return alerts;
  };
  this.addAlert = function(type, message) {
    var that = this;
    var alert = {type: type, msg: message};
    $.getAlerts().push(alert);
    $timeout(function() {
      $.getAlerts().splice(that.getAlerts().indexOf(alert), 1);
    }, 8000);
  };
}])
.service('authenticationService', ['$rootScope', '$state', '$modal', '$window', '$q', '$cookieStore', '$underscore', 'constants', 'authEvents', 'userService', function($rootScope, $state, $modal, $window, $q, $cookieStore, $underscore, constants, authEvents, userService) {
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
    var left = ($window.screen.width / 2) - (780 / 2);
    var top = ($window.screen.height / 2) - (410 / 2);
    var win = $window.open(userService.loginEndpoint(provider), 'SignIn', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=' + left + ',top=' + top);
    win.focus();
    $window.authResult = function(result, message) {
      if(result === 'success') {
        userService.getAuthenticatedUser().then(function(response) {
          changeUser(response.data);
          deferred.resolve(user);
          $rootScope.$broadcast(authEvents.LOGIN_SUCCESS);
        }).catch(function(err) {
          deferred.reject(err);
          $rootScope.$broadcast(authEvents.LOGIN_FAILED);
        });
      } else if(result === 'must-register') {
        deferred.resolve();
        $rootScope.$broadcast(authEvents.MUST_REGISTER);
      } else if(result === 'fail') {
        deferred.reject();
        $rootScope.$broadcast(authEvents.LOGIN_FAILED, message);
      }
      win.close();
    }
    return deferred.promise;
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

  var modalOptions = {
    backdrop: true,
    keyboard: true,
    templateUrl: '/app/partials/widgets/login-modal.html',
    controller: function($scope, $modalInstance) {
      $scope.modalScope = {};
      $scope.modalScope.close = function(result) {
        $modalInstance.dismiss('cancel');
      };
      $scope.modalScope.auth = function(provider) {
        $.login(provider).then(function(user) {
          $modalInstance.close($.isAuthenticated());
        }).catch(function(err) {
          $modalInstance.close($.isAuthenticated());
        });
      };
    }
  };
  this.ensureAuth = function() {
    var deferred = $q.defer();
    if(!$.isAuthenticated()) {
      $modal.open(modalOptions).result.then(function(authenticated) {
        if(authenticated === true) {
          deferred.resolve(true);
        } else {
          deferred.reject(false);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  };
}])
.service('modalService', ['$modal', function($modal) {
  var modalOptions = {
    backdrop: true,
    keyboard: true,
    templateUrl: '/partials/widgets/modal.html',
  };
  var modalScope = {
    headerText: 'Do you really want to procede with this action?',
    bodyText: '',
    closeButtonText: 'No',
    actionButtonText: 'Yes',
  };
  this.show = function(customModalOptions, customModalScope) {
    var extendedOptions = {};
    var extendedScope = {};
    angular.extend(extendedOptions, modalOptions, customModalOptions);
    angular.extend(extendedScope, modalScope, customModalScope);
    extendedOptions.controller = function($scope, $modalInstance) {
      $scope.modalScope = extendedScope;
      $scope.modalScope.action = function() {
        $modalInstance.close('action');
      };
      $scope.modalScope.close = function() {
        $modalInstance.dismiss('cancel');
      };
    };
    return $modal.open(extendedOptions).result;
  };
}])
.service('translationService', ['$q', '$translate', function($q, $translate) {
  var errorKeys = {
    'audition.vote.canNotVoteForYourself': 'errors.user_vote_can_not_vote_for_yourself',
    'audition.vote.contestWasFinished': 'errors.user_vote_contest_was_finished',
    'audition.vote.reachVoteLimit': 'errors.user_vote_reach_vote_limit',
    'contest.join.alreadyFinished': 'errors.join_contest_already_finished',
    'contest.join.userAlreadyInContest': 'errors.join_contest_user_already_in_contest',
    'contest.join.videoDateIsNotValid': 'errors.join_contest_video_date_is_not_valid',
    'contest.join.videoNotOwnedByUser': 'errors.join_contest_video_not_owned_by_user',
    'user.auth.accountNotFound': 'errors.user_auth_account_not_found',
    'user.auth.passwordWithFewerCharacters': 'errors.user_auth_password_with_fewer_characteres',
    'youtube.videoURLNotValid': 'errors.youtube_video_url_not_valid',
    'internalError': 'errors.unexpected_error',
    'unexpectedError': 'errors.unexpected_error',
    'status.400': 'errors.unexpected_error',
    'status.401': 'errors.authentication_required',
    'status.500': 'errors.unexpected_error'
  };
  this.translateError = function(err) {
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
    deferred.resolve($translate(translationKey));
    return deferred.promise;
  };
}])
.service('userService', ['$http', function($http) {
  var $ = this;
  var defaultProfilePicture = '/img/users/default.jpg';
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

  this.loginEndpoint = function(provider) {
    return '/api/auth/' + provider;
  };
  this.logout = function() {
    return $http.get('/api/auth/logout');
  };
  this.getAuthenticatedUser = function() {
    return $http.get('/api/user/authenticated');
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
  this.connect = function(email, password, user, networkType, networkAccount) {
    return $http.post('/api/user/connect', {email: email, password: password, user: user.id, network_type: networkType, network_account: networkAccount});
  };
  this.get = function(id) {
    return $http.get('/api/user', {params: {id: id}});
  };
  this.getByEmail = function(email) {
    return $http.get('/api/user', {params: {email: email}});
  };
  this.getProfilePicture = function(user, network) {
    var url = defaultProfilePicture;
    var picture = networkPictures[network ? network : user.primary_network];
    if(picture) {
      url = picture.get(user);
    }
    return url;
  };
  this.hasNetworkConnection = function(user, network) {
    var hasConnection = false;
    if(network === 'facebook') {
      hasConnection = Boolean(user.facebook_account);
    } else if(network === 'twitter') {
      hasConnection = Boolean(user.twitter_account);
    } else if(network === 'google') {
      hasConnection = Boolean(user.google_account);
    }
    return hasConnection;
  };
  this.getPrimaryNetworkConnection = function(user) {
    var connection = null;
    if(user.primary_network === 'facebook') {
      connection = {type: 'facebook', account: user.facebook_account};
    } else if(user.primary_network === 'twitter') {
      connection = {type: 'twitter', account: user.twitter_account};
    } else if(user.primary_network === 'google') {
      connection = {type: 'google', account: user.google_account};
    }
    return connection;
  };
  this.isPrimaryNetworkConnection = function(user, network) {
    var connection = $.getPrimaryNetworkConnection(user);
    return connection.type === network;
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
  this.adminView = function() {
    return $http.get('/view/admin');
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
  this.joinContestView = function(id, slug) {
    return $http.get('/view/contest/' + id + '/' + slug + '/join');
  };
  this.auditionView = function(id, slug) {
    return $http.get('/view/audition/' + id + '/' + slug);
  };
  this.userView = function(id) {
    return $http.get('/view/user/' + id);
  };
  this.registerView = function() {
    return $http.get('/view/register');
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
  this.getAuditionVideoInfos = function(url) {
    return $http.get('/api/contest/audition/videoInfos', {params: {url: url}});
  };
  this.joinContest = function(audition) {
    return $http.post('/api/contest/join', {audition: audition});
  };
  this.isContestant = function(contest) {
    return $http.get('/api/contest/isContestant', {params: {contest_id: contest.id}});
  };
  this.getUserAudition = function(contest) {
    return $http.get('/api/contest/audition', {params: {contest_id: contest.id}});
  };
  this.voteInAudition = function(audition) {
    return $http.post('/api/contest/audition/vote', {audition_id: audition.id});
  };
  this.removeVoteInAudition = function(audition) {
    return $http.post('/api/contest/audition/removeVote', {audition_id: audition.id});
  };
  this.getUserVote = function(audition) {
    return $http.get('/api/contest/audition/vote', {params: {audition_id: audition.id}});
  };
  this.bestAuditions = function(contest, page) {
    return $http.get('/api/contest/audition/best', {params: {contest: contest.id, page: page}});
  };
  this.latestAuditions = function(contest, page) {
    return $http.get('/api/contest/audition/latest', {params: {contest: contest.id, page: page}});
  };
}]);