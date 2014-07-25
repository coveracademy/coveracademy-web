angular
.module('coverChallengeApp',
  [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'angularMoment',
    'infinite-scroll',
    'nya.bootstrap.select',
    'videosharing-embed'
  ]
)
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('index', {url: '/', templateUrl: '/app/partials/index.html', controller: 'indexController'})
    .state('addCover', {url: '/add-cover', templateUrl: '/app/partials/add-cover.html', controller: 'newCoverController'})
    .state('viewCover', {url: '/cover/:id', templateUrl: '/app/partials/view-cover.html', controller: 'viewCoverController' })
    .state('contact', {url: '/contact', templateUrl: '/app/partials/contact.html', controller: 'contactController'});
});