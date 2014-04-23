'use strict';

angular
    .module('angularjsAuthTutorialApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'dfUserManagement'
    ])
    .constant('DSP_URL', 'http://localhost:8081')
    .constant('DSP_API_KEY', 'admin')
    .config(['$httpProvider', 'DSP_API_KEY', function ($httpProvider, DSP_API_KEY) {

        // Set default headers for http requests
        $httpProvider.defaults.headers.common["X-DreamFactory-Application-Name"] = DSP_API_KEY;

    }])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/logout', {
                templateUrl: 'views/logout.html',
                controller: 'LogoutCtrl'
            })
            .when('/user-info', {
                templateUrl: 'views/user-info.html',
                controller: 'UserInfoCtrl',
                resolve: {

                    getUserData: ['$location', 'UserDataService', function($location, UserDataService) {

                        if (!UserDataService.getCurrentUser()) {

                            $location.url('/login');
                        }else {

                            return UserDataService.getCurrentUser();
                        }
                    }]
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .config(['$provide', function($provide) {
        $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function($delegate, $injector) {
            return function(exception) {


                if (exception.provider === 'dreamfactory') {

                    $injector.invoke(['$rootScope', function($rootScope) {

                        $rootScope.$broadcast('error:dreamfactory',  exception);
                    }]);
                }
                else {

                    return $delegate(exception);
                }
            }
        }])
    }]);
