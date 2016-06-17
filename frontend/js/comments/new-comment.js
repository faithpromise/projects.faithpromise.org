(function (module, angular) {
    'use strict';

    module.directive('newComment', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/comments/new-comment.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {
                event:              '=?',
                project:            '=?',
                default_recipients: '='
            }
        };
    }

    Controller.$inject = ['$auth', 'PubSub', 'commentsService', 'agentsService'];

    function Controller($auth, PubSub, commentsService, agentsService) {

        var vm                 = this,
            subject_overridden = false,
            default_sender;
        vm.comment             = { user_id: $auth.getPayload().sub };
        vm.auto_subject        = auto_subject;
        vm.remove_recipient    = remove_recipient;
        vm.save_comment        = save_comment;

        init();

        function init() {
            get_default_sender();
        }

        function get_default_sender() {
            agentsService.find($auth.getPayload().sub).then(function (result) {
                default_sender = result.data.data;
                reset();
            });
        }

        function reset() {
            vm.comment.body    = '';
            vm.comment.subject = 'New Comment';
            vm.recipients      = vm.default_recipients ? angular.copy(vm.default_recipients) : angular.copy(vm.project.recipients);
            vm.sender          = default_sender;
        }

        function auto_subject() {
            var max = 25,
                ellipses = vm.comment.body.length > max ? '...' : '',
                default_subject = vm.comment.body.substring(0, max) + ellipses;

            if (vm.subject_overridden && vm.comment.subject.length) {
                return;
            }

            vm.comment.subject = vm.comment.body.length === 0 ? 'New Comment' : default_subject;
        }

        function remove_recipient(user) {
            for (var i = vm.recipients.length - 1; i >= 0; i--) {
                if (vm.recipients[i].id == user.id) {
                    vm.recipients.splice(i, 1);
                }
            }
        }

        function gather_recipients() {
            var results = [];

            for (var i = 0; i < vm.recipients.length; i++) {
                results.push(vm.recipients[i].id);
            }

            return results;
        }

        function save_comment() {

            var comment = angular.extend({
                    user_id:    vm.sender.id,
                    event_id:   vm.event ? vm.event.id : null,
                    project_id: vm.project ? vm.project.id : null,
                    recipients: gather_recipients()
                }, vm.comment
            );

            PubSub.publish('comment.creating', comment);

            commentsService.create(comment).then(function () {
                // vm.onSuccess();
                PubSub.publish('comment.created', comment);
            });

            reset();
        }

    }

})(angular.module('app'), angular);