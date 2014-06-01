'use strict';

var app = angular.module('groundup', [
    'ngRoute',
    'ngResource',
    'ngCookies'
]);

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/main.html',
      controller: 'MainCtrl'
    })
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl'
    })
    .when('/signup', {
      templateUrl: 'partials/signup.html',
      controller: 'SignupCtrl'
    })
    .when('/logout', {
      templateUrl: 'partials/main.html',
      controller: 'MainCtrl'
    })
    .when('/profile', {
      templateUrl: 'partials/profile.html',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });

    $locationProvider.html5Mode(true);
})

app.run(function ($rootScope, $location, Auth) {

    //watching the value of the currentUser variable.
    $rootScope.$watch('currentUser', function(currentUser) {
      // if no currentUser and on a page that requires authorization then try to update it
      // will trigger 401s if user does not have a valid session
      if (!currentUser && (['/', '/login', '/logout', '/signup', '/profile'].indexOf($location.path()) == -1 )) {
        Auth.currentUser();
      }
    });

    // On catching 401 errors, redirect to the login page.
    $rootScope.$on('event:auth-loginRequired', function() {
      $location.path('/login');
      return false;
    });
  });

app.factory('socket', function (socketFactory) {
  return socketFactory();
});