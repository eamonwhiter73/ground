'use strict';

angular.module('groundup')
  .factory('Session', function ($resource) {
    return $resource('/auth/session/');
  });
