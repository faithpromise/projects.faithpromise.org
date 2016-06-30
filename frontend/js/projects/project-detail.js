(function (module, angular) {
    'use strict';

    module.directive('projectDetail', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/projects/project-detail.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {}
        };
    }

    Controller.$inject = ['$scope', '$timeout', '$routeParams', '$location', 'projectsService', 'tasksService', 'pike'];

    function Controller($scope, $timeout, $routeParams, $location, projectsService, tasksService, pike) {

        var vm                    = this,
            project_notes_timeout = null,
            project_notes_watcher;

        vm.is_editing          = false;
        vm.tasks_loading       = false;
        vm.task_saving         = false;
        // vm.route_action        = pike.bind($scope, 'project', on_route_change);
        vm.new_task            = {};
        vm.open_task           = open_task;
        vm.on_task_closed      = on_task_closed;
        vm.on_task_updated     = on_task_updated;
        vm.on_task_submitted   = on_task_submitted;
        vm.on_task_added       = on_task_added;
        vm.mark_task_completed = mark_task_completed;
        vm.remove_recipient    = remove_recipient;
        vm.save_recipients     = save_recipients;
        vm.on_editor_closed    = on_editor_closed;
        vm.open_editor         = open_editor;

        init();

        function init() {
            load_remote_data();
        }

        function load_remote_data() {
            fetchProject();
            fetchTasks();
        }

        function fetchProject() {
            return projectsService.find($routeParams.id).then(function (result) {
                // If project is reset, some directives will be re-initialized (<comments ng-if="vm.project">)
                if (vm.project) {
                    angular.extend(vm.project, result.data.data);
                } else {
                    vm.project = result.data.data;
                }
            });
        }

        function fetchTasks() {
            vm.tasks_loading = true;
            return tasksService.byProject($routeParams.id).then(function (result) {
                vm.tasks         = result.data.data;
                vm.tasks_loading = false;
            });
        }

        function save_recipients() {
            var data = gather_recipient_ids();
            projectsService.save_recipients($routeParams.id, data);
        }

        function remove_recipient(user) {
            for (var i = vm.project.recipients.length - 1; i >= 0; i--) {
                if (vm.project.recipients[i].id == user.id) {
                    vm.project.recipients.splice(i, 1);
                }
            }
            save_recipients();
        }

        function gather_recipient_ids() {
            var results = [];
            for (var i = 0; i < vm.project.recipients.length; i++) {
                results.push(vm.project.recipients[i].id);
            }
            return results;
        }

        function save_project_notes() {
            var data                = { id: vm.project.id, notes: vm.project.notes };
            vm.project_notes_saving = true;
            projectsService.save(data).then(function () {
                vm.project_notes_saving = false;
            });
        }

        function auto_save_project_notes(newVal, oldVal) {
            console.log('oldVal', oldVal);
            console.log('newVal', newVal);
            if (typeof newVal !== 'undefined' && typeof oldVal !== 'undefined' && newVal != oldVal) {
                if (project_notes_timeout) {
                    $timeout.cancel(project_notes_timeout)
                }
                project_notes_timeout = $timeout(save_project_notes, 1000);  // 1000 = 1 second
            }
        }

        function on_task_submitted() {
            vm.tasks_loading = true;
        }

        function on_task_added() {
            load_remote_data();
        }

        function open_task(task) {
            vm.selected_task = task;
        }

        function on_task_updated() {
            load_remote_data();
        }

        function on_task_closed() {
            vm.selected_task = null;
        }

        function mark_task_completed(task, event) {

            event.stopPropagation();

            update_task(task, { completed_at: moment().format() });
        }

        function update_task(task, data) {
            vm.task_saving = true;
            data.id        = task.id;
            tasksService.update(data).then(function () {
                vm.task_saving = false;
                angular.extend(task, data);
                fetchProject();
            });
        }

        function open_editor() {
            vm.is_editing = true;
        }

        function on_editor_closed() {
            vm.is_editing = false;
        }

    }

})(angular.module('app'), angular, moment);