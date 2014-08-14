﻿app.directive('ngGmap', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            var t = 1;
            scope.gmap = {
                marker: null,
                staticMarkers: [],
                map: null,
                rightClick: false,
                config: {
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
                    markerIconNoVotes: produceMarkerIcon('#444', 4, 20, 0.70), // ???
                    markerIconFresh: produceMarkerIcon('#f70', 4, 20, 0.70), // ???
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
                },
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
                    if (!isDefined(marker)) {
                        this.marker.setMap(null);
                        this.marker = null;
                    }
                    else {
                        marker.setMap(null);
                    }
                },
                placeMarker: function (location, callback) {
                    var marker = new google.maps.Marker({
                        position: location,
                        map: map,
                        icon: scope.gmap.config.markerIcon,
                        draggable: true,
                        shadow: scope.gmap.config.markerShadowIcon,
                        zIndex: 5,
                        animation: google.maps.Animation.DROP
                    })
                    ;
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
                    return marker;
                },
                initMarkers: function (url, map, callback) {
                    $.ajax({
                        url: url,
                        type: 'get',
                        async: true,
                        context: this,
                        dataType: 'json',
                        data: {
                            'window[latitude]': 0,
                            'window[longitude]': 0
                        },
                        success: function (data, status, r) {
                            try {
                                for (var i in data[0]['markers/marker']) {
                                    var staticMarker = this.placeStaticMarker(this.map,
                                                                              data[0]['markers/marker'][i]['latitude'],
                                                                              data[0]['markers/marker'][i]['longitude'],
                                                                              data[0]['markers/marker'][i]['location'],
                                                                              data[0]['markers/marker'][i]);
                                }
                            }
                            catch (e) {
                                console.log(e);
                            }
                            if (callback) {
                                callback(this.staticMarkers);
                            }
                        },
                        error: function (jq, status, error) {
                            console.log(error);
                        }
                    });
                },
                placeStaticMarker: function (map, latitude, longitude, location, mycityData) {
                    var staticMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(latitude, longitude),
                        map: map,
                        icon: scope.gmap.config.markerIconPreset.noVotes,
                        draggable: false,
                        flat: true,
                        title: location,
                        zIndex: 60,
                        mycity: mycityData
                    });
                    var rating = mycityData.rating;
                        var ratingPreset = scope.gmap.config.ratingPreset;

                    if (scope.gmap.config.clickStaticMarkerCallback) {
                        staticMarker.addListener('mouseup', function () {
                            scope.gmap.config.clickStaticMarkerCallback(this);
                        });
                    }
                    // FIXME: rewrite the mess below nicely. // somewhat done, but could be better.
                    if (rating >= ratingPreset.fresh && rating < ratingPreset.noteworthy) {
                        staticMarker.setZIndex(50);
                        staticMarker.setIcon(scope.gmap.config.markerIconPreset.fresh);
                    } else if (rating >= ratingPreset.noteworthy && rating < ratingPreset.trendy) {
                        staticMarker.setZIndex(40);
                        staticMarker.setIcon(scope.gmap.config.markerIconPreset.noteworthy);
                    } else if (rating >= ratingPreset.trendy && rating < ratingPreset.hot) {
                        staticMarker.setZIndex(30);
                        staticMarker.setIcon(scope.gmap.config.markerIconPreset.trendy);
                    } else if (rating >= ratingPreset.hot && rating < ratingPreset.onFire) {
                        staticMarker.setZIndex(20);
                        staticMarker.setIcon(scope.gmap.config.markerIconPreset.hot);
                    } else if (rating >= ratingPreset.onFire) {
                        staticMarker.setZIndex(10);
                        staticMarker.setIcon(scope.gmap.config.markerIconPreset.onFire);
                    }
                    scope.gmap.staticMarkers.push(staticMarker);
                    return staticMarker;
                },

                saveMarker: function (marker, location, description, author, successCallback, errorCallback) {
                    $.ajax({
                        url: scope.gmap.config.markerSaveURL,
                        type: 'post',
                        async: true,
                        context: this,
                        dataType: 'json',
                        data: {
                            'marker[location]': location,
                            'marker[description]': description,
                            'marker[author]': author,
                            'marker[latitude]': marker.getPosition().lat(),
                            'marker[longitude]': marker.getPosition().lng()
                        },
                        success: function (data, status, r) {
                            var
                                newMarker = null
                            ;
                            if (isDefined(data[0])) {
                                scope.gmap.removeMarker();
                                newMarker = scope.gmap.placeStaticMarker(this.map,
                                                            data[0]['latitude'],
                                                            data[0]['longitude'],
                                                            data[0]['location'],
                                                            data[0]);
                            }
                            else {
                                marker.setMap(null); // were unable to save
                            }
                            marker = null;
                            if (successCallback)
                                successCallback(newMarker);
                        },
                        error: function (jq, status, error) {
                            if (errorCallback)
                                errorCallback(error);
                        }
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

            

            var map = scope.gmap.initMap(scope[attributes.ngGmap]);

            function isDefined(variable) {
                return !!!(typeof variable === 'undefined');
            };

            // Boilerplate with marker properties
            function produceMarkerIcon(color, scale, strokeWeight, opacity) {
                if (isDefined(color) && isDefined(scale) && isDefined(strokeWeight)) {
                    return {
                        fillColor: color,
                        fillOpacity: opacity || 0.9,
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: scale,
                        strokeColor: color,
                        strokeWeight: strokeWeight,
                        strokeOpacity: (opacity || 0.1) * 0.05
                    }
                } else {
                    return false;
                }
            };

            scope.produceMarkerIcon = produceMarkerIcon;
        }
    };
}]);
