var app = angular.module('groundup');

app.controller('LoginCtrl', function ($scope, $location, Auth) {
  $scope.user = {};

  $scope.login = function(form) {
	  Auth.login('my secret', {
	      'username': $scope.user.username,
	      'password': $scope.user.password
	    },
	    function(err) {
	      if(err)
	      	console.log(err);
	    }
	  );
  };
});