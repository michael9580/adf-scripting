'use strict';

angular
    .module('angularjsAuthTutorialApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'dfUserManagement'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
