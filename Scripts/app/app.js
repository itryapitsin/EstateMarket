var app = angular.module('house', ['angularFileUpload', 'mgcrea.ngStrap', 'green.inputmask4angular', 'ngAnimate']);

//app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
//    $routeProvider
//        .when('/page/:page', { event: 'pageChanged' })
//        .otherwise({ redirectTo: "/page/1" });

//    $httpProvider.defaults.useXDomain = true;
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//}]);

app.run(['$rootScope', '$http', '$templateCache', '$timeout', '$tab', '$q', '$window', '$modal',
    function ($rootScope, $http, $templateCache, $timeout, $tab) {

    var prefix = pathPrefix;

    if (prefix[prefix.length - 1] != "/")
        prefix += "/";

    $rootScope.prefix = prefix;
    $http.prefix = $rootScope.prefix;

    //$rootScope.state = $state;
    //$rootScope.stateParams = $stateParams;
    $rootScope.loading = true;

    //$rootScope.$on('$routeChangeStart', function (s, e, q) {
    //    var url = typeof (e.$$route.templateUrl) === "function"
    //        ? e.$$route.templateUrl(e.params)
    //        : e.$$route.templateUrl;

    //    if (e.$$route && $templateCache.get(url))
    //        $templateCache.remove(url);
    //});
}]);




