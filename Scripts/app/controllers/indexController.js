app.controller("IndexController", ['$scope', '$q', '$window', '$http', '$modal',
    function ($scope, $q, $window, $http, $modal) {

        moment.lang('ru');
        $scope.moment = moment;

        $scope.showFilter = function() {
            $scope.isShowFilter = true;
        };

        $scope.hideFilter = function () {
            $scope.isShowFilter = false;
        };

        $scope.isNotRoomOrApartments = function() {
            return $scope.realtyType != "rooms" && $scope.realtyType != "apartments";
        };

        $scope.isRoomOrApartments = function () {
            return !$scope.isNotRoomOrApartments();
        };

        $scope.search = function(event) {
            $(event.toElement).button('loading');
            $http
                .get("/scripts/markers.js", {
                    params: {
                        
                    }
                })
                .success(function(data) {
                    try {
                        for (var i in data[0]['markers/marker']) {
                            var staticMarker = $window.mycity.placeStaticMarker($window.mycity.map,
                                                                      data[0]['markers/marker'][i]['latitude'],
                                                                      data[0]['markers/marker'][i]['longitude'],
                                                                      data[0]['markers/marker'][i]['location'],
                                                                      data[0]['markers/marker'][i]);
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                })
                .then(function() {
                    $(event.toElement).button('reset');
            });
        };
    }]);