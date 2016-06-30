(function (module) {
    'use strict';

    module.directive('taskDurationPicker', directive);

    function directive() {
        return {
            template:         '<select class="Form-control" ng-model="vm.task.duration" ng-options="duration.value as duration.label for duration in vm.durations" ng-change="vm.on_change_handler()" tabindex="2"></select>',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                task:     '=',
                onChange: '&?'
            },
            scope:            true
        };
    }

    function Controller() {

        var vm               = this;
        vm.on_change_handler = on_change_handler;
        vm.durations         = [
            { value: 15, label: '15 min' },
            { value: 30, label: '30 min' },
            { value: 60, label: '1 hr' },
            { value: 90, label: '1.5 hrs' },
            { value: 120, label: '2 hrs' },
            { value: 180, label: '3 hrs' },
            { value: 240, label: '4 hrs' },
            { value: 300, label: '5 hrs' },
            { value: 360, label: '6 hrs' },
            { value: 420, label: '7 hrs' },
            { value: 480, label: '8 hrs' },
            { value: 600, label: '10 hrs' },
            { value: 900, label: '15 hrs' },
            { value: 1800, label: '30 hrs' }, // (about a week)
            { value: 3600, label: '60 hrs' }, // (about 2 weeks)
            { value: 5400, label: '90 hrs' }, // (about 3 weeks)
            { value: 7200, label: '120 hrs' } // (about 4 weeks)
        ];

        function on_change_handler() {
            if (this.onChange) {
                this.onChange();
            }
        }

    }

})(angular.module('app'));