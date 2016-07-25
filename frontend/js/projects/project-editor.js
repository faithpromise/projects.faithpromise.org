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

            vm.project            = vm.project || {};
            vm.project.recipients = vm.project.recipients || [];

            modal_instance = $uibModal.open({
                templateUrl:      '/build/js/projects/project-editor.html?v=2',
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

    ProjectModalController.$inject = ['$scope', '$location', '$uibModalInstance', 'orig_project', 'projectsService'];

    function ProjectModalController($scope, $location, $uibModalInstance, orig_project, projectsService) {

        var vm                  = this;
        vm.project              = angular.copy(orig_project);
        vm.today                = new Date();
        vm.is_saving            = false;
        vm.set_due_at           = set_due_at;
        vm.save                 = save;
        vm.close                = close;
        vm.on_agent_changed     = add_recipient;
        vm.on_requester_changed = add_recipient;

        vm.pikaday_due_at = function (pikaday) {
            pikaday.setMaxDate(new Date());
        };

        function set_due_at(value) {
            console.log('setting due date');
            vm.project.due_at = value ? moment(value).format('YYYY-MM-DD') : null;
        }

        function add_recipient(user) {
            if (!has_recipient(user)) {
                vm.project.recipients.push(user);
            }
        }

        function has_recipient(user) {
            for (var i = 0; i < vm.project.recipients.length; i++) {
                if (vm.project.recipients[i].id == user.id) {
                    return true;
                }
            }
            return false;
        }

        function save(projectForm) {
            vm.is_form_submitted = true;
            if (projectForm.$invalid || !vm.project.due_at || !vm.project.requester || !vm.project.agent) {
                console.log('projectForm.$invalid', projectForm.$invalid);
                return false;
            }
            vm.is_saving = true;
            projectsService.save(vm.project).then(function (result) {
                if (vm.project.id) {
                    projectsService.find(vm.project.id).then(function (result) {
                        angular.extend(orig_project, result.data.data);
                        $uibModalInstance.close();
                    });
                } else {
                    $location.url('/projects/' + result.data.data.id);
                    $uibModalInstance.close();
                }
            });
        }

        function close() {
            $uibModalInstance.dismiss();
        }

    }

})(angular.module('app'), angular);