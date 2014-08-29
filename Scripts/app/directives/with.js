
app.directive('with', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, elem, attrs) {
            var withContext = $parse(attrs['with'])(scope.$parent);
            console.log(withContext);
            angular.extend(scope, withContext);
            console.log(scope);
        }
    };
}]);