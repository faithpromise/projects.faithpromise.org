(function (module) {

    module.config(Config);

    Config.$inject = ['$routeProvider', '$locationProvider'];

    function Config($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/dashboard', {
                action: 'dashboard'
            })
            .otherwise('/dashboard');

    }

})(angular.module('app'));