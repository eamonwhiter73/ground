'use strict';

angular.module('groundup')
  .factory('Auth', function Auth($location, $rootScope, Session, User, $cookieStore) {
    $rootScope.currentUser = $cookieStore.get('user') || null;
    $cookieStore.remove('user');
    $rootScope.currentUserSignedIn;

    return {

      login: function(provider, user, callback) {
        var cb = callback || angular.noop;
        Session.save({
          provider: provider,
          username: user.username,
          password: user.password,
          rememberMe: user.rememberMe
        }, function(user) {
          $rootScope.currentUser = user;
          //$rootScope.currentUserSignedIn = true;
          console.log($rootScope.currentUser);
          return cb();
        }, function(err) {
          //console.log(err);
          return cb(err.data);
        });
      },

      logout: function(callback) {
        var cb = callback || angular.noop;
        Session.delete(function(res) {
            $rootScope.currentUser = null;
            //$rootScope.currentUserSignedIn = false;
            return cb();
          },
          function(err) {
            return cb(err.data);
          });
      },

      createUser: function(userinfo, callback) {
        var cb = callback || angular.noop;
        console.log(userinfo);
        User.save(userinfo,
          function(user) {
            $rootScope.currentUser = user;
            //$rootScope.currentUserSignedIn = true;
            console.log($rootScope.currentUser);
            $location.path('/profile');
            return cb();
          }
        );
      },

      currentUser: function() {
        Session.get(function(user) {
          $rootScope.currentUser = user;
        });
      },

      changePassword: function(email, oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;
        User.update({
          email: email,
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
            console.log('password changed');
            return cb();
        }, function(err) {
            return cb(err.data);
        });
      },

      removeUser: function(email, password, callback) {
        var cb = callback || angular.noop;
        User.delete({
          email: email,
          password: password
        }, function(user) {
            console.log(user + 'removed');
            return cb();
        }, function(err) {
            return cb(err.data);
        });
      }
    };
  })