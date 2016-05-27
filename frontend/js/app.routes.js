(function (module) {

    module.config(Config);

    Config.$inject = ['$routeProvider', '$locationProvider'];

    function Config($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                action: 'home'
            })
            .when('/projects/:id', {
                action: 'project'
            })
            .when('/projects/:id/tasks/:task_id', {
                action: 'project.task'
            })
            .when('/events/:id', {
                action: 'event'
            })
            .otherwise('/');

    }

})(angular.module('app'));