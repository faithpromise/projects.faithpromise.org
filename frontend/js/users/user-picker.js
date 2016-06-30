// http://plnkr.co/edit/AC4HjHx9yj2SGqwgkbUD?p=preview
(function (module, angular) {
    'use strict';

    module.directive('userPicker', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/users/user-picker.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: {
                inputClass:    '@',
                tabIndex:      '@',
                selected:      '=?',
                limitToAgents: '@?',
                onChange:      '&?',
                detached:      '@?'
            },
            scope:            {}
        };
    }

    Controller.$inject = ['$scope', '$q', '$sce', 'usersService', 'agentsService'];

    function Controller($scope, $q, $sce, usersService, agentsService) {

        var vm       = this,
            cache    = {},
            searcher = vm.limitToAgents ? agentsService : usersService;

        vm.autocomplete_options = {
            on_error:         console.log,
            debounce_suggest: 300,
            on_detach:        fix_value,
            suggest:          suggest_users,
            on_select:        select_user
        };

        init();

        function init() {
            vm.tabIndex   = vm.tabIndex || 1;
            vm.inputClass = vm.inputClass || 'Form-control';
        }

        function fix_value() {
            vm.input_value = (vm.selected && !vm.detached) ? vm.selected.name : '';
        }

        function select_user(item) {
            vm.selected = item.obj;
            vm.onChange ? vm.onChange({ user: item.obj }) : null;
            fix_value();
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

                searcher.search(first_letter).then(function (result) {
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

        // When we have a user, update the input value
        $scope.$watch('vm.selected', function (new_value) {
            if (new_value) {
                fix_value();
            }
        });
    }

})(angular.module('app'), angular);