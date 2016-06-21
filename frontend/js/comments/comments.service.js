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

            save: function (comment) {
                if (comment.id) {
                    return $http.put('/api/comments/' + comment.id, { 'data': comment });
                } else {
                    return $http.post('/api/comments', { 'data': comment });
                }
            }

        };

    }

})(angular.module('app'));