app.directive('ngLazyYt', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        link: function (scope, element, attributes) {
            $timeout(function() {
                $(element).lazyYT();
            }, 500);
        }
    };
}]);
