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

            search: function (params) {
                console.log('searching');
                return $http.get('/api/projects', params);
            },

            save: function (project) {
                if (project.id) {
                    return $http.put('/api/projects/' + project.id, { 'data': project });
                } else {
                    return $http.post('/api/projects', { 'data': project });
                }
            },

            save_recipients: function (id, data) {
                return $http.put('/api/projects/' + id + '/recipients', { data: data });
            }

        };

    }

})(angular.module('app'));