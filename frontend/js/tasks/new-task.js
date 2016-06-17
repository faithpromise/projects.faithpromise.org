(function (module, angular) {
    'use strict';

    module.directive('newTask', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/tasks/new-task.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {
                project:   '=',
                onSubmit:  '&',
                onSuccess: '&'
            }
        };
    }

    Controller.$inject = ['$auth', 'tasksService', 'agentsService'];

    function Controller($auth, tasksService, agentsService) {

        var vm              = this,
            default_agent;
        vm.add              = add;
        vm.on_agent_changed = on_agent_changed;

        init();

        function init() {
            vm.task = { project_id: vm.project.id };
            reset_task();
            get_default_agent();
        }

        function get_default_agent() {
            agentsService.find($auth.getPayload().sub).then(function (result) {
                console.log('result.data', result.data);
                default_agent = result.data.data;
                reset_agent();
            });
        }

        function add() {
            vm.onSubmit();
            tasksService.create(angular.copy(vm.task)).then(function () {
                vm.onSuccess();
            });
            reset_task();
            reset_agent();
        }

        function reset_task() {
            vm.task.name     = '';
            vm.task.duration = 60;
        }

        function reset_agent() {
            vm.task.agent_id = default_agent.id;
            vm.avatar_url    = default_agent.avatar_url;
        }

        function on_agent_changed(agent) {
            console.log('agent', agent);
            vm.task.agent_id = agent.id;
            vm.avatar_url    = agent.avatar_url;
        }

    }

})(angular.module('app'), angular);