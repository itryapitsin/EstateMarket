app.directive('ngDivOpenFile', [function () {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            $(element).click(function() {
                $(attributes.ngDivOpenFile).click();
            });
        }
    };
}]);
