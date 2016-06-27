(function (module) {
    'use strict';

    module.directive('agentPicker', directive);

    function directive() {
        return {
            template:         '<select ng-class="vm.cssClass" ng-attr-tabindex="{{ vm.tabIndex }}" ng-model="vm.agent" ng-options="agent.name for agent in vm.agents" ng-change="vm.on_change_handler()" tabindex="2"></select>',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                cssClass: '@',
                tabIndex: '@',
                onChange: '&?'
            },
            scope:            true
        };
    }

    Controller.$inject = ['agentsService'];

    function Controller(agentsService) {

        var vm               = this;
        vm.on_change_handler = on_change_handler;

        init();

        function init() {
            fetch_agents();
        }

        function fetch_agents() {
            agentsService.all().then(function (result) {
                vm.agents = result.data.data;
            });
        }

        function on_change_handler() {
            if (this.onChange) {
                this.onChange({
                    agent: vm.agent
                });
            }
        }

    }

})(angular.module('app'));