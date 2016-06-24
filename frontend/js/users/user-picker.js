// http://plnkr.co/edit/AC4HjHx9yj2SGqwgkbUD?p=preview
(function (module) {
    'use strict';

    module.directive('userPicker', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/users/user-picker.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                cssClass:    '@',
                placeholder: '@?',
                selected:    '=?',
                onChange:    '&?',
                multiple:    '@',
                focus:       '@'
            },
            scope:            {}
        };
    }

    Controller.$inject = ['$q', '$sce', 'usersService'];

    function Controller($q, $sce, usersService) {

        var vm                  = this,
            cache               = {};
        vm.dirty                = ''; // Input ng-model
        vm.autocomplete_options = {
            on_error:         console.log,
            debounce_suggest: 300,
            suggest:          suggest_users,
            on_select:        add_user
        };

        init();

        function init() {
            vm.selected = vm.selected || (vm.multiple ? [] : null);
        }

        function add_user(item) {

            if (vm.multiple && user_index(item.obj) === -1) {
                vm.selected.push(item.obj);
                vm.onChange ? vm.onChange() : null;
            }

            if (!vm.multiple) {
                console.log('item.obj', item.obj);
                vm.selected = item.obj;
                vm.onChange ? vm.onChange() : null;
            }

            // Clear the input
            if (vm.multiple) {
                vm.dirty = '';
            }
        }


        function user_index(user) {
            for (var i = vm.selected.length - 1; i >= 0; i--) {
                if (vm.selected[i].id == user.id) {
                    return i;
                }
            }
            return -1;
        }

        function suggest_users(term) {

            var term_lower   = term.toLowerCase(),
                first_letter = term_lower[0],
                matching_users,
                deferred;

            if (first_letter in cache) {
                matching_users = cache[first_letter];
            } else {

                deferred = $q.defer();

                usersService.search(first_letter).then(function (result) {
                    cache[first_letter] = result;
                    deferred.resolve(result);
                }, function (err) {
                    deferred.reject(err);
                });

                matching_users = deferred.promise;

            }

            function starts_with(name, query_str) {
                return name.toLowerCase().indexOf(query_str) === 0;
            }

            function highlight(str, term) {
                var highlight_regex = new RegExp('^(' + term + ')', 'gi');
                return str.replace(highlight_regex,
                    '<span class="UserPicker-highlight">$1</span>');
            }

            return $q.when(matching_users).then(
                function success(result, status, headers, config) {
                    var results = [],
                        data    = result.data.data;

                    // Create results
                    for (var i = 0; i < data.length; i++) {
                        if (starts_with(data[i].first_name, term_lower) || starts_with(data[i].last_name, term_lower) || starts_with(data[i].name, term_lower)) {
                            results.push({
                                obj:   data[i],
                                value: data[i].name,
                                label: $sce.trustAsHtml(
                                    '<div class="UserPicker-item">' +
                                    '<div class="UserPicker-image">' +
                                    '<img class="UserPicker-avatar" src="' + data[i].avatar_url + '">' +
                                    '</div>' +
                                    '<div class="UserPicker-content">' +
                                    '<span class="UserPicker-name">' + highlight(data[i].first_name, term) + ' ' + highlight(data[i].last_name, term) + '</span>' +
                                    '<span class="UserPicker-email">' + data[i].email + '</span>' +
                                    '</div>' +
                                    '</div>'
                                )
                            });
                        }
                    }

                    return results;

                },

                function error() {
                    return data;
                }
            );
        }

    }

})(angular.module('app'));