(function (module) {
    'use strict';

    module.factory('projectsService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            all: function () {
                return $http.get('/api/projects');
            },

            find: function (id) {
                return $http.get('/api/projects/' + id);
            },

            create: function (project) {
                return $http.post('/api/projects', { 'data': project });
            },

            update: function (id, project) {
                return $http.put('/api/projects/' + id, project);
            },

            save_recipients: function (id, data) {
                return $http.put('/api/projects/' + id + '/recipients', { data: data });
            }

        };

    }

})(angular.module('app'));