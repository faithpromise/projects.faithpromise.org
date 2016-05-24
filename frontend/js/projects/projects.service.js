(function(module) {
    'use strict';

    module.factory('agentsService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            all: function() {
                return $http.get('/api/agents');
            }

        };

    }

})(angular.module('app'));