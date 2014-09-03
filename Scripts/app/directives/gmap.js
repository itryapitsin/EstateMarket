app.directive('ngGmap', ['$http', function ($http) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            var config = scope[attributes.ngGmap];
            var defaultConfig = {
                enableWAX: false,
                mapURL: null,
                bounds: null,
                markerIcon: '',
                markerShadowIcon: '',
                markerDeleteIcon: '',
                markerDragIcon: '',
                markerIconPreset: {
                    noVotes: produceMarkerIcon('#444', 4, 20, 0.70), // color, scale, stroke weight, opacity
                    fresh: produceMarkerIcon('#f70', 4, 20, 0.70),
                    noteworthy: produceMarkerIcon('#e51', 6, 30, 0.75),
                    trendy: produceMarkerIcon('#c32', 8, 40, 0.80),
                    hot: produceMarkerIcon('#a13', 10, 50, 0.85),
                    onFire: produceMarkerIcon('#804', 12, 60, 0.90)
                },
                markerIconNoVotes: produceMarkerIcon('#444', 4, 20, 0.70),
                markerIconFresh: produceMarkerIcon('#f70', 4, 20, 0.70),
                ratingPreset: {
                    fresh: 1, // Somewhat reality-oriented values
                    noteworthy: 20,
                    trendy: 40,
                    hot: 80,
                    onFire: 160
                },

                statusPreset: {
                    '-1': 'Не притрагивались',
                    1: 'Заявка готовится',
                    2: 'Заявка отправлена',
                    3: 'Заявка принята',
                    4: 'Заявка отклонена'
                },

                markerStaticShadow: '',
                markersURL: '',
                markerSaveURL: '',
                markerPlacedCallback: '',
                clickStaticMarkerCallback: '',
                staticMarkersInitDoneCallback: '',
                animationSpeed: 200,
                feedLimit: 10,
                defaultFeedOffset: 10,
                defaultFeedLimit: 10,
                monthName: {
                    1: 'января',
                    2: 'февраля',
                    3: 'марта',
                    4: 'апреля',
                    5: 'мая',
                    6: 'июня',
                    7: 'июля',
                    8: 'августа',
                    9: 'сентября',
                    10: 'октября',
                    11: 'ноября',
                    12: 'декабря',
                },
                currentYear: new Date().getFullYear()
            };
            scope.gmap = {
                marker: null,
                staticMarkers: [],
                map: null,
                rightClick: false,
                config: defaultConfig,
                overlay: null,
                clickTimeout: null,
                mapDragging: false,
                dialogDisplayed: false,

                initMap: function (options) {
                    $.extend(scope.gmap.config, options);
                    scope.gmap.map = new google.maps.Map(element[0], scope.gmap.config.mapOptions);
                    if (scope.gmap.config.enableWAX && scope.gmap.config.mapURL)
                        wax.tilejson(scope.gmap.config.mapURL, function (tilejson) {
                            scope.gmap.map.mapTypes.set('mb', new wax.g.connector(tilejson));
                            scope.gmap.map.setMapTypeId('mb');
                        });
                    if (scope.gmap.config.bounds) {
                        var
                            allowedBounds = new google.maps.LatLngBounds(
                                 new google.maps.LatLng(scope.gmap.config.bounds[0][0], scope.gmap.config.bounds[0][1]),
                                 new google.maps.LatLng(scope.gmap.config.bounds[1][0], scope.gmap.config.bounds[1][1])
                            ),
                            lastValidCenter = scope.gmap.map.getCenter()
                        ;
                        google.maps.event.addListener(scope.gmap.map, 'center_changed', function () {
                            if (allowedBounds.contains(scope.gmap.map.getCenter())) {
                                lastValidCenter = scope.gmap.map.getCenter();
                                return;
                            }
                            scope.gmap.map.panTo(lastValidCenter);
                        });
                    }
                    this.overlay = new google.maps.OverlayView();
                    this.overlay.draw = function () { };
                    this.overlay.setMap(scope.gmap.map);

                    google.maps.event.addListener(scope.gmap.map, 'dragend', function (event) {
                        if(scope.onDragEnd)
                            scope.onDragEnd(event);
                    });

                    google.maps.event.addListener(scope.gmap.map, 'zoom_changed', function () {
                        if (scope.onZoomChanged)
                            scope.onZoomChanged(event);
                    });

                    if (config.afterInitMap)
                        config.afterInitMap(scope.gmap.map);
                    
                    return scope.gmap.map;
                },

                moveMarker: function (marker, latlngs, event, index) {
                    if (!index) index = 0;
                    marker.setPosition(latlngs[index]);
                    if (index != latlngs.length - 1) {
                        setTimeout(function () {
                            scope.gmap.moveMarker(marker, latlngs, event, index + 1);
                        }, 10);
                    }
                    else {
                        marker.setPosition(event.latLng);
                        marker.setAnimation(null);
                    }
                },

                removeMarker: function (marker) {
                    if (!angular.isDefined(marker)) {
                        this.marker.setMap(null);
                        this.marker = null;
                    }
                    else {
                        marker.setMap(null);
                    }
                },

                placeMarker: function (location, callback) {
                    if (scope.gmap.marker)
                        scope.gmap.marker.setMap(null);

                    var marker = new google.maps.Marker({
                        position: location,
                        map: map,
                        icon: scope.gmap.config.markerIcon,
                        draggable: true,
                        shadow: scope.gmap.config.markerShadowIcon,
                        zIndex: 5,
                        animation: google.maps.Animation.DROP
                    });
                    marker.addListener('mouseover', function (e) {
                        this.setOptions({
                            icon: scope.gmap.config.markerDeleteIcon,
                        });
                    });
                    marker.addListener('drag', function (e) {
                        this.setOptions({
                            icon: scope.gmap.config.markerDragIcon,
                        });
                    });
                    marker.addListener('click', function (e) {
                        this.setMap(null);
                        scope.gmap.marker = null;
                    });
                    marker.addListener('mouseout', function (e) {
                        this.setOptions({
                            icon: scope.gmap.config.markerIcon,
                        });
                    });

                    scope.gmap.marker = marker;
                    return marker;
                },

                initMarkers: function (url, map, callback) {
                    if(config.initMarkers)
                        config.initMarkers(url, map, callback);
                },

                placeStaticMarker: function (latitude, longitude, location, extData) {
                    var staticMarker = this.createStaticMarker(latitude, longitude, location, extData);

                    scope.gmap.staticMarkers.push(staticMarker);
                    return staticMarker;
                },

                createStaticMarker: function (latitude, longitude, location, extData) {
                    var staticMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(latitude, longitude),
                        //icon: scope.gmap.config.markerIconPreset.noVotes,
                        icon: scope.gmap.config.markerIcon,
                        draggable: false,
                        flat: true,
                        title: location,
                        zIndex: 60,
                        //map: map,
                        extData: extData
                    });

                    var rating = extData.rating;
                    var ratingPreset = scope.gmap.config.ratingPreset;

                    if (scope.gmap.config.clickStaticMarkerCallback) {
                        staticMarker.addListener('mouseup', function (s,e,k) {
                            scope.gmap.config.clickStaticMarkerCallback(this);
                        });
                    }
                    // FIXME: rewrite the mess below nicely. // somewhat done, but could be better.
                    if (rating >= ratingPreset.fresh && rating < ratingPreset.noteworthy) {
                        staticMarker.setZIndex(50);
                        //staticMarker.setIcon(scope.gmap.config.markerIconPreset.fresh);
                    } else if (rating >= ratingPreset.noteworthy && rating < ratingPreset.trendy) {
                        staticMarker.setZIndex(40);
                        //staticMarker.setIcon(scope.gmap.config.markerIconPreset.noteworthy);
                    } else if (rating >= ratingPreset.trendy && rating < ratingPreset.hot) {
                        staticMarker.setZIndex(30);
                        //staticMarker.setIcon(scope.gmap.config.markerIconPreset.trendy);
                    } else if (rating >= ratingPreset.hot && rating < ratingPreset.onFire) {
                        staticMarker.setZIndex(20);
                        //staticMarker.setIcon(scope.gmap.config.markerIconPreset.hot);
                    } else if (rating >= ratingPreset.onFire) {
                        staticMarker.setZIndex(10);
                        //staticMarker.setIcon(scope.gmap.config.markerIconPreset.onFire);
                    }

                    return staticMarker;
                },

                saveMarker: function (marker, location, description, author, successCallback, errorCallback) {
                    if (config.saveMarker)
                        config
                            .saveMarker(marker, location, description, author, successCallback, errorCallback)
                            .success(function(data, status, r) {
                                var newMarker = null;
                                if (angular.isDefined(data[0])) {
                                    scope.gmap.removeMarker();
                                    newMarker = scope.gmap.placeStaticMarker(this.map,
                                        data[0]['latitude'],
                                        data[0]['longitude'],
                                        data[0]['location'],
                                        data[0]);
                                } else {
                                    marker.setMap(null); // were unable to save
                                }
                                marker = null;
                                if (successCallback)
                                    successCallback(newMarker);
                            })
                            .error(function (jq, status, error) {
                                if (errorCallback)
                                    errorCallback(error);
                            });
                },

                updateMarker: function (marker) {
                    for (var i in this.staticMarkers) {
                        if (this.staticMarkers[i].scope.gmap.markerID == marker.markerID) {
                            this.staticMarkers[i].scope.gmap.rating = marker.rating;
                            // we can update other stuff too, if needed
                        }
                    }
                }
            };
            
            var map = scope.gmap.initMap(config);
//            var markerCluster = new MarkerClusterer(scope.gmap.map, scope.gmap.staticMarkers);

            scope.gmap.removeMarkers = function () {
                //markerCluster.clearMarkers();
                angular.forEach(scope.gmap.staticMarkers, function(marker) {
                    scope.gmap.removeMarker(marker);
                });

                scope.gmap.staticMarkers = [];
            };

            google.maps.event.addListenerOnce(map, 'idle', function () {
                scope.gmap.initMarkers(config.markersURL, map, config.staticMarkersInitDoneCallback);
            });

            
            function produceMarkerIcon(color, scale, strokeWeight, opacity) {
                if (config.produceMarkerIcon)
                    return config.produceMarkerIcon(color, scale, strokeWeight, opacity);

                if (angular.isDefined(color) && angular.isDefined(scale) && angular.isDefined(strokeWeight)) {
                    return {
                        fillColor: color,
                        fillOpacity: opacity || 0.9,
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: scale,
                        strokeColor: color,
                        strokeWeight: strokeWeight,
                        strokeOpacity: (opacity || 0.1) * 0.05
                    };
                } else {
                    return false;
                }
            };
        }
    };
}]);
