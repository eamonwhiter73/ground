var app = angular.module('groundup');

app.controller('LoginCtrl', function ($scope, $location, Auth) {
  $scope.user = {};

  $scope.login = function(form) {
    $scope.submitted = true;
    
    if(form.$valid) {
       //
    }
  };
});