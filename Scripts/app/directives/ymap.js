app.directive('ngYmap', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {

            scope.clearMap = function () {
                scope.yMap.geoObjects.each(function (obj) {
                    scope.yMap.geoObjects.remove(obj);
                });
            };

            scope.addPointToMap = function(item, isSetCenter) {
                if (!item.address)
                    return;
                ymaps.geocode(item.address, { results: 1 }).then(function(res) {
                    res.geoObjects.events
                        .add('mouseenter', function(e) {
                            e.get('target').options.set('preset', 'twirl#redIcon');
                        })
                        .add('mouseleave', function(e) {
                            e.get('target').options.unset('preset');
                        });

                    item.geoObjects = res.geoObjects;

                    scope.yMap.geoObjects.add(res.geoObjects);

                    if (isSetCenter && res.geoObjects.get(0))
                        scope.yMap.setCenter(res.geoObjects.get(0).geometry.getCoordinates());
                });
            };

            function init() {
                var coords = [ymaps.geolocation.latitude, ymaps.geolocation.longitude];
                var myMap = new ymaps.Map(element[0].id, {
                        center: coords,
                        zoom: 12
                    });

                myMap.controls.add('zoomControl', { left: 5, top: 5 });

                if (attributes.ngYmapData) {
                    if (Array.isArray(scope[attributes.ngYmapData]))
                        $.each(scope[attributes.ngYmapData], function(index, item) {
                            scope.addPointToMap(item);
                        });
                    else
                        scope.addPointToMap(scope[attributes.ngYmapData]);
                }

                scope.yMap = myMap;

                $('ymaps').width($(element).width() + 'px');
            }

            ymaps.ready(init);
        }
    };
}]);