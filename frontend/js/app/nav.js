(function (module) {
    'use strict';

    module.directive('appNav', directive);

    function directive() {
        return {
            templateUrl:      '/build/js/app/nav.html',
            restrict:         'E',
            controller:       Controller,
            controllerAs:     'vm',
            bindToController: true,
            scope:            {
                onShowNewProject: '&'
            }
        };
    }

    Controller.$inject = ['$auth', '$location', '$q', '$sce', 'usersService', 'projectsService'];

    function Controller($auth, $location, $q, $sce, usersService, projectsService) {

        var vm                  = this,
            cache;
        vm.logout               = logout;
        vm.show_new_project     = show_new_project;
        vm.search_value         = '';
        vm.autocomplete_options = {
            on_error:         console.log,
            debounce_suggest: 300,
            on_detach:        clear_cache,
            suggest:          suggest,
            on_select:        search_go
        };

        clear_cache();

        function clear_cache() {
            cache = {
                projects: {},
                users:    {}
            };
        }

        function search_go(item) {
            vm.search_value = undefined;
            $location.url('/' + item.obj.type + '/' + item.obj.id);
        }

        function logout() {
            $auth.logout();
            $location.path('/login');
        }

        function show_new_project() {
            vm.onShowNewProject();
        }

        function suggest(term) {

            var term_lower   = term.toLowerCase(),
                first_letter = term_lower[0],
                project_matches,
                user_matches,
                deferred_projects,
                deferred_users;

            if (term.length < 3) {
                return [];
            }

            // Search users
            if (first_letter in cache.users) {
                user_matches = cache.users[first_letter];
            } else {
                deferred_users = $q.defer();

                usersService.search(first_letter).then(function (result) {
                    cache.users[first_letter] = result;
                    deferred_users.resolve(result);
                }, function (err) {
                    deferred_users.reject(err);
                });

                user_matches = deferred_users.promise;
            }

            // Search projects
            if (first_letter in cache.projects) {
                project_matches = cache.projects[first_letter];
            } else {
                deferred_projects = $q.defer();

                projectsService.search({name: first_letter}).then(function (result) {
                    cache.projects[first_letter] = result;
                    deferred_projects.resolve(result);
                }, function (err) {
                    deferred_projects.reject(err);
                });

                project_matches = deferred_projects.promise;
            }

            function starts_with(name, query_str) {
                return name.toLowerCase().indexOf(query_str) === 0;
            }

            function highlight(str, term) {
                var highlight_regex = new RegExp('\\b(' + term + ')', 'gi');
                return str.replace(highlight_regex,
                    '<span class="AutoSuggest-highlight">$1</span>');
            }

            return $q.all([project_matches, user_matches]).then(
                function success(result, status, headers, config) {

                    var projects = result[0].data.data,
                        users    = result[1].data.data;

                    var results = [],
                        i;

                    // Users
                    for (i = 0; i < users.length; i++) {
                        users[i].type = 'users';
                        if (starts_with(users[i].first_name, term_lower) || starts_with(users[i].last_name, term_lower) || starts_with(users[i].name, term_lower)) {
                            results.push({
                                obj:   users[i],
                                value: users[i].name,
                                label: $sce.trustAsHtml(
                                    '<div class="AutoSuggest-item">' +
                                    '<div class="AutoSuggest-image">' +
                                    '<img class="AutoSuggest-avatar" src="' + users[i].avatar_url + '">' +
                                    '</div>' +
                                    '<div class="AutoSuggest-content">' +
                                    '<span class="AutoSuggest-name">' + highlight(users[i].first_name, term) + ' ' + highlight(users[i].last_name, term) + '</span>' +
                                    '<span class="AutoSuggest-meta">' + users[i].email + '</span>' +
                                    '</div>' +
                                    '</div>'
                                )
                            });
                        }
                    }

                    // Projects
                    for (i = 0; i < projects.length; i++) {
                        projects[i].type = 'projects';
                        var re = new RegExp('\\b(' + term_lower + ').*', 'i');
                        if (re.test(projects[i].name)) {
                        results.push({
                            obj:   projects[i],
                            value: projects[i].name,
                            label: $sce.trustAsHtml(
                                '<div class="AutoSuggest-item">' +
                                '<div class="AutoSuggest-content">' +
                                '<span class="AutoSuggest-name">' + highlight(projects[i].name, term) + '</span>' +
                                '<span class="AutoSuggest-meta">' + projects[i].requester.abbreviation + '</span>' +
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