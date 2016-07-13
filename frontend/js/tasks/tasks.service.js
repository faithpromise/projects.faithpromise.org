(function (module) {
    'use strict';

    module.factory('tasksService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            find: function (id) {
                return $http.get('/api/tasks/' + id);
            },

            save: function (task) {
                if (task.id) {
                    return $http.put('/api/tasks/' + task.id, { 'data': task });
                }
                return $http.post('/api/tasks', { 'data': task });
            },

            delete: function (task) {
                return $http.delete('/api/tasks/' + task.id, { 'data': task });
            },

            byProject: function (project_id) {
                return $http.get('/api/tasks?project_id=' + project_id);
            }

        };

    }

})(angular.module('app'));