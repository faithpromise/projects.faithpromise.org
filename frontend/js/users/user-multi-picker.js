(function (module) {
    'use strict';

    module.directive('userMultiPicker', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/users/user-multi-picker.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                selected:      '=',
                placeholder:   '@',
                tabIndex:      '@',
                limitToAgents: '@?',
                onChange:      '&?'
            },
            scope:            {}
        };
    }

    Controller.$inject = [];

    function Controller() {

        var vm         = this;
        vm.onChange    = onChange;
        vm.remove_user = remove_user;

        init();

        function init() {
            vm.placeholder = vm.placeholder || 'search for a user...';
            vm.tabIndex    = vm.tabIndex || 1;
        }

        function add_user(user) {
            if (!has_user(user)) {
                vm.selected.push(user);
            }
        }

        function has_user(user) {
            for (var i = 0; i < vm.selected.length; i++) {
                if (vm.selected[i].id == user.id) {
                    return true;
                }
            }
            return false;
        }

        function remove_user(user) {
            for (var i = vm.selected.length - 1; i >= 0; i--) {
                if (vm.selected[i].id == user.id) {
                    vm.selected.splice(i, 1);
                }
            }
        }

        function onChange(user) {
            add_user(user);
        }

    }

})(angular.module('app'));