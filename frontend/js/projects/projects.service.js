(function(module) {
    'use strict';

    module.factory('projectsService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            all: function() {
                return $http.get('/api/projects');
            },

            find: function(id) {
                return $http.get('/api/projects/' + id);
            }

        };

    }

})(angular.module('app'));