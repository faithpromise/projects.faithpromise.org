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

    Controller.$inject = ['$q', '$auth', 'PubSub', 'Upload', 'commentsService', 'agentsService'];

    function Controller($q, $auth, PubSub, Upload, commentsService, agentsService) {

        var vm              = this,
            default_sender,
            deferred_new_comment;
        vm.comment          = { user_id: $auth.getPayload().sub };
        vm.remove_recipient = remove_recipient;
        vm.save_comment     = save_comment;
        vm.upload           = upload;

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
            delete(vm.comment.id);
            deferred_new_comment      = null;
            vm.comment.body           = '';
            vm.comment.attachment_ids = [];
            vm.recipients             = vm.default_recipients ? angular.copy(vm.default_recipients) : angular.copy(vm.project.recipients);
            vm.sender                 = default_sender;
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

        function fetch_attachments() {
            
        }

        function save_draft() {

            if (!deferred_new_comment) {

                deferred_new_comment = $q.defer();

                save_comment(true).then(
                    function (result) {
                        vm.comment.id = result.data.data.id;
                        deferred_new_comment.resolve(result);
                    },
                    function (err) {
                        deferred_new_comment.reject(err);
                    }
                );

            }

            return deferred_new_comment.promise;

        }

        function save_comment(draft) {

            var comment = angular.extend(
                {},
                vm.comment,
                {
                    type:       draft === true ? 'draft' : 'comment',
                    user_id:    vm.sender.id,
                    event_id:   vm.event ? vm.event.id : null,
                    project_id: vm.project ? vm.project.id : null,
                    recipients: gather_recipients()
                }
            );

            if (draft !== true) {
                reset();
                PubSub.publish('comment.creating', comment);
            }

            return commentsService.save(comment).then(function (result) {
                // vm.onSuccess();
                if (draft !== true) {
                    PubSub.publish('comment.created', comment);
                }
                return result;
            });

        }

        function upload(files) {

            if (files.length === 0) {
                return;
            }

            save_draft().then(function () {
                Upload.upload({
                    url:  '/api/attachments',
                    data: {
                        file:       files,
                        comment_id: vm.comment.id
                    }
                }).then(
                    function (resp) {},
                    function (err) {},
                    function (evt) {
                        console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + evt.config.data.file.name)
                    }
                );
            });

        }

    }

})(angular.module('app'), angular);