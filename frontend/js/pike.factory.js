(function (angular, module) {

    module.factory('pike', Factory);

    Factory.$inject = ['$route', '$routeParams', '$rootScope'];

    function Factory($route, $routeParams, $rootScope) {

        var splitter          = /\./g
            , oldRouteParams  = {}
            , eventTypePrefix = "route:";

        // I bind to the route-change event so that it can be translated into
        // action-oriented events on the scope-tree.
        $rootScope.$on("$routeChangeSuccess", handleRounteChangeEvent);

        // Return the public API.
        return ({
            bind:  bind,
            lock:  lock,
            param: param
        });


        // ---
        // PUBLIC METHODS.
        // ---


        // I bind a route-change handler to the contextual scope and return the
        // next item in the action path
        function bind(scope, eventType, handler) {

            // If we only get a change-handler passed-in, assume that the
            // event-type will be the empty string.
            if (arguments.length === 2) {

                handler   = arguments[1];
                eventType = "";

            }

            // Bind the route-change handler on the context scope.
            scope.$on(( eventTypePrefix + eventType ), handler);

            // If there is no action associated with the current route, there
            // can be no known "next action"; as such, return null.
            if (
                !$route.current || !$route.current.action ||
                ( $route.current.action === eventType )
            ) {

                return ( null );

            }

            // In order for there to be a relevant next action, the provided
            // event type must be a prefix for the current action. If it is not,
            // then return null.
            if ($route.current.action.indexOf(eventType + ".") !== 0) {

                return ( null );

            }

            // Now that we know we'll have a relevant next action, split both
            // the route action and the event type so that we can determine the
            // next action by index.
            var currentParts = $route.current.action.split(splitter);
            var eventParts   = eventType.split(splitter);

            return ( currentParts[eventParts.length] );

        }


        // I return a proxy to the given callback that will only be invoked if
        // the scope still exists and the route has not changed "too much". This
        // is intended to short-circuit AJAX responses that return after the
        // initiating route context is no longer relevant. This must be called
        // with a scope; but, it can also be called with an optional route param
        // to track.
        // --
        // lock( scope, callback )
        // lock( scope, key, callback )
        function lock(scope, key, callback) {

            // If a key was omitted, shift argument mappings.
            if (arguments.length === 2) {

                callback = arguments [1];
                key      = null;

            }

            var value = ( key ? param(key) : null );

            return ( proxyCallback );


            function proxyCallback() {

                // If the scope has been destroyed, exit out.
                if (!scope.$parent && ( scope !== $rootScope )) {

                    console.warn("Response ignored due to scope destruction.");
                    return ( callback = null );

                }

                // If the scope exists, and the tracked key has changed, exit out.
                if (key && ( value !== param(key) )) {

                    console.warn("Response ignored due to stale state.");
                    return ( callback = null );

                }

                // Otherwise, invoke callback.
                return ( callback.apply(scope, arguments) );

            }

        }


        // I get, coerced, and return the value from the current $routeParams.
        function param(key) {

            return ( coerceParam($routeParams[key]) );

        }


        // ---
        // PRIVATE METHODS.
        // ---


        // I try to coerce the given route parameter value in a way that is most
        // expected - if a parameter can be converted to a number, we will return
        // it as a number.
        function coerceParam(value) {

            if (angular.isUndefined(value)) {

                return ( null );

            }

            var numericValue = ( value * 1 );

            return ( ( value == numericValue ) ? numericValue : value );

        }


        // I try to coerce all of the local keys in the given params object,
        // converting each value to a number it can be. This will make strict-
        // equality much easier to work with as the only "numeric string" in the
        // entire app will come out of the location data. Everything else should
        // be a "known" value.
        function coerceParams(params) {

            for (var key in params) {

                if (params.hasOwnProperty(key)) {

                    params[key] = coerceParam(params[key]);

                }

            }

            return ( params );

        }


        // I catch the core route-change event and then translated it into
        // action-oriented events that get broadcast down through the scope tree.
        function handleRounteChangeEvent(event, newRoute) {

            // If there is no action, it's probably a redirect.
            if (angular.isUndefined(newRoute.action)) {

                return;

            }

            // Gather the coerced parameters for the new route.
            var newRouteParams = coerceParams(angular.copy($routeParams));

            // Each part of the route-action is going to be announced as a
            // separate route event.
            var parts = newRoute.action.split(splitter);

            // Announce the root change event. This is necessary for anyone
            // who is listening for a route-change but does not provide an
            // event-type to bind to.
            $rootScope.$broadcast(
                eventTypePrefix,
                ( parts[0] || null ),
                newRouteParams,
                oldRouteParams
            );

            // Now, walk down the route-action and announce a different event
            // for each part of the path. So, for example, if the action were
            // "foo.bar.baz", we'll announce the following events:
            // --
            // $broadcast( event, "foo", "bar", new, old );
            // $broadcast( event, "foo.bar", "baz", new, old );
            // $broadcast( event, "foo.bar.baz", null, new, old );
            // --
            // If you think that this causes too much processing, you have to
            // get some perspective on the matter; the cost of traversing the
            // scope tree for event triggering is quite inconsequential when
            // you consider how infrequently route changes are going to be
            // triggered.
            for (var i = 0, length = parts.length; i < length; i++) {

                $rootScope.$broadcast(
                    ( eventTypePrefix + parts.slice(0, i + 1).join(".") ),
                    ( parts[i + 1] || null ),
                    newRouteParams,
                    oldRouteParams
                );

            }

            // Store the current params for the next change event.
            oldRouteParams = newRouteParams;

        }

    }

})(angular, angular.module('app'));
