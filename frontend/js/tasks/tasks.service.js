(function(module) {
    'use strict';

    module.factory('tasksService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            create: function(task) {
                return $http.post('/api/tasks', { 'data': task });
            },

            find: function(id) {
                return $http.get('/api/tasks/' + id);
            },

            byProject: function (project_id) {
                return $http.get('/api/tasks?project_id=' + project_id);
            }

        };

    }

})(angular.module('app'));