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
            },

            create: function (project) {
                return $http.post('/api/projects', project);
            },

            update: function (id, project) {
                return $http.put('/api/projects/' + id, project);
            }

        };

    }

})(angular.module('app'));