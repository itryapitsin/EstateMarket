angular
    .module('angular-inputmask')
    .directive('inputMask', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            compile: function postLink(element, attr) {
                $(element).inputmask();
            }
        }
})