var app = angular.module('groundup');

app.controller('MainCtrl', function ($rootScope, $scope, Auth, $location) {
  console.log($rootScope.currentUser);
});