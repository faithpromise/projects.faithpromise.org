(function(module) {
    'use strict';

    module.factory('timelineService', service);

    service.$inject = ['$http'];

    function service($http) {

        return {

            byAgent: function(agent_id) {
                return $http.get('/api/timeline?agent_id=' + agent_id);
            }

        };

    }

})(angular.module('app'));