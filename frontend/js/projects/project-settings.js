(function (module) {
    'use strict';

    module.directive('projectSettings', directive);
    module.controller('ProjectModalController', ProjectModalController);

    function directive() {
        return {
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                project: '=?',
                onClose: '&'
            },
            scope:            {}
        };
    }

    Controller.$inject = ['$uibModal'];

    function Controller($uibModal) {

        var vm = this;

        init();

        function init() {

            vm.project = vm.project || {};

            var modal_instance = $uibModal.open({
                templateUrl:      '/build/js/projects/project-settings.html',
                controller:       ProjectModalController,
                controllerAs:     'vm',
                bindToController: true,
                animation:        false,
                backdrop:         'static',
                backdropClass:    'FullModal-backdrop',
                windowClass:      'FullModal',
                resolve:          {
                    project: function () {
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

    ProjectModalController.$inject = ['$scope', '$uibModalInstance', 'project', 'projectsService'];

    function ProjectModalController($scope, $uibModalInstance, project, projectsService) {

        var vm        = this;
        vm.set_due_at = set_due_at;
        vm.project    = project;
        vm.requester  = vm.project.requester ? vm.project.requester : { name: 'Bradley' };
        vm.save       = save;

        function set_due_at(value) {
            console.log('setting due date');
            vm.project.due_at = value ? moment(value).format('YYYY-MM-DD') : null;
        }

        function save() {
            projectsService.create(vm.project);
        }

    }

})(angular.module('app'));