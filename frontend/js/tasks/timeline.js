(function (module, moment) {
    'use strict';

    module.directive('timeline', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/tasks/timeline.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {}
        };
    }

    Controller.$inject = ['timelineService', 'projectsService'];

    function Controller(timelineService, projectsService) {

        var vm = this;
        vm.get_duration = get_duration;

        init();

        function init() {
            timelineService.all().then(function(result) {
                vm.agents = result.data.data;
            });
        }

        function get_duration(min) {
            var duration = moment.duration(min, 'minutes');
            return duration.humanize();
        }

    }

})(angular.module('app'), moment);