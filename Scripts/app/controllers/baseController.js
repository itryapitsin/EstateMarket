app.controller("BaseController", ['$scope', '$q', '$timeout', '$window', '$modal',
    function ($scope, $q, $timeout, $window, $modal) {

        moment.lang('ru');
        $scope.moment = moment;

        $scope.showDialog = function (templateUrl, onSuccess, onCancel, beforeShow) {
            var self = this;

            if (!onSuccess)
                onSuccess = $scope.hideDialog;
            if (!onCancel)
                onCancel = $scope.hideDialog;

            self.onSuccess = onSuccess;
            self.onCancel = onCancel;

            var modalPromise = $modal({
                template: templateUrl,
                show: false,
                backdrop: 'static',
                animation: 'am-fade-and-scale',
                scope: self
            });

            $window.modalPromise = modalPromise;

            return modalPromise.$promise.then(function () {
                if (beforeShow)
                    beforeShow(self);

                modalPromise.show();
               // $(".modal-backdrop").addClass("in");
            });
        };

        $scope.showDialogEx = function (templateUrl, obj) {
            if (obj)
                return $scope.showDialog(
                    templateUrl,
                    obj.onSuccess,
                    obj.onCancel,
                    obj.beforeShow);

            return $scope.showDialog(templateUrl);

            //var self = this;

            //if (!obj && !obj.onSuccess)
            //    obj.onSuccess = $scope.hideDialog;
            //if (!obj && !obj.onCancel)
            //    obj.onCancel = $scope.hideDialog;

            //self.onSuccess = obj.onSuccess;
            //self.onCancel = obj.onCancel;

            //var modalPromise = $modal({
            //    template: templateUrl,
            //    show: false,
            //    backdrop: 'static',
            //    animation: 'am-fade-and-scale',
            //    scope: self
            //});

            //$window.modalPromise = modalPromise;

            //return modalPromise.$promise.then(function () {
            //    if (!obj && !obj.beforeShow)
            //        obj.beforeShow(self);

            //    modalPromise.show();
            //});
        };

        $scope.showLoadingAnimation = function () {
            $scope.loading = true;
        };

        $scope.hideLoadingAnimation = function () {
            $timeout(function () {
                $scope.loading = false;
            }, 250);
        };

        $scope.hideDialog = function () {
            return $window.modalPromise.$promise.then(function () {
                modalPromise.hide();
            });
        };

        $scope.clearAfterTimeout = function (prop, timeout) {
            var scope = this;

            $timeout(function () {
                delete scope[prop];
            }, timeout ? timeout : 5000);
        };
    }]);