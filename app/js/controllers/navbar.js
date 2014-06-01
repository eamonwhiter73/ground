'use strict';

angular.module('groundup')
  .controller('NavbarCtrl', function ($scope, Auth, $location) {
      $scope.authMenu = [{
        'title': 'Log out',
        'link': '/',
      }];

    $scope.menu = [{
      'title': 'Sign up',
      'link': '/signup'
    }, {
      "title": "Log in",
      "link": "/login"
    }];
    

    $scope.go = function(location) {
      $location.path(location);
    }

    $scope.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };
  });