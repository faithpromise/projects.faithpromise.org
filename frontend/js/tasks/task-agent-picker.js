(function (module) {
    'use strict';

    module.directive('taskAgentPicker', directive);

    function directive() {
        return {
            template:         '<select class="CustomSelect-control" ng-model="vm.task.agent_id" ng-options="agent.id as agent.name for agent in vm.agents" ng-change="vm.on_change_handler()" tabindex="2"></select>',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                task:     '=',
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
            var agent = get_selected_agent();
            if (this.onChange) {
                this.onChange({
                    agent: agent
                });
            }
        }

        function get_selected_agent() {
            for (var i = 0; i <= vm.agents.length; i++) {
                if (vm.agents[i].id == vm.task.agent_id) {
                    return vm.agents[i];
                }
            }
            return null;
        }

    }

})(angular.module('app'));