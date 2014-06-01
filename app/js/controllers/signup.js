'use strict';

angular.module('groundup')
  .controller('SignupCtrl', function ($scope, Auth, $location) {
    $scope.register = function(form) {
      console.log($scope.user.password);
      console.log($scope.user.username);
      //$scope.$apply;
      Auth.createUser({
          username: $scope.user.username,
          password: $scope.user.password
        },
        function(err) {
          if (err) {
            console.log(err);
          };
        }
      );
      //$location.path('/profile');
    };
  });