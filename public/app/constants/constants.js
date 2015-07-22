'use strict';

angular
.module('coverAcademy.constants', [])
.constant('constants', {
  SITE_NAME: 'Cover Academy',
  SITE_URL: 'http://www.coveracademy.com',
  LOGO_URL: 'http://www.coveracademy.com/img/logos/pretty-logo.jpg',
  USER_COOKIE: 'coverAcademy.user',
  MINIMUM_VOTES: 2,
  MAXIMUM_VOTES: 5
})
.constant('authEvents', {
  USER_REGISTERED: 'userRegistered',
  FAIL_REGISTERING_USER: 'failRegisteringUser',
  LOGIN_SUCCESS: 'loginSuccess',
  LOGIN_FAILED: 'loginFailed',
  LOGOUT_SUCCESS: 'logoutSuccess',
  LOGOUT_FAILED: 'logoutFailed',
  SESSION_TIMEOUT: 'sessionTimeout',
  NOT_AUTHORIZED: 'notAuthorized',
  NOT_AUTHENTICATED: 'notAuthenticated',
  HTTP_NOT_AUTHENTICATED: 'httpNotAuthenticated'
})
.constant('accessLevel', {
  ADMIN: {name: 'admin', roles: ['admin']},
  USER: {name: 'user', roles: ['user', 'admin']},
  PUBLIC: {name: 'public', roles: ['public', 'user', 'admin']},
  ANONYMOUS: {name: 'anonymous', roles: ['public']}
})
.constant('redirections', {
  audition: 'app.audition',
  contest: 'app.contest',
  contests: 'app.contests',
  cover: 'app.cover',
  covers: 'app.covers',
  home: 'app.home',
  joinContest: 'app.joinContest',
  user: 'app.user'
});