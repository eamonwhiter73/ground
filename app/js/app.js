'use strict';

var app = angular.module('groundup', [
    'ngRoute',
    'ngResource',
    'ngCookies',
    'btford.socket-io'
]);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/partials/main.html',
      controller: 'MainCtrl'
    })
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
})

app.factory('socket', function (socketFactory) {
  return socketFactory();
});