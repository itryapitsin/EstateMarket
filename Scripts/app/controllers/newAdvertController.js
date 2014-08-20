app.controller("NewAdvertController", [
    '$scope', '$q', '$window', '$http', '$modal', '$fileUploader',
    function ($scope, $q, $window, $http, $modal, $fileUploader) {
        $scope.step = 1;
        $scope.stepCount = 3;

        $scope.closeDialog = function() {
            $scope.realtyType = "";
            $scope.advertType = "";
            $scope.step = 1;
        };

        $scope.isLastStep = function() {
            return $scope.step == $scope.stepCount;
        };

        $scope.isFirstStep = function () {
            return $scope.step == 1;
        };

        $scope.publish = function() {

        };

        $scope.next = function() {
            $scope.step += 1;
        };

        $scope.back = function () {
            $scope.step -= 1;
        };

        $scope.isNotRoomOrApartments = function () {
            return $scope.realtyType != "rooms" && $scope.realtyType != "apartments";
        };

        $scope.isRoomOrApartments = function () {
            return !$scope.isNotRoomOrApartments();
        };

        $scope.isNotHousesOrLands = function () {
            return $scope.realtyType != "houses" && $scope.realtyType != "lands";
        };

        $scope.isHousesOrLands = function () {
            return !$scope.isNotHousesOrLands();
        };

        $scope.showPhotoStepTitle = function() {
            return uploader.isHTML5 && uploader.queue.length == 0;
        };

        var uploader = $scope.uploader = $fileUploader.create({
            scope: $scope,
            //url: $http.prefix + "api/images"
        });

        uploader.filters.push(function (item) {
            var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
            type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        });


        $scope.emptyRealtyType = "Неуказано";
        $scope.emptyAdvertType = "Неуказано";
    }
]);