(function (module, angular) {
    'use strict';

    module.directive('projectDetail', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/projects/project-detail.html?v=2',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {}
        };
    }

    Controller.$inject = ['$scope', '$timeout', '$routeParams', 'projectsService', 'tasksService', 'Upload'];

    function Controller($scope, $timeout, $routeParams, projectsService, tasksService, Upload) {

        var vm                    = this,
            project_notes_timeout = null;

        vm.is_editing            = false;
        vm.tasks_loading         = false;
        vm.task_saving           = false;
        // vm.route_action        = pike.bind($scope, 'project', on_route_change);
        vm.show_new_task         = show_new_task;
        vm.open_task             = open_task;
        vm.on_task_closed        = on_task_closed;
        vm.on_task_updated       = on_task_updated;
        vm.mark_task_completed   = mark_task_completed;
        vm.on_editor_closed      = on_editor_closed;
        vm.open_editor           = open_editor;
        vm.incompleteTasksFilter = incompleteTasksFilter;
        vm.completedTasksFilter  = completedTasksFilter;
        vm.upload                = upload;
        vm.close_project         = close_project;
        vm.reopen_project        = reopen_project;

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

                vm.uploading_thumb = false;
                vm.closing_project = false;
            });
        }

        function fetchTasks() {
            vm.tasks_loading = true;
            return tasksService.byProject($routeParams.id).then(function (result) {
                vm.tasks         = result.data.data;
                vm.tasks_loading = false;
            });
        }

        function save_project_notes() {
            var data                = { id: vm.project.id, notes: vm.project.notes };
            vm.project_notes_saving = true;
            projectsService.save(data).then(function () {
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

        function show_new_task() {
            vm.selected_task = {
                project_id: vm.project.id,
                agent:      vm.project.agent
            };
        }

        function open_task(task) {
            vm.selected_task = task;
        }

        function on_task_updated() {
            vm.selected_task = null;
            load_remote_data();
        }

        function on_task_closed() {
            vm.selected_task = null;
        }

        function mark_task_completed(task, event) {

            event.stopPropagation();

            update_task(task, { completed_at: moment().format('YYYY-MM-DD HH:mm:ss') });
        }

        function update_task(task, data) {
            vm.task_saving = true;
            data.id        = task.id;
            tasksService.save(data).then(function () {
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
            // Task dates could be changed if due date was changed
            fetchTasks();
        }

        function incompleteTasksFilter(task) {
            return task.completed_at === null;
        }

        function completedTasksFilter(task) {
            return task.completed_at !== null;
        }

        function upload(files) {

            if (files.length === 0) {
                return;
            }

            vm.uploading_thumb = true;

            Upload.upload({
                url:  '/api/projects/' + vm.project.id + '/thumb',
                data: {
                    file: files
                }
            }).then(
                fetchProject
            );

        }

        function close_project() {

            if (vm.project.has_thumb || confirm('Are you sure you want to close the project without uploading a mockup?')) {

                vm.closing_project = true;
                projectsService.save({
                    id:        vm.project.id,
                    closed_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }).then(fetchProject);

            }
        }

        function reopen_project() {
            vm.closing_project = true;
            projectsService.save({
                id:        vm.project.id,
                closed_at: null
            }).then(fetchProject);
        }

        $scope.$watch('vm.project.notes', auto_save_project_notes);

    }

})(angular.module('app'), angular, moment);