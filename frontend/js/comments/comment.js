(function (module) {
    'use strict';

    module.directive('comment', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/comments/comment.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                comment: '='
            },
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