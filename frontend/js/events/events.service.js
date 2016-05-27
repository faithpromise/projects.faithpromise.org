(function(module) {
    'use strict';

    module.factory('eventsService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            all: function() {
                return $http.get('/api/events');
            },

            find: function(id) {
                return $http.get('/api/events/' + id);
            }

        };

    }

})(angular.module('app'));