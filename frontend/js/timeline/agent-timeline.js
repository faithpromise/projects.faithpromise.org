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

    Controller.$inject = ['timelineService', 'projectsService'];

    function Controller(timelineService, projectsService) {

        var vm          = this;
        vm.get_duration = get_duration;

        init();

        function init() {
            timelineService.byAgent(vm.agent.id).then(function (result) {
                vm.timeline_days = result.data.data;
            });

            projectsService.getPending(vm.agent.id).then(function (result) {
                vm.projects = result.data.data;
            });
        }

        function get_duration(min) {
            var duration = moment.duration(min, 'minutes');
            return duration.humanize();
        }

    }

})(angular.module('app'), moment);