(function (module) {
    'use strict';

    module.factory('commentsService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            byProject: function (project_id) {
                return $http.get('/api/comments?project_id=' + project_id);
            },

            byEvent: function (event_id) {
                return $http.get('/api/comments?project_id=' + event_id);
            },

            find: function (id) {
                return $http.get('/api/comments/' + id);
            },

            create: function (comment) {
                return $http.post('/api/comments', { 'data': comment });
            },

            update: function (id, comment) {
                return $http.put('/api/comments/' + id, { 'data': comment });
            }

        };

    }

})(angular.module('app'));