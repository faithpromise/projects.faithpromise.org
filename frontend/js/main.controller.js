(function (module) {
    'use strict';

    module.controller('main', Controller);

    Controller.$inject = ['$rootScope', '$location'];

    function Controller($rootScope, $location) {

        var vm               = this;
        vm.open_new_project  = open_new_project;
        vm.close_new_project = close_new_project;

        function open_new_project() {
            vm.is_new_project_open = true;
        }

        function close_new_project() {
            vm.is_new_project_open = false;
        }

        function check_nav_visibility() {
            vm.is_nav_visible = $location.path() !== '/login';
        }

        $rootScope.$on('$routeChangeSuccess', check_nav_visibility);

    }

})(angular.module('app'));