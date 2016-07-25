(function (module) {
    'use strict';

    module.directive('timeline', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/timeline/timeline.html?v=2',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {}
        };
    }

    Controller.$inject = ['agentsService'];

    function Controller(agentsService) {

        var vm = this;

        init();

        function init() {
            agentsService.all().then(function(result) {
                vm.agents = result.data.data;
            });
        }

    }

})(angular.module('app'));