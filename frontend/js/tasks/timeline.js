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

    Controller.$inject = ['timelineService'];

    function Controller(timelineService) {

        var vm = this;
        vm.get_duration = get_duration;

        init();

        function init() {
            timelineService.all().then(function(result) {
                vm.agents = result.data.data;
            });

            vm.days = create_days();
        }

        function create_days() {
            var dates = [],
                today = moment().startOf('day');
            for (var i = 0; i < 30; i++) {
                dates.push(today.clone().add(i, 'days'));
            }
            return dates;
        }

        function get_duration(min) {
            var duration = moment.duration(min, 'minutes');
            return duration.humanize();
        }

    }

})(angular.module('app'), moment);