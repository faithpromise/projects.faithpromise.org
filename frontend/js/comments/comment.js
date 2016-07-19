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

    Controller.$inject = ['$sce'];

    function Controller($sce) {

        var vm = this;

        init();

        function init() {
            vm.comment.html_body = $sce.trustAsHtml(vm.comment.html_body);
        }

    }

})(angular.module('app'));