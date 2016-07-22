(function (module, angular) {
    'use strict';

    module.directive('taskEditor', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/tasks/task-editor.html?v=1',
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

    Controller.$inject = ['tasksService'];

    function Controller(tasksService) {

        var vm = this;

        vm.loading          = false;
        vm.today            = new Date();
        vm.close            = close;
        vm.toggle_completed = toggle_completed;
        vm.set_due_at       = set_due_at;
        vm.set_start_at     = set_start_at;
        vm.set_completed_at = set_completed_at;
        vm.save_task        = save_task;
        vm.delete_task      = delete_task;

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

        function toggle_completed() {
            var value = vm.task.completed_at ? null : moment();
            set_completed_at(value);
        }

        function set_completed_at(value) {
            vm.task.completed_at = value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null;
        }

        function set_due_at(value) {
            vm.task.due_at = value ? moment(value).format('YYYY-MM-DD') : null;
        }

        function set_start_at(value) {
            vm.task.start_at = value ? moment(value).format('YYYY-MM-DD') : null;
        }

        function save_task() {
            tasksService.save(vm.task).then(function () {
                vm.onUpdate();
            });
        }

        function delete_task() {
            if (confirm('Are you sure you want to delete this task?')) {
                tasksService.delete(vm.task).then(function () {
                    vm.onUpdate();
                });
            }
        }

    }

})(angular.module('app'), angular);