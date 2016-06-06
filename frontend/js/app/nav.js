(function (module) {
    'use strict';

    module.directive('appNav', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/app/nav.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {}
        };
    }

    Controller.$inject = ['$auth', '$location'];

    function Controller($auth, $location) {

        var vm = this;
        vm.logout = logout;

        init();

        function init() {

        }

        function logout() {
            $auth.logout();
            $location.path('/login');
        }

    }

})(angular.module('app'));