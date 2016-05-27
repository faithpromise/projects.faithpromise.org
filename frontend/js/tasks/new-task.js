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

    Controller.$inject = ['tasksService', 'agentsService'];

    function Controller(tasksService, agentsService) {

        var vm  = this;
        vm.task = {};
        vm.add  = add;

        init();

        function init() {
            agentsService.all().then(function(result) {
                vm.agents = result.data.data;
            });
        }

        function add() {
            vm.onSubmit();
            angular.extend(vm.task, { project_id: vm.project.id });
            tasksService.create(vm.task).then(function () {
                vm.onSuccess();
            });
            vm.task = {};
        }

    }

})(angular.module('app'), angular);