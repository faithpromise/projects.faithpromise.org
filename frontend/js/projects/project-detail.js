(function (module) {
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

    Controller.$inject = ['$routeParams', 'projectsService'];

    function Controller($routeParams, projectsService) {

        var vm = this;

        init();

        function init() {
            projectsService.find($routeParams.id).then(function (result) {
                vm.project = result.data.data;
            });
        }

    }

})(angular.module('app'));