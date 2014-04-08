'use strict';

angular.module('angularjsAuthTutorialApp')
    .controller('MainCtrl', ['$scope', function ($scope) {


    }])
    .controller('LoginCtrl', ['$scope', '$location', 'UserEventsService', function($scope, $location, UserEventsService) {


        $scope.$on(UserEventsService.login.loginSuccess, function(e, userDataObj) {

            $location.url('/');
        });

    }])
    .controller('LogoutCtrl', ['$scope', '$location', 'UserEventsService', function($scope, $location, UserEventsService) {

        $scope.$on(UserEventsService.logout.logoutSuccess, function(e) {

            $location.url('/')
        })
    }]);
