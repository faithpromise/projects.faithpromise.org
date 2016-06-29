(function (module, angular) {
    'use strict';

    module.directive('projectEditor', directive);
    module.controller('ProjectModalController', ProjectModalController);

    function directive() {
        return {
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                project:  '=?',
                onUpdate: '&',
                onClose:  '&'
            },
            scope:            {}
        };
    }

    Controller.$inject = ['$uibModal'];

    function Controller($uibModal) {

        var vm = this,
            modal_instance;

        init();

        function init() {

            vm.project = vm.project || {};

            modal_instance = $uibModal.open({
                templateUrl:      '/build/js/projects/project-editor.html',
                controller:       ProjectModalController,
                controllerAs:     'vm',
                bindToController: true,
                animation:        false,
                keyboard:         false,
                backdrop:         'static',
                backdropClass:    'Modal-backdrop',
                windowClass:      'Modal',
                resolve:          {
                    orig_project: function () {
                        return vm.project;
                    }
                }
            });

            modal_instance.closed.then(
                function () {
                    vm.onClose ? vm.onClose() : null;
                }
            );

        }

    }

    ProjectModalController.$inject = ['$scope', '$uibModalInstance', 'orig_project', 'projectsService'];

    function ProjectModalController($scope, $uibModalInstance, orig_project, projectsService) {

        var vm        = this;
        vm.project    = angular.copy(orig_project);
        vm.today      = new Date();
        vm.requester  = vm.project.requester ? vm.project.requester : { name: 'Bradley' };
        vm.is_saving  = false;
        vm.set_due_at = set_due_at;
        vm.save       = save;
        vm.close      = close;

        vm.pikaday_due_at = function (pikaday) {
            pikaday.setMaxDate(new Date());
        };

        function set_due_at(value) {
            console.log('setting due date');
            vm.project.due_at = value ? moment(value).format('YYYY-MM-DD') : null;
        }

        function save() {
            vm.is_saving = true;
            projectsService.save(vm.project).then(function () {
                if (vm.project.id) {
                    projectsService.find(vm.project.id).then(function (result) {
                        angular.extend(orig_project, result.data.data);
                        $uibModalInstance.close();
                    });
                } else {
                    $uibModalInstance.close();
                }
            });
        }

        function close() {
            $uibModalInstance.dismiss();
        }

    }

})(angular.module('app'), angular);