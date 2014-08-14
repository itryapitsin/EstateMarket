$(document).ready(function () {
    var mycity = {
        marker: null,
        staticMarkers: [],
        map: null,
        rightClick: false,
        config: {
            mapOptions: {},
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
            defaultPageTitle: 'My Murmansk',
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
            if (mycity.config.enableWAX && mycity.config.mapURL)
                wax.tilejson(mycity.config.mapURL, function (tilejson) {
                    mycity.map.mapTypes.set('mb', new wax.g.connector(tilejson));
                    mycity.map.setMapTypeId('mb');
                });
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
            google.maps.event.addListener(mycity.map, 'dblclick', function (event) {
                window.clearTimeout(mycity.clickTimeout);
                mycity.clickTimeout = null;
            });
            google.maps.event.addListener(mycity.map, 'drag', function (event) {
                mycity.mapDragging = true;
            });
            google.maps.event.addListener(mycity.map, 'dragend', function (event) {
                mycity.mapDragging = false;
            });
            google.maps.event.addListener(mycity.map, 'rightclick', function (event) {
                mycity.rightclick = true;
            });
            google.maps.event.addListener(mycity.map, 'mouseup', function (event) {
                if (mycity.mapDragging == true) return false;
                if (mycity.clickTimeout) return false;
                if (mycity.dialogDisplayed) return false;
                mycity.clickTimeout = window.setTimeout(function () {
                    mycity.clickTimeout = null;
                    if (mycity.rightclick) {
                        mycity.rightclick = false;
                        return false;
                    }
                    if (!mycity.marker) {
                        mycity.marker = mycity.placeMarker(event.latLng);
                        if (mycity.config.markerPlacedCallback)
                            mycity.config.markerPlacedCallback(mycity.marker);
                    }
                    else {
                        mycity.marker.setAnimation(google.maps.Animation.BOUNCE);
                        var
                            frames = [],
                            fromLat = mycity.marker.getPosition().lat(),
                            fromLng = mycity.marker.getPosition().lng(),
                            toLat = event.latLng.lat(),
                            toLng = event.latLng.lng()
                        ;
                        for (var percent = 0; percent < 1; percent += 0.015) {
                            var
                                curLat = fromLat + percent * (toLat - fromLat),
                                curLng = fromLng + percent * (toLng - fromLng)
                            ;
                            frames.push(new google.maps.LatLng(curLat, curLng));
                        }
                        mycity.moveMarker(mycity.marker, frames, event);
                    }
                    return true;
                }, 250);
                return true;
            });
            this.initMarkers(mycity.config.markersURL, this.map, this.config.staticMarkersInitDoneCallback); //, windowBounds); // TODO
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
            var
                marker = new google.maps.Marker({
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
                $formNewMarker.fadeOut();
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
                            var
                                staticMarker = this.placeStaticMarker(this.map,
                                                                      data[0]['markers/marker'][i]['latitude'],
                                                                      data[0]['markers/marker'][i]['longitude'],
                                                                      data[0]['markers/marker'][i]['location'],
                                                                      data[0]['markers/marker'][i])
                            ;
                        }
                    }
                    catch (e) {
                        //console.log(e); // ???
                    }
                    if (callback) {
                        callback(this.staticMarkers);
                    }
                },
                error: function (jq, status, error) {
                    //console.log(error); ???
                }
            });
        },
        placeStaticMarker: function (map, latitude, longitude, location, mycityData) {
            var
                staticMarker = new google.maps.Marker({
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
                ratingPreset = mycity.config.ratingPreset
            ;
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

    // Hooks to necessary stuff
    var
        currentFeedOffset = 0,
        $pageTitle = $('title'),

        $sectionAbout = $('#sectionAbout'),

        // Sidebar-related stuff
        $mapSidebar = $('#mapSidebar'),
        $mapSidebarToggle = $('#mapSidebarToggle'),
        $mapSidebarHotSpot = $('#mapSidebarHotSpot'),

        // The Feed
        $feedSubmissions = $('#feedSubmissions'),
        $feedSortSwitch = $('#feedSortSwitch'),
        $triggerLoadRecent = $('#triggerLoadRecent'),
        $triggerLoadHot = $('#triggerLoadHot'),
        $triggerLoadMore = $('#triggerLoadMore'),
        $triggerScrollUp = $('#triggerScrollUp'),

        // The 'New marker' form
        $formNewMarker = $('#formNewMarker'),

        // Stuff on the map
        $markerDetails = $('#markerDetails'),
        $markerNotification = $markerDetails.find('.message'),
        $markerData = {
            id: $markerDetails.find('.marker-id'),
            location: $markerDetails.find('.location'),
            status: $markerDetails.find('.status'),
            author: $markerDetails.find('.author'),
            pubDate: $markerDetails.find('.pub-date'),
            description: $markerDetails.find('.description'),
            rating: $markerDetails.find('.rating'),
        },
        $markers = $('#mapContainer div[title].gmnoprint'),

        // Custom tweet button
        $triggerTweet = $('#triggerTweet')
    ;

    $triggerScrollUp.on({
        click: function () {
            $mapSidebar.animate({
                scrollTop: '0px'
            });
            return false;
        }
    });

    $mapSidebarToggle.on({
        "click mouseup": function () {
            showSidebar();
        }
    });

    $mapSidebarHotSpot.on({
        'mouseover click': function () {
            showSidebar();
        }
    });

    $mapSidebar.on({
        mouseout: function () {
            hideSidebar();
        },
        mouseover: function () {
            showSidebar();
        },
        scroll: function () {
            if (getViewportHeight() < (getFeedOffset() * -1)) {
                $triggerScrollUp.addClass('expanded');
            } else {
                $triggerScrollUp.removeClass('expanded');
            }
        }
    });

    // Make JQuery animations run as fast as we want them to.
    // And we want them run faster.
    $.extend($.fx.speeds, {
        _default: mycity.config.animationSpeed
    });


    $triggerLoadRecent.on({
        click: function () {
            resetFeedState();
            loadFeed('latest', $(this));
        }
    });

    $triggerLoadHot.on({
        click: function () {
            resetFeedState();
            loadFeed('popular', $(this));
        }
    });

    // Load more stuff
    $triggerLoadMore.on({
        click: function () {
            loadFeed($triggerLoadHot.hasClass('current') ? 'popular' : 'latest');
        }
    });

    // Load a feed with recent reports
    //loadFeed('latest', $triggerLoadRecent);

    var mapCenter = [68.970500, 33.078000];
    var map = mycity.initMap({
            mapOptions: {
                center: new google.maps.LatLng(mapCenter[0], mapCenter[1]),
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: [
                                { "featureType": "all", "elementType": "labels.text", "stylers": [{ "color": "#111111" }] },
                                { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }] },

                                { "featureType": "water", "elementType": "geometry", "stylers": [{ "visibility": "on" }, { "color": "#c0c8d0" }] },

                                { "featureType": "landscape.natural", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }] },

                                { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }, { "color": "#fffffa" }] },
                                { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "visibility": "on" }, { "color": "#aaaaa0" }] },

                                { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }, { "color": "#d4d4d0" }] },
                                { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "weight": 1 }, { "color": "#ffffff" }] },

                                { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }, { "color": "#ecefe8" }] },
                                { "featureType": "poi", "elementType": "geometry.icon", "stylers": [{ "visibility": "off" }] },

                                { "featureType": "transit", "elementType": "geometry", "stylers": [{ "visibility": "on" }, { "weight": 1 }, { "color": "#c3c6c9" }] },
                                { "featureType": "transit", "elementType": "geometry.stroke", "stylers": [{ "visibility": "on" }, { "color": "#a3a6a9" }] },
                                {}
                ],
                mapTypeControl: false,
                streetViewControl: false,
                scrollwheel: true,
                panControl: false,
                minZoom: 11,
                maxZoom: 30,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.LEFT_TOP
                }
            },
            //mapURL: 'http://api.tiles.mapbox.com/v3/madeinmurmansk.map-d56tfjcd.jsonp',
            enableWAX: false,
            //bounds: [[68.87063, 32.94218], [69.042382, 33.229198]],
            markerIcon: '/mycity/images/marker.png',
            markerShadowIcon: '/mycity/images/marker.shadow.png',
            markerDeleteIcon: '/mycity/images/marker.delete.png',
            markerDragIcon: '/mycity/images/marker.png',
            markerIconNoVotes: mycity.config.markerIconPreset.noVotes, // ???
            markerIconFresh: mycity.config.markerIconPreset.fresh, // ???

            markerStaticShadowIcon: '/mycity/images/marker.shadow.png',
            markersURL: '/f2/mycity/markers.json',
            markerSaveURL: '/f2/mycity/markers/save.json',
            markerPlacedCallback: function (marker) {
                $formNewMarker
                    .fadeIn()
                    .find('input:text[value=""], textarea:empty')
                        .eq(0)
                            .focus()
                ;
            },
            clickStaticMarkerCallback: function (marker) {
                var
                    position = mycity.overlay.getProjection().fromLatLngToContainerPixel(marker.getPosition())
                ;
                document.location.hash = 'markerID:' + marker.mycity.markerID;
                $markerDetails.trigger('f2hide');
                $markerData.id
                    .val(marker.mycity.markerID)
                ;
                $markerData.location
                    .text(marker.mycity.location)
                ;
                $markerData.status
                    .text(decorateStatus(marker.mycity.status))
                    .removeClass()
                    .addClass('status')
                    .addClass(addStatusModifier(marker.mycity.status))
                ;
                if (marker.mycity.author.trim()) {
                    $markerData.author.text(marker.mycity.author);
                } else {
                    $markerData.author.text('Анонимус');
                }
                $markerData.pubDate
                    .attr('datetime', marker.mycity.createdTime)
                    .text(decorateDate(marker.mycity.createdTime))
                ;
                $markerData.description
                    .text(marker.mycity.description)
                ;
                $markerData.rating
                    .removeClass()
                    .addClass('rating')
                    .addClass(addRatingModifier(marker.mycity.rating))
                    .text(marker.mycity.rating)
                    .attr('title', decorateRating(marker.mycity.rating))
                ;
                $markerDetails
                    .css({
                        left: position.x - 32,
                        top: position.y + 14
                    })
                    .fadeIn()
                ;
                mycity.dialogDisplayed = true;
                updatePageTitle(marker.mycity.location);
                updateTweetMessage($triggerTweet, marker.mycity.location, document.location.href);
            },
            staticMarkersInitDoneCallback: function (markers) {
                if (document.location.hash.match(/#*markerID:([0-9+])/)) {
                    var
                        markerID = document.location.hash.replace(/#*markerID:([0-9+])/, '$1'),
                        marker = null
                    ;
                    for (var i in markers) {
                        if (markers[i].mycity.markerID == markerID) {
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
        })
    ;

    google.maps.event.addListener(map, 'drag', function () {
        discardMapStuff();
    });
    google.maps.event.addListener(map, 'zoom_changed', function () {
        discardMapStuff();
    });

    google.maps.event.addListener(map, 'mouseup', function () {
        discardMapStuff();
    });

    $markerDetails.on('f2hide', function (e, animate) {
        if (animate) {
            $markerDetails.fadeOut(function () {
                $markerNotification
                    .text('')
                    .hide()
                ;
                document.location.hash = '';
                updatePageTitle();
            });
        } else {
            $(this).hide();
            $markerNotification
                .text('')
                .hide()
            ;
        }
        mycity.dialogDisplayed = false;
    });

    $formNewMarker.draggable({
        containment: 'window'
    });

    $('#linkAbout').click(function (e) {
        $sectionAbout.fadeIn();
        e.stopPropagation();
        return false;
    });

    if (!$.cookie('welcome')) {
        $sectionAbout.fadeIn();
        $.cookie('welcome', 'displayed');
    }

    $formNewMarker.submit(function () {
        if (!$('#markerLocation').val().trim() || !$('#markerDescription').val().trim()) {
            $formNewMarker
                .shake(5, 10, 120, 0.4)
                .fadeIn()
                .find('input:text[value=""], textarea:empty')
                    .eq(0)
                        .select()
            ;
            return false;
        }
        $formNewMarker
            .find('.loading')
                .slideDown()
        .end()
            .find('input.button')
                .addClass('disabled')
                .attr('disabled', 'disabled')
        ;
        mycity.saveMarker(mycity.marker,
                                $('#markerLocation').val(),
                                $('#markerDescription').val(),
                                $('#markerAuthor').val(),
                                function (newMarker) {
                                    $formNewMarker
                                        .find('.loading')
                                            .slideUp()
                                    .end()
                                        .find('input.button')
                                            .removeClass('disabled')
                                            .removeAttr('disabled')
                                    .end()
                                        .fadeOut()
                                    ;
                                    newMarker.setAnimation(google.maps.Animation.BOUNCE);
                                    window.setTimeout(function () {
                                        newMarker.setAnimation(null);
                                        google.maps.event.trigger(newMarker, 'mouseup');
                                    }, 750);
                                },
                                function (error) {
                                    $formNewMarker
                                        .find('input.button')
                                            .removeClass('disabled')
                                            .removeAttr('disabled')
                                    .end()
                                        .find('.loading')
                                            .slideUp()
                                    .end()
                                        .find('.message')
                                            .text('Ошибка: ' + error)
                                            .slideDown()
                                    .end()
                                        .find('input.button')
                                            .removeClass('disabled')
                                            .removeAttr('disabled')
                                    ;
                                });

        $('#markerLocation').val('');
        $('#markerDescription').val('');
        return false;
    });

    $('#triggerReportInappropriate').click(function () {
        $markerDetails.find('.message').slideUp();
        var
            markerID = $(this).closest('#markerDetails').find('.marker-id').val(),
            timeout = window.setTimeout(function () {
                $markerDetails('.loading').slideDown();
            }, 500)
        ;
        $.ajax({
            url: '/f2/mycity/markers/report/' + markerID + '.json',
            type: 'post',
            async: true,
            context: this,
            dataType: 'json',
            success: function (data, status, r) {
                window.clearTimeout(timeout);
                $markerDetails
                    .find('.loading')
                        .slideUp()
                .end()
                    .find('.message')
                        .text('Спасибо, ваш отчет о спаме принят')
                        .slideDown()
                ;
                mycity.updateMarker(data[0]);
            },
            error: function (jq, status, error) {
                window.clearTimeout(timeout);
                $markerDetails
                    .find('.loading')
                        .slideUp()
                .end()
                    .find('.message')
                        .text((error.indexOf('already-reported') != -1) ? 'Вы уже отправляли отчет о спаме' : error)
                        .slideDown()
                ;
            }
        });
        return false;
    });

    $('#triggerVote').click(function () {
        $markerDetails.find('.message').slideUp();
        var
            markerID = $(this).closest('#markerDetails').find('.marker-id').val(),
            timeout = window.setTimeout(function () {
                $markerDetails
                    .find('.loading')
                        .slideDown(
                );
            }, 500)
        ;
        $.ajax({
            url: '/f2/mycity/markers/vote/' + markerID + '.json',
            type: 'post',
            async: true,
            context: this,
            dataType: 'json',
            success: function (data, status, r) {
                window.clearTimeout(timeout);
                $markerDetails
                    .find('.loading')
                        .slideUp()
                .end()
                    .find('.message')
                        .text('Спасибо, ваш голос принят')
                        .slideDown()
                .end()
                    .find('.rating')
                        //.text(decorateRating(data[0].rating))
                        .text(data[0].rating)
                ;
                mycity.updateMarker(data[0]);
            },
            error: function (jq, status, error) {
                window.clearTimeout(timeout);
                $markerDetails
                    .find('.loading')
                        .slideUp()
                ;
                if (error.indexOf('already-voted') != -1)
                    $markerDetails
                        .find('.message')
                            .text('Вы уже голосовали за это предложение')
                            .slideDown()
                    ;
                else if (error.indexOf('marker-not-found') != -1)
                    $markerDetails
                        .find('.message')
                            .text('Ошибка: маркер не найден')
                            .slideDown()
                    ;
                else { // Chrome hides error types
                    $markerDetails
                        .find('.message')
                            .text('Голос не сохранен, вероятно, вы уже голосовали за это предложение.')
                            .slideDown()
                    ;
                }
            }
        });
        return false;
    });

    // THIS!
    $(document).on('click', '#feedSubmissions .location', function () {
        document.location.hash = $(this).attr('href');
        mycity.config.staticMarkersInitDoneCallback(mycity.staticMarkers);
    });

    // Hide marker details by hitting Escape
    $('html').on({
        keyup: function (event) {
            if (event.keyCode === 27) {
                discardMapStuff();
            }
        }
    });

    // Hide popups by clicking on [X].
    $('.cancel').on({
        click: function () {
            discardMapStuff();
        }
    });

    // Hide popups, forms, new markers, everything.
    function discardMapStuff() {
        $('.popup').fadeOut();
        if (mycity.marker) {
            mycity.removeMarker();
        }
        if ($markerDetails.is(':visible')) {
            $markerDetails.trigger('f2hide', [true]);
        }
        document.location.hash = '';
        updatePageTitle();
        return false;
    };

    // Load stuff, popular or most recent.
    function loadFeed(sortBy, $caller) {
        $triggerLoadMore.attr('disabled', true);
        $.ajax({
            url: '/f2/mycity/markers/' + (sortBy === 'latest' ? 'latest' : 'popular') + '.json',
            type: 'get',
            data: {
                offset: currentFeedOffset,
                limit: mycity.config.defaultFeedLimit
            },
            async: true,
            context: this,
            dataType: 'json',
            success: function (data, status, r) {
                currentFeedOffset += mycity.config.defaultFeedOffset;
                if (isDefined($caller)) {
                    $feedSubmissions.removeClass('loading');
                    $feedSortSwitch.find('a').removeClass('current');
                    $caller.addClass('current');
                }
                try {
                    var ideas = data[0]['markers/marker'];
                    if (ideas.length) {
                        for (var i in ideas) {
                            var $feedItem = $('<li />');
                            $feedItem.append(produceMarkerDetails(ideas[i]));
                            $feedSubmissions.append($feedItem);
                        }
                    }
                    if (ideas.length < mycity.config.defaultFeedLimit) {
                        $triggerLoadMore.hide();
                    } else {
                        $triggerLoadMore.show();
                    }
                }
                catch (e) {
                    $feedSubmissions
                        .removeClass('loading')
                        .closest('.message')
                            .text(e.toString())
                            .slideDown()
                    ;
                }
                $triggerLoadMore.attr('disabled', false);
            },
            error: function (jq, status, error) {
                $feedSubmissions
                    .removeClass('loading')
                    .find('.message')
                        .text('error')
                        .slideDown()
                ;
            }
        });
    }

    // Decorate votes count
    function decorateRating(votes) {
        if (votes <= 0) {
            votesString = 'голосов нет';
        } else if (votes % 10 === 1 && votes !== 11) {
            votesString = votes + ' голос';
        } else if ((votes % 10 === 2 && votes !== 12)
                   || (votes % 10 === 3 && votes !== 13)
                   || (votes % 10 === 4 && votes !== 14)
                  ) {
            votesString = votes + ' голоса';
        } else {
            votesString = votes + ' голосов';
        }
        return votesString;
    }

    // Decorate the date tag
    function decorateDate(rawDate) {
        var
          month = parseInt(rawDate.substr(5, 2)),
          day = parseInt(rawDate.substr(8, 2)),
          year = parseInt(rawDate.substr(0, 4))
        ;
        return day
          + ' '
          + mycity.config.monthName[month]
          + (year === mycity.config.currentYear ? '' : ' ' + year)
        ;
    };

    // Set appropriate color for a rating tag according to its popularity
    function addRatingModifier(rating) {
        var
            ratingModifier = '',
            ratingPreset = mycity.config.ratingPreset
        ;
        if (rating >= ratingPreset.fresh && rating < ratingPreset.noteworthy) {
            ratingModifier = 'fresh';
        } else if (rating >= ratingPreset.noteworthy && rating < ratingPreset.trendy) {
            ratingModifier = 'noteworthy';
        } else if (rating >= ratingPreset.trendy && rating < ratingPreset.hot) {
            ratingModifier = 'trendy';
        } else if (rating >= ratingPreset.hot && rating < ratingPreset.onFire) {
            ratingModifier = 'hot';
        } else if (rating >= ratingPreset.onFire) {
            ratingModifier = 'on-fire';
        }
        return ratingModifier;
    };

    // Clean up the feed, start all over.
    function resetFeedState() {
        $feedSubmissions.text('');
        currentFeedOffset = 0;
    };

    // Add current markers's location to the page title
    function updatePageTitle(title) {
        if (isDefined(title)) {
            $pageTitle
                .text(title + ' — ' + mycity.config.defaultPageTitle)
            ;
        } else {
            $pageTitle
                .text(mycity.config.defaultPageTitle)
            ;
        }
    };

    // Show the sidebar, hide the toggles.
    function showSidebar() {
        $mapSidebar.addClass('expanded');
        $mapSidebarToggle.removeClass('expanded');
        $mapSidebarHotSpot.removeClass('expanded');
    };

    // Hide the sidebar, show the toggles.
    function hideSidebar() {
        $mapSidebar.removeClass('expanded');
        $mapSidebarToggle.addClass('expanded');
        $mapSidebarHotSpot.addClass('expanded');
    };

    function getViewportHeight() {
        return $(window).height();
    };

    function getFeedOffset() {
        return $feedSubmissions.offset().top;
    };

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

    // Well-form a query string for twitter sharing
    function updateTweetMessage($trigger, tweetText, tweetURL) {
        $trigger.attr({
            href: produceTweetHref(tweetURL, tweetText)
        });
    }

    // JSONP callback
    function jsonpCallback(json) {
        return json;
    };

    function produceTweetHref(tweetURL, tweetText) {
        return 'https://twitter.com/share'
          + '?url=' + encodeURIComponent(tweetURL)
          + '&text=' + encodeURIComponent('Поддерживаю идею – ' + tweetText)
          + '&hashtags=mymurmansk'
        ;
    };

    // Assemble and prepopulate marker description
    // (this is gross, let's think about some client-side templating engine)
    function produceMarkerDetails(markerData) {
        var
            $markerDetails = $('<article class="marker" />'),
            $header = $('<header />'),
            $heading = $('<h1 />'),
            $location = $('<a class="location" />'),
            $stateTag = $('<span class="state-tag" />'),
            $rating = $('<span class="rating" />'),
            $status = $('<span class="status" />'),
            $body = $('<div />'),
            $description = $('<p class="description" />'),
            $footer = $('<footer />'),
            $author = $('<span class="author" />'),
            $pubDate = $('<time class="pub-date" datetime="" />')
        ;
        $location
            .text(markerData.location)
            .attr('href', '#markerID:' + markerData.markerID)
        ;
        $rating
            //.text(decorateRating(markerData.rating))
            .text(markerData.rating)
            .attr('title', decorateRating(markerData.rating))
            .addClass(addRatingModifier(markerData.rating))
        ;
        $status
            .text(decorateStatus(markerData.status))
            .addClass(addStatusModifier(markerData.status))
        ;
        $stateTag
            .append($rating)
            .append($status)
        ;
        $description
            .text(markerData.description)
        ;
        $author.text(markerData.author.trim() ? markerData.author : 'Анонимус')
        ;
        $pubDate
            .text(decorateDate(markerData.createdTime))
            .attr('datetime', markerData.createdTime)
        ;
        $heading
            .append($location)
        ;
        $header
            .append($heading)
            .append($stateTag)
        ;
        $body
            .append($description)
        ;

        if (isDefined(markerData.author)) {
            $footer
              .append($author)
              .append(', ')
            ;
        }

        $footer
          .append($pubDate)
        ;

        $markerDetails
            .append($header)
            .append($body)
            .append($footer)
        ;
        return $markerDetails;
    }

    // Decorate marker's status
    function decorateStatus(status) {
        return mycity.config.statusPreset[validateStatus(status)];
    };

    // Make sure that the status has a correct value, otherwise fix it.
    function validateStatus(status) {
        return (status >= 1 && status <= 4) ? status : -1;
    };

    // Who reads this anyway?
    function addStatusModifier(status) {
        var
            statusModifier = {
                '-1': '',
                1: 'icon processing',
                2: 'icon sent',
                3: 'icon implementing',
                4: 'icon refused'
            }
        ;
        return statusModifier[validateStatus(status)];
    }

    // Make character counters work
    function initializeCounters() {
        var $inputs = $('input[type="text"], textarea');
        // Map events
        $inputs.on({
            keyup: function () {
                var $this = $(this);
                var charsCurrent = $this.val().length;
                var charsLimit = $this.attr('maxlength');
                var $charsCounter = $this.next('.chars-counter');
                if ($charsCounter.get(0)) {
                    $charsCounter.text(charsLimit - charsCurrent);
                }
            }
        });
        // Update everything
        $inputs.trigger('keyup');
    }

    initializeCounters();

});
