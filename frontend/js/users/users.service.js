(function(module) {
    'use strict';

    module.factory('usersService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            all: function() {
                return $http.get('/api/users');
            },

            search: function(name) {
                return $http.get('/api/users?name=' + name);
            },

            find: function(id) {
                return $http.get('/api/users/' + id);
            }

        };

    }

})(angular.module('app'));