app.controller("IndexController", ['$scope', '$q', '$window', '$http', '$controller', '$timeout', '$aside', '$popover',
    function ($scope, $q, $window, $http, $controller, $timeout, $aside, $popover) {

        $controller("BaseController", { $scope: $scope });
        
        var mapCenter = { k: 61.783333, A: 34.35 };
        var scope = $scope;

        if (google.loader.ClientLocation) 
            mapCenter = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);

        var markerCluster;

        $scope.emptyAdvertType = "Все";
        $scope.emptyRealtyType = "Неважно";
        $scope.emptyObjectType = "Неважно";
        $scope.emptyGarageType = "Неважно";
        $scope.emptySecurity = "Неважно";

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
            markerIcon: '/content/images/marker.png',
            markerShadowIcon: '/content/images/marker.shadow.png',
            markerDeleteIcon: '/content/images/marker.delete.png',
            markerDragIcon: '/content/images/marker.png',
            markerStaticShadowIcon: '/content/images/marker.shadow.png',
            markersURL: '/markers',

            afterInitMap: function (map) {
                var mcOptions = {
                    gridSize: 40,
                    zoomOnClick: false,
                    styles: [
                        {
                            height: 80,
                            url: "/content/images/marker.png",
                            width: 48,
                            textColor: 'black',
                            anchorText: [-40, 0],
                        }
                    ]
                };
                markerCluster = new MarkerClusterer(map, [], mcOptions);
            },
            markerPlacedCallback: function(marker) {
                
            },
            clickStaticMarkerCallback: function(marker) {
                $scope.selectedAdvert = marker.extData;

                $scope.showDialogEx('advert-detailed.html');
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

            $scope.filter = $aside({
                scope: $scope,
                template: 'filter.html',
                placement: 'left',
                backdrop: false
            });
        };

        $scope.hideFilter = function () {
            $scope.isShowFilter = false;
        };

        $scope.isNotRoomOrApartments = function () {
            return $scope.realtyType != "room" && $scope.realtyType != "apartment";
        };

        $scope.isRoomOrApartments = function () {
            return !$scope.isNotRoomOrApartments();
        };

        $scope.isNotHousesOrLands = function () {
            return $scope.realtyType != "house" && $scope.realtyType != "land";
        };

        $scope.isHousesOrLands = function () {
            return !$scope.isNotHousesOrLands();
        };

        $scope.onDragEnd = function(e) {
            $scope.search();
        };

        $scope.onZoomChanged = function(e) {
            $scope.search();
        };

        $scope.addAdvert = function () {
            google.maps.event.addListener($scope.gmap.map, 'click', function (location) {
                $scope.gmap.placeMarker(location.latLng);
                $scope.isSelectedLocation = true;
            });
            markerCluster.clearMarkers();
            $scope.isAddingAdvert = true;
            //$scope.gmap.map.setOptions({
            //     draggableCursor: 'url(maps.gstatic.com/mapfiles/pointer_8_8.cur),default'
            //});
        };

        

        $scope.cancelAddingAdvert = function () {
            if ($scope.gmap.marker)
                $scope.gmap.removeMarker();

            $scope.emptyLocation = false;
            google.maps.event.clearListeners($scope.gmap.map, 'click');

            loadMarkers();
            $scope.isAddingAdvert = false;
            $scope.isSelectedLocation = false;
            $scope.hideDialog();
            //$scope.gmap.map.setOptions({
            //     draggableCursor: 'url(maps.gstatic.com/mapfiles/openhand_8_8.cur),default'
            //});
        };

        $scope.showNewAdvertDialog = function () {
            $scope.emptyLocation = !$scope.gmap.marker;
            if ($scope.emptyLocation)
                return;

            $scope.showDialog('add-advert-dialog.html',
                function (s) {
                    s.loading = true;
                    s.publishButtonLabel = "Добавление...";
                    
                    var advert = {
                        latitude: $scope.gmap.marker.position.A,
                        longitude: $scope.gmap.marker.position.k,
                        realtyType: s.realtyType,
                        advertType: s.advertType,
                        cost: s.cost,
                        description: s.description,

                        floor: s.stage,
                        floorCount: s.stageCount,
                        rooms: s.roomsCount,

                        objectType: s.objectType,

                        square: s.square,
                        contactPhone: s.contactPhone
                    };

                    $http
                        .post('/home/publishnewadvert', advert)
                        .success(function (result) {
                            $.map(s.uploader.queue, function (item) {
                                item.url = "/home/uploadimage?advertId=" + result.id;
                            });

                            s.uploader.bind('completeall', function (obj, request, item, response) {
                                $scope.cancelAddingAdvert();
                                s.loading = false;
                                s.publishButtonLabel = "Добавить";
                            });

                            s.uploader.uploadAll();

                        })
                        .error(function () {
                            s.message = "Возникла ошибка: неудалось добавить объявление";
                            s.loading = false;
                            s.publishButtonLabel = "Добавить";
                        });
                },
                $scope.cancelAddingAdvert);
        };

        $scope.search = function (event, s) {
            if (event)
                $(event.toElement).button('loading');

            loadMarkers(s)
                .then(function () {
                    if (event)
                        $(event.toElement).button('reset');;
            });
        };

        $scope.showAdvertDetailed = function (advert) {
            $scope.selectedAdvert = advert;
            $scope.selectedAdvert.isSelect = true;

            $scope.showDialogEx('advert-detailed.html', {
                onCancel: function () {
                    $scope.selectedAdvert.isSelect = false;
                    delete $scope.selectedAdvert;
                    $scope.hideDialog();
                }
            });
        };

        $scope.currentIndex = 0;

        $scope.setCurrentSlideIndex = function (index) {
            $scope.currentIndex = index;
        };

        $scope.isCurrentSlideIndex = function (index) {
            return $scope.currentIndex === index;
        };

        $scope.prevSlide = function () {
            $scope.currentIndex = ($scope.currentIndex < $scope.selectedAdvert.photos.length - 1) ? ++$scope.currentIndex : 0;
        };

        $scope.nextSlide = function () {
            $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.selectedAdvert.photos.length - 1;
        };

        $scope.$watch('realtyType', function() {
            delete $scope.objectType;
        });

        //$scope.showContactPhone = function() {
        //    $http
        //        .post("/home/showcontactphone", { advertid: $scope.selectedAdvert.id })
        //        .success(function(result) {

        //        });
        //};

        function loadMarkers(scope) {
            var bounds = $scope.gmap.map.getBounds();
            $scope.loading = true;

            if (scope) {
                $scope.realtyType = scope.realtyType;
                $scope.advertType = scope.advertType;
                $scope.objectType = scope.objectType;
                $scope.roomCountFilter = scope.roomsCount;
                $scope.floorFilter = scope.stage;
                $scope.floorCountFilter = scope.stageCount;
            }

            google.maps.event.clearListeners(markerCluster, "click");

            return $http
                .get("/home/markers", {
                    params: {
                        fromLatitude: bounds.na.j,
                        toLatitude: bounds.na.k,
                        fromLongitude: bounds.va.k,
                        toLongitude: bounds.va.j,

                        realtyType: $scope.realtyType,
                        advertType: $scope.advertType,
                        objectType: $scope.objectType,
                        roomCountFilter: $scope.roomsCount,
                        floorFilter: $scope.stage,
                        floorCountFilter: $scope.stageCount,

                        squareMin: $scope.minSquare,
                        squareMax: $scope.maxSquare,
                    }
                })
                .success(function (data) {
                    $timeout(function () {
                        $scope.loading = false;
                    }, 750);

                    try {
                        markerCluster.clearMarkers();
                        for (var i in data) {
                            var marker = $scope.gmap.createStaticMarker(
                                data[i]['longitude'],
                                data[i]['latitude'],
                                data[i]['location'],
                                data[i]);
                            $scope.gmap.staticMarkers.push(marker);
                            markerCluster.addMarker(marker);
                        }

                        google.maps.event.addListener(markerCluster, "click", function (cluster) {
                            if ($scope.selectedAdvertsAside)
                                $scope.selectedAdvertsAside.hide();

                            if ($scope.filter)
                                $scope.filter.hide();

                            $timeout(function() {
                                $scope.selectedAdverts = from(cluster.getMarkers()).select("$extData").toArray();
                            }, 200);
                            
                            $scope.selectedAdvertsAside = $aside({
                                scope: $scope,
                                template: 'advert-list.html',
                                placement: 'left',
                                backdrop: false
                            });
                        });
                    } catch (e) {
                        console.log(e);
                    }
                })
                .error(function() {
                    $scope.loading = false;
                });

        }
    }]);
