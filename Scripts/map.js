$(document).ready(function () {
    var mycity = {
        marker: null,
        staticMarkers: [],
        map: null,
        rightClick: false,
        config: {
            //mapOptions: {},
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
            $.extend(mycity.config, options);
            mycity.map = new google.maps.Map(document.getElementById("mapContainer"), mycity.config.mapOptions);
            //if (mycity.config.enableWAX && mycity.config.mapURL)
            //    wax.tilejson(mycity.config.mapURL, function (tilejson) {
            //        mycity.map.mapTypes.set('mb', new wax.g.connector(tilejson));
            //        mycity.map.setMapTypeId('mb');
            //    });
            if (mycity.config.bounds) {
                var
                    allowedBounds = new google.maps.LatLngBounds(
                         new google.maps.LatLng(mycity.config.bounds[0][0], mycity.config.bounds[0][1]),
                         new google.maps.LatLng(mycity.config.bounds[1][0], mycity.config.bounds[1][1])
                    ),
                    lastValidCenter = mycity.map.getCenter()
                ;
                google.maps.event.addListener(mycity.map, 'center_changed', function () {
                    if (allowedBounds.contains(mycity.map.getCenter())) {
                        lastValidCenter = mycity.map.getCenter();
                        return;
                    }
                    mycity.map.panTo(lastValidCenter);
                });
            }
            this.overlay = new google.maps.OverlayView();
            this.overlay.draw = function () { };
            this.overlay.setMap(mycity.map);
            //google.maps.event.addListener(mycity.map, 'dblclick', function (event) {
            //    window.clearTimeout(mycity.clickTimeout);
            //    mycity.clickTimeout = null;
            //});
            //google.maps.event.addListener(mycity.map, 'drag', function (event) {
            //    mycity.mapDragging = true;
            //});
            //google.maps.event.addListener(mycity.map, 'dragend', function (event) {
            //    mycity.mapDragging = false;
            //});
            //google.maps.event.addListener(mycity.map, 'rightclick', function (event) {
            //    mycity.rightclick = true;
            //});
            //google.maps.event.addListener(mycity.map, 'mouseup', function (event) {
            //    if (mycity.mapDragging == true) {
            //        mycity.mapDragging = false;
            //        return false;
            //    }
            //    if (mycity.clickTimeout) return false;
            //    if (mycity.dialogDisplayed) return false;
            //    mycity.clickTimeout = window.setTimeout(function () {
            //        mycity.clickTimeout = null;
            //        if (mycity.rightclick) {
            //            mycity.rightclick = false;
            //            return false;
            //        }
            //        if (!mycity.marker) {
            //            mycity.marker = mycity.placeMarker(event.latLng);
            //            if (mycity.config.markerPlacedCallback)
            //                mycity.config.markerPlacedCallback(mycity.marker);
            //        }
            //        else {
            //            mycity.marker.setAnimation(google.maps.Animation.BOUNCE);
            //            var
            //                frames = [],
            //                fromLat = mycity.marker.getPosition().lat(),
            //                fromLng = mycity.marker.getPosition().lng(),
            //                toLat = event.latLng.lat(),
            //                toLng = event.latLng.lng()
            //            ;
            //            for (var percent = 0; percent < 1; percent += 0.015) {
            //                var
            //                    curLat = fromLat + percent * (toLat - fromLat),
            //                    curLng = fromLng + percent * (toLng - fromLng)
            //                ;
            //                frames.push(new google.maps.LatLng(curLat, curLng));
            //            }
            //            mycity.moveMarker(mycity.marker, frames, event);
            //        }
            //        return true;
            //    }, 250);
            //    return true;
            //});
            //this.initMarkers(mycity.config.markersURL, this.map, this.config.staticMarkersInitDoneCallback); //, windowBounds); // TODO
            return mycity.map;
        },
        moveMarker: function (marker, latlngs, event, index) {
            if (!index) index = 0;
            marker.setPosition(latlngs[index]);
            if (index != latlngs.length - 1) {
                setTimeout(function () {
                    mycity.moveMarker(marker, latlngs, event, index + 1);
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
                    icon: mycity.config.markerIcon,
                    draggable: true,
                    shadow: mycity.config.markerShadowIcon,
                    zIndex: 5,
                    animation: google.maps.Animation.DROP
                })
            ;
            marker.addListener('mouseover', function (e) {
                this.setOptions({
                    icon: mycity.config.markerDeleteIcon,
                });
            });
            marker.addListener('drag', function (e) {
                this.setOptions({
                    icon: mycity.config.markerDragIcon,
                });
            });
            marker.addListener('click', function (e) {
                this.setMap(null);
                mycity.marker = null;
            });
            marker.addListener('mouseout', function (e) {
                this.setOptions({
                    icon: mycity.config.markerIcon,
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
                    icon: mycity.config.markerIconPreset.noVotes,
                    draggable: false,
                    flat: true,
                    title: location,
                    zIndex: 60,
                    mycity: mycityData
                }),
                rating = mycityData.rating,
                ratingPreset = mycity.config.ratingPreset;

            if (mycity.config.clickStaticMarkerCallback) {
                staticMarker.addListener('mouseup', function () {
                    mycity.config.clickStaticMarkerCallback(this);
                });
            }
            // FIXME: rewrite the mess below nicely. // somewhat done, but could be better.
            if (rating >= ratingPreset.fresh && rating < ratingPreset.noteworthy) {
                staticMarker.setZIndex(50);
                staticMarker.setIcon(mycity.config.markerIconPreset.fresh);
            } else if (rating >= ratingPreset.noteworthy && rating < ratingPreset.trendy) {
                staticMarker.setZIndex(40);
                staticMarker.setIcon(mycity.config.markerIconPreset.noteworthy);
            } else if (rating >= ratingPreset.trendy && rating < ratingPreset.hot) {
                staticMarker.setZIndex(30);
                staticMarker.setIcon(mycity.config.markerIconPreset.trendy);
            } else if (rating >= ratingPreset.hot && rating < ratingPreset.onFire) {
                staticMarker.setZIndex(20);
                staticMarker.setIcon(mycity.config.markerIconPreset.hot);
            } else if (rating >= ratingPreset.onFire) {
                staticMarker.setZIndex(10);
                staticMarker.setIcon(mycity.config.markerIconPreset.onFire);
            }
            mycity.staticMarkers.push(staticMarker);
            return staticMarker;
        },

        saveMarker: function (marker, location, description, author, successCallback, errorCallback) {
            $.ajax({
                url: mycity.config.markerSaveURL,
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
                        mycity.removeMarker();
                        newMarker = mycity.placeStaticMarker(this.map,
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
                if (this.staticMarkers[i].mycity.markerID == marker.markerID) {
                    this.staticMarkers[i].mycity.rating = marker.rating;
                    // we can update other stuff too, if needed
                }
            }
        }
    };

    var mapCenter = { k: 68.970500, A: 33.078000};

    if (google.loader.ClientLocation) {
        mapCenter = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
    }

    var map = mycity.initMap({
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
        enableWAX: true,
        markerIcon: '/images/marker.png',
        markerShadowIcon: '/images/marker.shadow.png',
        markerDeleteIcon: '/images/marker.delete.png',
        markerDragIcon: '/images/marker.png',
        markerIconNoVotes: mycity.config.markerIconPreset.noVotes, // ???
        markerIconFresh: mycity.config.markerIconPreset.fresh, // ???

        markerStaticShadowIcon: '/images/marker.shadow.png',
        markersURL: '/f2/mycity/markers.json',
        markerSaveURL: '/f2/mycity/markers/save.json',
        markerPlacedCallback: function (marker) {
           
        },
        clickStaticMarkerCallback: function (marker) {
            document.location.hash = 'markerID:' + marker.mycity.markerID;
            mycity.dialogDisplayed = true;
        },
        staticMarkersInitDoneCallback: function (markers) {
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
                    mycity.map.setZoom(15);
                    mycity.map.setCenter(new google.maps.LatLng(
                        marker.getPosition().lat(),
                        marker.getPosition().lng()
                    ));
                    mycity.map.panBy(240, 160);
                    if (isDefined(mycity.overlay.getProjection())) {
                        google.maps.event.trigger(marker, 'mouseup');
                    } else {
                        // can't catch overlay load event, so we do iterative checks
                        var
                            attempts = 20,
                            timeout = window.setInterval(function () {
                                if (isDefined(mycity.overlay.getProjection())) {
                                    google.maps.event.trigger(marker, 'mouseup');
                                    window.clearInterval(timeout);
                                } else {
                                    attempts -= 1;
                                }
                                if (attempts === 0)
                                    window.clearInterval(timeout); // we gave up
                            }, 200)
                        ;
                    }
                }
            }
            return null;
        }
    });

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
});
