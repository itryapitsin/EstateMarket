app.controller("IndexController", ['$scope', '$q', '$timeout', '$http', '$modal',
    function ($scope, $q, $timeout, $http, $modal) {

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
                .get("http://vivalapetroskoi.ru/f2/mycity/markers.json", {
                    params: {
                        
                    }
                })
                .success(function() {
                    
                })
                .then(function() {
                    $(event.toElement).button('reset');
            });
        };
    }]);