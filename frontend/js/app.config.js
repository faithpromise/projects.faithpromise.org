(function (module) {

    module.config(Config);
    module.run(Run);

    Config.$inject = ['$locationProvider', '$resourceProvider', '$authProvider'];

    function Config($locationProvider, $resourceProvider, $authProvider) {

        $locationProvider.html5Mode(true);

        $resourceProvider.defaults.stripTrailingSlashes = false;

        $authProvider.loginUrl        = '/api/authenticate';
        $authProvider.httpInterceptor = function () {
            return true;
        };

    }

    Run.$inject = ['$document', '$location', '$rootScope', '$auth'];

    function Run($document, $location, $rootScope, $auth) {

        // Add user to root scope if found in local storage
        // $rootScope.user = USER;

        $rootScope.$on('$locationChangeStart', function (/* event, next, current */) {

            var logged_in     = $auth.isAuthenticated(),
                is_logging_in = $location.path() === '/login';

            // Redirect to login if not authenticated
            if (!logged_in && !is_logging_in) {
                $location.path('/login');
            }

            //Restrict login and register pages if already logged in and registered
            if (logged_in && is_logging_in) {
                $location.path('/');
            }

        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
        });

    }

})(angular.module('app'));
