app.controller("IndexController", ['$scope', '$q', '$window', '$http', '$modal',
    function ($scope, $q, $window, $http, $modal) {

        moment.lang('ru');
        $scope.moment = moment;
        var mapCenter = { k: 68.970500, A: 33.078000 };
        var scope = $scope;

        if (google.loader.ClientLocation) {
            mapCenter = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
        }
        $scope.mycity = {
            mapOptions: {
                center: new google.maps.LatLng(mapCenter.k, mapCenter.A),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: lightMapPallete,
                mapTypeControl: false,
                streetViewControl: false,
                scrollwheel: true,
                panControl: false,
                minZoom: 9,
                maxZoom: 20,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.RIGHT_TOP
                }
            },
            mapURL: 'http://api.tiles.mapbox.com/v3/madeinmurmansk.map-d56tfjcd.jsonp',
            enableWAX: false,
            //markerIcon: '/images/marker.png',
            //markerShadowIcon: '/images/marker.shadow.png',
            //markerDeleteIcon: '/images/marker.delete.png',
            //markerDragIcon: '/images/marker.png',
            //markerIconNoVotes: this.config.markerIconPreset.noVotes, // ???
            //markerIconFresh: scope.gmap.config.markerIconPreset.fresh, // ???

            //markerStaticShadowIcon: '/images/marker.shadow.png',
            //markersURL: '/f2/mycity/markers.json',
            //markerSaveURL: '/f2/mycity/markers/save.json',
            markerPlacedCallback: function(marker) {

            },
            clickStaticMarkerCallback: function(marker) {
                document.location.hash = 'markerID:' + marker.mycity.markerID;
                scope.gmap.dialogDisplayed = true;
            },
            staticMarkersInitDoneCallback: function(markers) {
                if (document.location.hash.match(/#*markerID:([0-9+])/)) {
                    var markerId = document.location.hash.replace(/#*markerID:([0-9+])/, '$1'),
                        marker = null;

                    for (var i in markers) {
                        if (markers[i].mycity.markerID == markerId) {
                            marker = markers[i];
                            break;
                        }
                    }
                    if (marker) {
                        scope.gmap.map.setZoom(15);
                        scope.gmap.map.setCenter(new google.maps.LatLng(
                            marker.getPosition().lat(),
                            marker.getPosition().lng()
                        ));
                        scope.gmap.map.panBy(240, 160);
                        if (isDefined(scope.gmap.overlay.getProjection())) {
                            google.maps.event.trigger(marker, 'mouseup');
                        } else {
                            // can't catch overlay load event, so we do iterative checks
                            var
                                attempts = 20,
                                timeout = window.setInterval(function() {
                                    if (isDefined(scope.gmap.overlay.getProjection())) {
                                        google.maps.event.trigger(marker, 'mouseup');
                                        window.clearInterval(timeout);
                                    } else {
                                        attempts -= 1;
                                    }
                                    if (attempts === 0)
                                        window.clearInterval(timeout); // we gave up
                                }, 200);
                        }
                    }
                }
                return null;
            }
        };

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

        $scope.onDragEnd = function(e) {
            $scope.search();
        };

        $scope.search = function (event) {
            if (event)
                $(event.toElement).button('loading');

            $http
                .get("/scripts/markers.js", {
                    params: {
                        
                    }
                })
                .success(function(data) {
                    try {
                        for (var i in data[0]['markers/marker']) {
                            $scope.gmap.placeStaticMarker($scope.gmap.map,
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
                .then(function () {
                    if (event)
                        $(event.toElement).button('reset');
            });
        };
    }]);