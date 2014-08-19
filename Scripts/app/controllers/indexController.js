app.controller("IndexController", ['$scope', '$q', '$window', '$http', '$modal',
    function ($scope, $q, $window, $http, $modal) {
        
        var mapCenter = { k: 61.783333, A: 34.35 };
        var scope = $scope;

        if (google.loader.ClientLocation) {
            mapCenter = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
        }

        var markerCluster;

        $scope.emptyAdvertType = "Все";
        $scope.emptyRealtyType = "Неважно";

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
                minZoom: 5,
                maxZoom: 20,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.RIGHT_TOP
                }
            },
            mapURL: 'http://api.tiles.mapbox.com/v3/madeinmurmansk.map-d56tfjcd.jsonp',
            enableWAX: false,
            markerIcon: '/images/marker.png',
            markerShadowIcon: '/images/marker.shadow.png',
            markerDeleteIcon: '/images/marker.delete.png',
            markerDragIcon: '/images/marker.png',
            markerStaticShadowIcon: '/images/marker.shadow.png',
            markersURL: '/markers',

            afterInitMap: function (map) {
                var mcOptions = {
                    gridSize: 200,
                    styles: [{
                        height: 80,
                        url: "/images/marker.png",
                        width: 48,
                        textColor: 'black',
                        anchorText: [-40, 0],
                    }]
                }
                markerCluster = new MarkerClusterer(map, [], mcOptions);
            },
            markerPlacedCallback: function(marker) {
                
            },
            clickStaticMarkerCallback: function(marker) {
                document.location.hash = 'markerID:' + marker.extData.id;
                scope.gmap.dialogDisplayed = true;
            },
            initMarkers: function (url, map, callback) {
                loadMarkers()
                    .then(function (r) {
                        callback(scope.gmap.staticMarkers);
                    });
            },
            staticMarkersInitDoneCallback: function(markers) {
                if (document.location.hash.match(/#*markerID:([0-9+])/)) {
                    var markerId = document.location.hash.replace(/#*markerID:([0-9+])/, '$1'),
                        marker = null;

                    for (var i in markers) {
                        if (markers[i].extData.id == markerId) {
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
                        if (angular.isDefined(scope.gmap.overlay.getProjection())) {
                            google.maps.event.trigger(marker, 'mouseup');
                        } else {
                            // can't catch overlay load event, so we do iterative checks
                            var
                                attempts = 20,
                                timeout = window.setInterval(function() {
                                    if (angular.isDefined(scope.gmap.overlay.getProjection())) {
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

            loadMarkers()
                .then(function () {
                    if (event)
                        $(event.toElement).button('reset');
            });
        };

        function loadMarkers() {
            var bounds = $scope.gmap.map.getBounds();

            return $http
                .get("/home/markers", {
                    params: {
                        fromLatitude: bounds.na.j,
                        toLatitude: bounds.na.k,
                        fromLongitude: bounds.va.k,
                        toLongitude: bounds.va.j,
                        realtyType: $scope.realtyType
                    }
                })
                .success(function (data) {
                    
                    markerCluster.clearMarkers();
                    try {
                        
                        for (var i in data) {
                            var marker = $scope.gmap.createStaticMarker(
                                $scope.gmap.map,
                                data[i]['latitude'],
                                data[i]['longitude'],
                                data[i]['location'],
                                data[i]);

                            markerCluster.addMarker(marker);
                        }

                       
                    
                    } catch (e) {
                        console.log(e);
                    }
            });

        }
    }]);