(function (module) {
    'use strict';

    var allowed_elements = ['INPUT', 'TEXTAREA', 'SELECT'];

    module.directive('onCmdEnter', Directive);

    Directive.$inject = ['$document'];

    function Directive($document) {
        return {
            restrict: 'A',
            link:     function (scope, element, attrs) {

                function bind_keys(event) {

                    if (allowed_elements.indexOf(event.target.tagName) >= 0) {

                        if (event.which === 13 && event.metaKey) {

                            scope.$apply(function () {
                                scope.$eval(attrs.onCmdEnter);
                            });

                            event.preventDefault();
                        }

                    }

                }

                $document.on("keydown keypress keyup", bind_keys);

                scope.$on('$destroy', function () {
                    $document.off("keydown keypress keyup", bind_keys);
                });

            }
        };
    }

})(angular.module('app'), angular);