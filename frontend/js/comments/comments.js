(function (module) {
    'use strict';

    module.directive('comments', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/comments/comments.html?v=2',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                project: '='
            },
            scope:            true
        };
    }

    Controller.$inject = ['$scope', 'PubSub', 'commentsService'];

    function Controller($scope, PubSub, commentsService) {

        var vm = this;

        // init();

        function init() {
            show_loading();
            load_comments();
        }

        function show_loading() {
            vm.loading = true;
        }

        function hide_loading() {
            vm.loading = false;
        }

        function comment_adding() {
            show_loading();
        }

        function comment_added() {
            load_comments();
        }

        function load_comments() {
            return commentsService.byProject(vm.project.id).then(function (result) {
                vm.comments = result.data.data;
                hide_loading();
            });
        }

        $scope.$watch('vm.project', function (old_val, new_val) {
            if (new_val) {
                init();
            }
        });


        PubSub.subscribe('comment.creating', comment_adding);
        PubSub.subscribe('comment.updating', comment_adding);
        PubSub.subscribe('comment.deleting', comment_adding);

        PubSub.subscribe('comment.created', comment_added);
        PubSub.subscribe('comment.updated', comment_added);
        PubSub.subscribe('comment.deleted', comment_added);

    }

})(angular.module('app'));