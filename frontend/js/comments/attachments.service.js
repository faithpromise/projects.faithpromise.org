(function (module) {
    'use strict';

    module.factory('attachmentsService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            byComment: function (comment_id) {
                return $http.get('/api/attachments?comment_id=' + comment_id);
            },

            delete: function (id) {
                return $http.delete('/api/attachments/' + id);
            }

        };

    }

})(angular.module('app'));