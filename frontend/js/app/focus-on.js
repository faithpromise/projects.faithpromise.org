(function (module) {
    'use strict';

    module.directive('focusOn', directive);

    directive.$inject = ['$timeout'];

    function directive($timeout) {
        return {
            restrict: 'A',
            link:     function ($scope, $element, $attr) {
                $scope.$watch($attr.focusOn, function (_focusVal) {
                    console.log('_focusVal', _focusVal);
                    $timeout(function () {
                        _focusVal ? $element[0].focus() :
                            $element[0].blur();
                    });
                });
            }
        };
    }

})(angular.module('app'));