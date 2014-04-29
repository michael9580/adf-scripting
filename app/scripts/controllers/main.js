'use strict';

// Get our Application Module
angular.module('angularjsAuthTutorialApp')

    // Top level application controller.  This serves a pseudo $rootScope for our application
    // controllers.  We inject the UserDataService from our DreamFactory User Management Module
    // so that we have access to the User Object that is stored there upon login.
    .controller('TopLevelAppCtrl', ['$scope', 'UserDataService', function ($scope, UserDataService) {

        // We defined a current user var that can be inherited
        // by our child controllers.  We can get the current user
        // by asking our UserDataService for it using the function getCurrentUser()
        $scope.currentUser = UserDataService.getCurrentUser();
    }])

    // Our Navigation controller inherits from our TopLevelAppCtrl controller.
    // This controller keeps track of what navigation should be displayed.
    .controller('NavigationCtrl', ['$scope', function($scope) {

        // Scope var to access whether a user is logged in or not
        $scope.hasUser = false;


        // We can watch our parent $scope.currentUser var.
        // When it changes we...
        $scope.$watch('currentUser', function(newValue, oldValue) {

            // Set the local $scope.hasUser var to true or false
            // The '!!' coerces the value of 'newValue' to a boolean
            $scope.hasUser = !!newValue;
        });
    }])

    // The controller for our main app home page.
    .controller('MainCtrl', ['$scope', function ($scope) {

        // Nothing going on in here


    }])

    // Our LoginCtrl controller inherits from our TopLevelAppCtrl controller
    // This controller provides an attachment point for our Login Functionality
    // We inject $location because we'll want to update our location on a successful
    // login and the UserEventsService from our DreamFactory User Management Module to be able
    // to respond to events generated from that module
    .controller('LoginCtrl', ['$scope', '$location', 'UserEventsService', function($scope, $location, UserEventsService) {


        // Listen for the login success message which returns a user data obj
        // When we have a successful login...
        $scope.$on(UserEventsService.login.loginSuccess, function(e, userDataObj) {

            // Set our parent's current user var
            $scope.$parent.currentUser = userDataObj;

            // Change our app location back to the home page
            $location.url('/');
        });

    }])

    // Our LogoutCtrl controller inherits from out TopLevelAppCtrl controller
    // This controller provides an attachment point for our logout functionality
    // We inject $location and the UserEventsService...same as the LoginCtrl.
    .controller('LogoutCtrl', ['$scope', '$location', 'UserEventsService', function($scope, $location, UserEventsService) {

        // Listen for the logout success message
        // then we...
        $scope.$on(UserEventsService.logout.logoutSuccess, function(e, userDataObj) {

            // Set the current user var on the parent
            // the userDataObj passed with the success message is just a boolean
            // and should be 'false'
            $scope.$parent.currentUser = userDataObj;

            // Redirect back to the app home page
            $location.url('/')
        });
    }])

    // Our UserInfoCtrl controller inherits from our TopLevelAppCtrl controller
    // We have injected 'getUserData' which is the name of a function declared in the resolve
    // property of our router for this particular route.  If it was successful and we ended
    // up fulfilling this route instead of being redirected we can access the preloaded data
    // in 'getUserData'
    .controller('UserInfoCtrl', ['$scope', 'getUserData', function($scope, getUserData) {

        // Assign our preloaded data to a scope var to make it available in our template.
        $scope.userData = getUserData;
    }])

    // Our ErrorCtrl controller inherits from our TopLevelAppCtrl controller
    // This controls displaying our errors to our user.
    .controller('ErrorCtrl', ['$scope', function($scope) {

        // $scope var to store the error
        $scope.currentError = null;

        // Custom function to pull the DreamFactory Error out of a
        // DreamFactory error object
        $scope.parseDreamFactoryError = function (errorDataObj) {

            // create a place to store the error
            var error = null;

            // If the exception type is a string we don't need to go any further
            // This was thrown explicitly by the module due to a module error
            // unrelated to the server
            if (typeof errorDataObj.exception === 'string') {

                // store the error
                // and we're done
                error = errorDataObj.exception;

                // the exception is not a string
                // let's assume it came from the server
            }else {

                // is there more than one error contained in the object
                if(errorDataObj.exception.data.error.length > 1) {

                    // yes. Let's loop through and concat these to display to the user
                    angular.forEach(errorDataObj.exception.data.error, function(obj) {

                        // add the message from each error obj to the error store
                        error += obj.message + '\n';
                    });

                // We only have on error
                }else {

                    // store that error message
                    error = errorDataObj.exception.data.error[0].message;
                }
            }

            // return the built message to display to the user
            return errorDataObj.module + ': ' + error

        };

        // Function to reset the error
        $scope.clearError = function() {

            // set the error to null
            $scope.currentError = null;
        };


        // Listen for a error of type DreamFactory from our decorated $exceptionHandler
        // which resides in app.js
        $scope.$on('error:dreamfactory', function(e, errorMessageObj) {

            // Parse this particular error and assign it to our current error $scope var
            $scope.currentError = $scope.parseDreamFactoryError(errorMessageObj);
        });

    }])

    // Our RegisterCtrl controller inherits from our TopLevelAppCtrl controller
    // This controller provides an attachment point for our register users functionality
    // We inject $location and UserEventService for the same reasons as stated in the LoginCtrl controller
    // description.
    .controller('RegisterCtrl', ['$scope', '$location', 'UserEventsService', function($scope, $location, UserEventsService) {


        // Listen for a register success message
        // This returns a user credentials object which is just the email and password
        // from the register form
        // on success we...
        $scope.$on(UserEventsService.register.registerSuccess, function(e, userCredsObj) {

            // Send a message to our login directive requesting a login.
            // We send our user credentials object that we received from our successful
            // registration along to it can log us in.
            $scope.$broadcast(UserEventsService.login.loginRequest, userCredsObj);
        });


        // Listen for a register confirmation message
        // on confirmation required we...
        $scope.$on(UserEventsService.register.registerConfirmation, function(e) {

            // redirect to our registration thanks page
            // that contains more directions
            $location.url('/register-confirm')
        });

        // We handle login the same way here as we did in the LoginCtrl controller
        // While this breaks the DRY(Don't repeat yourself) rule... we don't have access
        // to the LoginCtrl to do this for us and although we could ping from route to route
        // in order not to write the same code twice...the user experience would suffer and
        // we would probably write more code trying not to repeat ourselves.
        $scope.$on(UserEventsService.login.loginRequest, function(e, userDataObj) {

            // Assign the user to the parent current user var
            $scope.$parent.currentUser = userDataObj;

            // redirect to the app home page
            $location.url('/');
        })
    }]);


// End main.js