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
            project_notes_timeout = null;

        vm.route_action        = pike.bind($scope, 'project', on_route_change);
        vm.new_task            = {};
        vm.open_task           = open_task;
        vm.on_task_closed      = on_task_closed;
        vm.on_task_updated     = on_task_updated;
        vm.on_task_submitted   = on_task_submitted;
        vm.on_task_added       = on_task_added;
        vm.mark_task_completed = mark_task_completed;
        vm.remove_recipient    = remove_recipient;
        vm.save_recipients     = save_recipients;

        init();

        function init() {
            refresh();
        }

        function refresh() {
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
            vm.tasks = null;
            return tasksService.byProject($routeParams.id).then(function (result) {
                vm.tasks = result.data.data;
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
            var data                = { notes: vm.project.notes };
            vm.project_notes_saving = true;
            projectsService.update($routeParams.id, data).then(function () {
                vm.project_notes_saving = false;
            });
        }

        function auto_save_project_notes(newVal, oldVal) {
            if (typeof newVal !== 'undefined' && typeof oldVal !== 'undefined' && newVal != oldVal) {
                if (project_notes_timeout) {
                    $timeout.cancel(project_notes_timeout)
                }
                project_notes_timeout = $timeout(save_project_notes, 1000);  // 1000 = 1 second
            }
        }

        function on_task_submitted() {
            vm.tasks = null;
        }

        function on_task_added() {
            refresh();
        }

        function open_task(task) {
            vm.selected_task = task;
            $location.url('/projects/' + vm.project.id + '/tasks/' + task.id);
        }

        function on_task_updated() {
            refresh();
        }

        function on_task_closed() {
            $location.url('/projects/' + vm.project.id);
        }

        function on_route_change(event, next_action) {
            vm.route_action = next_action;
        }

        function mark_task_completed(task) {
            update_task(task, { completed_at: moment().format() });
        }

        function update_task(task, data) {
            task.saving = true;
            data.id     = task.id;
            tasksService.update(data).then(function () {
                delete task.saving;
                angular.extend(task, data);
                fetchProject();
            });
        }

        $scope.$watch('vm.project.notes', auto_save_project_notes);

    }

})(angular.module('app'), angular, moment);