(function (module, angular) {
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
                _task:    '=task',
                onClose:  '&',
                onUpdate: '&?'
            }
        };
    }

    Controller.$inject = ['$scope', '$timeout', 'tasksService'];

    function Controller($scope, $timeout, tasksService) {

        var vm                = this,
            task_save_timeout = null;

        vm.loading             = false;
        vm.close               = close;
        vm.toggle_completed    = toggle_completed;
        vm.set_due_at          = set_due_at;
        vm.set_start_at        = set_start_at;
        vm.on_agent_changed    = on_agent_changed;
        vm.on_duration_changed = on_duration_changed;

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
            tasksService.find(vm.task.id).then(function (result) {
                vm.task    = angular.extend(vm.task, result.data.data);
                vm.loading = false;
            });
        }

        function on_agent_changed() {
            save_task();
        }

        function on_duration_changed() {
            save_task();
        }

        function toggle_completed() {
            var value = vm.task.completed_at ? null : moment();
            set_completed_at(value);
        }

        function set_completed_at(value) {
            vm.task.completed_at = value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null;
            save_task();
        }

        function set_due_at(value) {
            vm.task.due_at = value ? moment(value).format('YYYY-MM-DD') : null;
            save_task();
        }

        function set_start_at(value) {
            vm.task.start_at = value ? moment(value).format('YYYY-MM-DD') : null;
            save_task();
        }

        function save_task() {
            tasksService.update(vm.task).then(function () {
                vm.onUpdate();
            });
        }

        function auto_save_task(newVal, oldVal) {
            if (typeof newVal !== 'undefined' && typeof oldVal !== 'undefined' && newVal != oldVal) {
                if (task_save_timeout) {
                    $timeout.cancel(task_save_timeout)
                }
                task_save_timeout = $timeout(save_task, 1000);  // 1000 = 1 second
            }
        }

        $scope.$watch('vm.task.name', auto_save_task);
        $scope.$watch('vm.task.notes', auto_save_task);

    }

})(angular.module('app'), angular);