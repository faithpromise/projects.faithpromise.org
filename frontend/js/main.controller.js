(function (module) {
    'use strict';

    module.controller('main', Controller);

    Controller.$inject = ['$scope', 'pike'];

    function Controller($scope, pike) {

        var vm = this;

        pike.bind($scope, function () {
            vm.route_action = arguments[1];
        });
    }

})(angular.module('app'));