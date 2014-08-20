app.controller("NewAdvertController", [
    '$scope', '$q', '$window', '$http', '$modal', '$fileUploader',
    function ($scope, $q, $window, $http, $modal, $fileUploader) {
        $scope.step = 1;
        $scope.stepCount = 3;
        

        google.maps.event.addListener($scope.gmap.map, 'dragend', function () {
            var center = $scope.gmap.map.getCenter();

            $http
            .get("http://maps.googleapis.com/maps/api/geocode/json?latlng={0},{1}&sensor=false"
                .replace("{0}", center.k)
                .replace("{1}", center.A))
            .success(function (response) {
                var country = from(response.results)
                    .where(function (item) {
                        return item.types[0] == "country" && item.types[1] == "political";
                    })
                    .firstOrDefault();
                var region = from(response.results)
                    .where(function (item) {
                        return item.types[0] == "administrative_area_level_1" && item.types[1] == "political";
                    })
                    .firstOrDefault();
                var locality1 = from(response.results)
                    .where(function (item) {
                        return item.types[0] == "administrative_area_level_2" && item.types[1] == "political";
                    })
                    .firstOrDefault();
                var city = from(response.results)
                    .where(function (item) {
                        return item.types[0] == "locality" && item.types[1] == "political";
                    })
                    .firstOrDefault();
                $scope.country = country.address_components[0].long_name;
                $scope.region = region.address_components[0].short_name;
                $scope.locality1 = locality1.address_components[0].short_name;

                if (city)
                    $scope.city = city.address_components[0].short_name;
                else
                    delete $scope.city;
            });
        });

        

        $scope.closeDialog = function() {
            $scope.realtyType = "";
            $scope.advertType = "";
            $scope.cost = 0;
            $scope.step = 1;
            $scope.uploader.queue = [];
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