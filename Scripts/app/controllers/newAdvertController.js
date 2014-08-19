app.controller("NewAdvertController", [
    '$scope', '$q', '$window', '$http', '$modal',
    function ($scope, $q, $window, $http, $modal) {
        $scope.closeDialog = function() {
            $scope.realtyType = "";
            $scope.advertType = "";
        };

        $scope.isNotRoomOrApartments = function () {
            return $scope.realtyType != "rooms" && $scope.realtyType != "apartments";
        };

        $scope.isRoomOrApartments = function () {
            return !$scope.isNotRoomOrApartments();
        };

        $scope.emptyRealtyType = "Неуказано";
        $scope.emptyAdvertType = "Неуказано";
    }
]);