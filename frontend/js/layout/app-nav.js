(function (module) {
    'use strict';

    module.directive('appNav', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/layout/app-nav.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {}
        };
    }

    Controller.$inject = [];

    function Controller() {

        var vm = this;

        init();

        function init() {

        }

    }

})(angular.module('app'));