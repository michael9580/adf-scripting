'use strict';

angular.module('angularjsAuthTutorialApp')
    .controller('TopLevelAppCtrl', ['$scope', 'UserDataService', function ($scope, UserDataService) {

        $scope.currentUser = UserDataService.getCurrentUser();



    }])
    .controller('NavigationCtrl', ['$scope', function($scope) {

        $scope.hasUser = false;


        $scope.$watch('currentUser', function(newValue, oldValue) {

            $scope.hasUser = !!newValue;
        })

    }])
    .controller('MainCtrl', ['$scope', function ($scope) {



    }])
    .controller('LoginCtrl', ['$scope', '$location', 'UserEventsService', function($scope, $location, UserEventsService) {


        $scope.$on(UserEventsService.login.loginSuccess, function(e, userDataObj) {

            $scope.$parent.currentUser = userDataObj;
            $location.url('/');
        });

    }])
    .controller('LogoutCtrl', ['$scope', '$location', 'UserEventsService', function($scope, $location, UserEventsService) {

        $scope.$on(UserEventsService.logout.logoutSuccess, function(e, userDataObj) {

            $scope.$parent.currentUser = userDataObj;
            $location.url('/')
        })
    }])
    .controller('UserInfoCtrl', ['$scope', 'getUserData', function($scope, getUserData) {

        $scope.userData = getUserData;



    }]);
