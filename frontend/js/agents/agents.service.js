(function(module) {
    'use strict';

    module.factory('agentsService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            all: function() {
                return $http.get('/api/agents');
            },

            search: function(name) {
                return $http.get('/api/agents?name=' + name);
            },

            find: function(id) {
                return $http.get('/api/agents/' + id);
            }

        };

    }

})(angular.module('app'));