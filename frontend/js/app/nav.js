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
            scope:            {
                onShowNewProject: '&'
            }
        };
    }

    Controller.$inject = ['$auth', '$location'];

    function Controller($auth, $location) {

        var vm              = this;
        vm.logout           = logout;
        vm.show_new_project = show_new_project;

        init();

        function init() {

        }

        function logout() {
            $auth.logout();
            $location.path('/login');
        }

        function show_new_project() {
            console.log('calling callback');
            vm.onShowNewProject();
        }

    }

})(angular.module('app'));