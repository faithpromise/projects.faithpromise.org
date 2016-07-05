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
                template: '<app-login></app-login>'
            })
            .when('/projects/:id', {
                template: '<project-detail></project-detail>'
            })
            .otherwise('/');
    }

})(angular.module('app'));