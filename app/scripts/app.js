'use strict';

// Define our application module and add dependencies
angular.module('angularjsAuthTutorialApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'dfUserManagement'
    ])
    // Set our constants for our DreamFactory Modules
    .constant('DSP_URL', 'http://localhost:8083')
    .constant('DSP_API_KEY', 'admin')

    // Configure AngularJS $http headers for the DSP
    // We pass in our DSP_API_KEY constant as the value of our header
    .config(['$httpProvider', 'DSP_API_KEY', function ($httpProvider, DSP_API_KEY) {

        // Set default headers for http requests
        $httpProvider.defaults.headers.common["X-DreamFactory-Application-Name"] = DSP_API_KEY;

    }])
    // Configure our router
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
            .when('/register', {
                templateUrl: 'views/register.html',
                controller: 'RegisterCtrl'
            })
            .when('/register-confirm', {
                templateUrl: 'views/register-confirm.html'
            })
            .when('/user-info', {
                templateUrl: 'views/user-info.html',
                controller: 'UserInfoCtrl',
                // Use the resolve property to check the UserDataService
                // for a logged in user
                resolve: {

                    // We define a property in our resolve object and attach our function
                    // We inject $location and our UserDataService
                    // if we are successful(we have a logged in user) return the user data
                    // That user data will bre available to the UserInfoCtrl controller and can be
                    // injected like a service.  See UserInfoCtrl in main.js on how to use this data
                    getUserData: ['$location', 'UserDataService', function ($location, UserDataService) {

                        // Check if we have a current user
                        if (!UserDataService.getCurrentUser()) {

                            // we don't so redirect
                            $location.url('/login');

                        // we do
                        } else {

                            // return the current user
                            return UserDataService.getCurrentUser();
                        }
                    }]
                }
            })
            .when('/script-test', {
                templateUrl: 'views/script-test.html',
                controller: 'ScriptTestCtrl',
                resolve: {

                    getEventList: ['DSP_URL', '$http', function(DSP_URL, $http) {

                        return $http({

                            method: 'GET',
                            url: DSP_URL + '/rest/system/event',
                            params: {
                                all_events: true
                            }
                        });
                    }],

                    getRecentScripts: ['DSP_URL', '$http', function(DSP_URL, $http) {


                        return $http({
                            method: 'GET',
                            url: DSP_URL + '/rest/system/script'
                        });


                    }],

                    getSchemaService: ['DSP_URL', '$http', function (DSP_URL, $http) {

                        var requestDataObj = {

                        };

                        return $http({
                            method: 'GET',
                            url: DSP_URL + '/rest/schema'
                        });
                    }]

                }
            })
            .otherwise({
                redirectTo: '/'
            });
    })

    // Setup a decorator for our $exceptionHandler to
    // extend the functionality of $exceptionHandler
    // We inject the $provider and we ask the provider to provide a decorator
    .config(['$provide', function ($provide) {

        // We want to decorate the $exceptionHandler and we'll need access to the original service
        // which is the $delegate and we'll need access to $rootScope to broadcast a message
        // down to our ErrorCtrl controller.  So we inject the $injector.  We can't inject $rootScope here.
        $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function ($delegate, $injector) {
            return function (exception) {

                // If our exception is an object and the provider is 'dreamfactory'
                if (exception.provider === 'dreamfactory') {

                    // Inject rootScope
                    $injector.invoke(['$rootScope', function ($rootScope) {

                        // and fire a $broadcast message passing the exception object
                        $rootScope.$broadcast('error:dreamfactory', exception);
                    }]);
                }

                // We don't have an exception object with a provider type 'dreamfactory' so
                // just handle as normal
                else {

                    return $delegate(exception);
                }
            }
        }])
    }]);
