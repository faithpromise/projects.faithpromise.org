(function (module) {
    'use strict';

    var ignore_elements = ['INPUT', 'TEXTAREA', 'SELECT'];

    module.directive('onEscape', Directive);

    Directive.$inject = ['$document'];

    function Directive($document) {
        return {
            restrict: 'A',
            link:     function (scope, element, attrs) {

                var escaped = false;

                function bind_esc(event) {

                    if (ignore_elements.indexOf(event.target.tagName) < 0) {

                        if (escaped) { return; }
                        escaped = true;

                        if (event.which === 27) {
                            // https://docs.angularjs.org/error/$rootScope/inprog?p0=$apply
                            $timeout(function() {
                                scope.$apply(function () {
                                    scope.$eval(attrs.onEscape);
                                });
                            }, 0);
                            event.preventDefault();
                        }

                    }

                }

                $document.on("keydown keypress keyup", bind_esc);

                scope.$on('$destroy', function () {
                    console.log('destroying');
                    $document.off("keydown keypress keyup", bind_esc);
                });

            }
        };
    }

})(angular.module('app'), angular);
