(function (module, moment) {
    'use strict';

    module.directive('agentTimeline', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/timeline/agent-timeline.html',
            restrict:         'A',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                agent: '='
            },
            scope:            true
        };
    }

    Controller.$inject = ['$location', 'timelineService', 'projectsService'];

    function Controller($location, timelineService, projectsService) {

        var vm             = this;
        vm.jump_to_project = jump_to_project;

        init();

        function init() {
            timelineService.byAgent(vm.agent.id).then(function (result) {
                vm.timeline_days = result.data.data;
            });

            projectsService.getPending(vm.agent.id).then(function (result) {
                vm.projects = result.data.data;
            });
        }

        function jump_to_project(project) {
            $location.url('/projects/' + project.id);
        }

    }

})(angular.module('app'), moment);