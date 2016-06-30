(function (module) {

    module.config(Config);

    Config.$inject = ['$routeProvider', '$locationProvider'];

    function Config($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                template: '<timeline></timeline>'
            })
            .when('/login', {
                template: '<app-login></app-login>',
                action: 'login'
            })
            .when('/logout', {
                action: 'logout'
            })
            .when('/projects/:id', {
                template: '<project-detail></project-detail>'
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