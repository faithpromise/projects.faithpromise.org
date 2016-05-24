(function(module) {
    'use strict';

    module.factory('timelineService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            all: function() {
                return $http.get('/api/timeline');
            }

        };

    }

})(angular.module('app'));