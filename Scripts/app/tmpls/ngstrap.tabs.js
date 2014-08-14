angular.module('mgcrea.ngStrap.tab').run(['$templateCache', function ($templateCache) {
    $templateCache.put(
        'tab/tab.tpl.html',
        "<ul class=\"nav nav-tabs panel-background-gray\"><li ng-repeat=\"pane in panes\" ng-class=\"{active: $index == active}\"><a style=\"cursor: pointer;\" data-toggle=\"tab\" ng-click=\"setActive($index, $event)\" data-index=\"{{$index}}\">{{pane.title}}</a></li></ul><div class=\"tab-content panel-padding\"><div ng-repeat=\"pane in panes\" class=\"tab-pane\" ng-class=\"[$index == active ? 'active' : '']\" ng-include=\"pane.template || '$pane'\"></div></div>");

}]);