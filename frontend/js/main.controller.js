(function (module) {
    'use strict';

    module.controller('main', Controller);

    Controller.$inject = ['$scope', 'pike'];

    function Controller($scope, pike) {

        var vm               = this;
        vm.open_new_project  = open_new_project;
        vm.close_new_project = close_new_project;

        pike.bind($scope, function () {
            vm.route_action = arguments[1];
        });

        function open_new_project() {
            vm.is_new_project_open = true;
        }

        function close_new_project() {
            vm.is_new_project_open = false;
        }

    }

})(angular.module('app'));