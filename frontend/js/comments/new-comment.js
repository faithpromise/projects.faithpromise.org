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
                event:   '=?',
                project: '=?'
            }
        };
    }

    Controller.$inject = ['$q', '$auth', 'PubSub', 'Upload', 'commentsService', 'attachmentsService', 'agentsService'];

    function Controller($q, $auth, PubSub, Upload, commentsService, attachmentsService, agentsService) {

        var vm               = this,
            default_sender,
            deferred_new_comment;
        vm.comment           = { user_id: $auth.getPayload().sub };
        vm.save              = save;
        vm.upload            = upload;
        vm.remove_attachment = remove_attachment;

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
            deferred_new_comment  = null;
            vm.comment.body       = '';
            vm.comment.recipients = angular.copy(vm.project.recipients);
            vm.sender             = default_sender;
            vm.attachments        = null;
        }

        function fetch_attachments() {

            attachmentsService.byComment(vm.comment.id).then(function (result) {
                vm.attachments = result.data.data;
            });

            vm.uploading = false;
        }

        function save_draft() {

            if (!deferred_new_comment) {

                deferred_new_comment = $q.defer();

                save(true).then(
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

        function save(draft) {

            var is_published = (draft !== true),
                comment      = angular.extend(
                    {},
                    vm.comment,
                    {
                        type:       draft === true ? 'draft' : 'comment',
                        user_id:    vm.sender.id,
                        event_id:   vm.event ? vm.event.id : null,
                        project_id: vm.project ? vm.project.id : null
                    }
                );

            if (is_published && comment.body.length === 0) {
                alert('Surely you have something to say.');
                return;
            }

            if (is_published) {
                reset();
                PubSub.publish('comment.creating', comment);
            }

            return commentsService.save(comment).then(function (result) {
                // vm.onSuccess();
                if (is_published) {
                    PubSub.publish('comment.created', comment);
                }
                return result;
            });

        }

        function upload(files) {

            if (files.length === 0) {
                return;
            }

            vm.uploading = true;

            save_draft().then(function () {
                Upload.upload({
                    url:  '/api/attachments',
                    data: {
                        file:       files,
                        comment_id: vm.comment.id
                    }
                }).then(
                    function (resp) {
                        console.log('fetch em');
                        fetch_attachments();
                    },
                    function (err) {},
                    function (evt) {
                        console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + evt.config.data.file.name)
                    }
                );
            });

        }

        function remove_attachment(attachment) {

            attachmentsService.delete(attachment.id);

            for (var i = 0; i < vm.attachments.length; i++) {
                if (vm.attachments[i].id === attachment.id) {
                    vm.attachments.splice(i, 1);
                }
            }

        }

    }

})(angular.module('app'), angular);