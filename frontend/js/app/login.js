(function (module) {
    'use strict';

    module.directive('appLogin', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/app/login.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {}
        };
    }

    Controller.$inject = ['$rootScope', '$auth', '$location'];

    function Controller($rootScope, $auth, $location) {

        var vm   = this;
        vm.login = login;

        init();

        function init() {

        }

        function login() {

            var credentials = {
                email:    $rootScope.user_email,
                password: vm.password
            };

            $auth.login(credentials).then(function (data) {
                // If login is successful, redirect to the users state
                $location.path('/');
            }).catch(function() {
                // TODO: alert of unsuccessful login
            });

        }

    }

})(angular.module('app'));