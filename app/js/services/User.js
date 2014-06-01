'use strict';

angular.module('groundup')
  .factory('User', function ($resource, $location) {
    return $resource('/auth/users/', {},
      {
        'update': {
          method:'PUT'
        },
      });
  });
