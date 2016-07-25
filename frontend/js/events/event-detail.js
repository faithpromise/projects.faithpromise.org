(function (module) {
    'use strict';

    module.directive('eventDetail', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/events/event-detail.html?v=2',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {}
        };
    }

    Controller.$inject = ['$routeParams', 'eventsService'];

    function Controller($routeParams, eventsService) {

        var vm = this;

        init();

        function init() {
            eventsService.find($routeParams.id).then(function (result) {
                vm.event = result.data.data;
            });
        }

    }

})(angular.module('app'));