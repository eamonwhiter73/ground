var app = angular.module('groundup');

app.controller('MainCtrl', function ($scope, $location) {
  $scope.menu = [{
    'title': 'Home',
    'link': '/'
  }/*, {
    'title': 'Sign up',
    'link': '/signup',
  }*/];

  $scope.go = function(location) {
    $location.path(location);
  }
});