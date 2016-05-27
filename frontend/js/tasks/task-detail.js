(function (module) {
    'use strict';

    module.directive('taskDetail', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/tasks/task-detail.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {
                // Passing in task for speediness
                _task:   '=task',
                onClose: '&'
            }
        };
    }

    Controller.$inject = ['$scope', 'tasksService', 'pike'];

    function Controller($scope, tasksService, pike) {

        var vm = this,
            id = pike.param('task_id');

        vm.loading      = false;
        vm.route_action = pike.bind($scope, 'contacts.detail', on_route_change);
        vm.close        = close;

        init();

        function close() {
            vm.onClose();
        }

        function init() {
            vm.task = angular.copy(vm._task);
            load_remote_data();
        }

        function load_remote_data() {
            vm.loading = true;
            tasksService.find(id).then(set_results);
        }

        function set_results(result) {
            vm.task    = result.data.data;
            vm.loading = false;
        }

        function on_route_change(event, nextAction) {
            vm.route_action = nextAction;
        }

    }

})(angular.module('app'));