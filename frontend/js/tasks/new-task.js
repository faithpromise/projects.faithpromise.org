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

        var vm = this;
        vm.add = add;

        init();

        function init() {
            console.log('vm.project.id', vm.project);
            reset_task();
            fetch_agents();
            build_durations();
        }

        function fetch_agents() {
            agentsService.all().then(function (result) {
                vm.agents = result.data.data;
                reset_default_agent();
            });
        }

        function add() {
            vm.onSubmit();
            angular.extend(vm.task, { project_id: vm.project.id, agent_id: vm.selected_agent.id });
            tasksService.create(vm.task).then(function () {
                vm.onSuccess();
            });
            reset_task();
            reset_default_agent();
        }

        function reset_task() {
            vm.task = {
                duration: 60
            };
        }

        function build_durations() {
            vm.durations = [
                { value: 15, label: '15 min' },
                { value: 30, label: '30 min' },
                { value: 60, label: '1 hr' },
                { value: 90, label: '1.5 hrs' },
                { value: 120, label: '2 hrs' },
                { value: 180, label: '3 hrs' },
                { value: 240, label: '4 hrs' },
                { value: 300, label: '5 hrs' },
                { value: 360, label: '6 hrs' },
                { value: 420, label: '7 hrs' },
                { value: 480, label: '8 hrs' },
                { value: 600, label: '10 hrs' },
                { value: 900, label: '15 hrs' },
                { value: 1800, label: '30 hrs (about a week)' },
                { value: 3600, label: '60 hrs (about 2 weeks)' },
                { value: 5400, label: '90 hrs (about 3 weeks)' },
                { value: 7200, label: '120 hrs (about 4 weeks)' }
            ];
        }

        function reset_default_agent() {

            var selected_index  = 0,
                current_user_id = $auth.getPayload().sub;

            for (var i = 0; i <= vm.agents.length; i++) {
                if (vm.agents[i].id === current_user_id) {
                    selected_index = i;
                    break;
                }
            }

            vm.selected_agent = vm.agents[selected_index];

        }

    }

})(angular.module('app'), angular);