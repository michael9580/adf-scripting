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
    }])
    .controller('ScriptTestCtrl', ['DSP_URL', '$scope', '$http', 'getEventList', 'getSchemaService', function (DSP_URL, $scope, $http, getEventList, getSchemaService) {

        $scope.__getDataFromHttpResponse = function (httpResponseObj) {


            if (httpResponseObj.hasOwnProperty('data')) {

                if (httpResponseObj.data.hasOwnProperty('record')) {

                    return httpResponseObj.data.record;

                }else if (httpResponseObj.data.hasOwnProperty('resource')) {

                    return httpResponseObj.data.resource;

                }else {

                    console.log("Take a look at the response.  Can't parse.")
                    console.log(httpResponseObj);
                }
            }else {

                console.log("No data prop in response");
            }
        };


        // @TODO: Problem with parsing email.  Nothing returned at the momment.  Need to fix httpresp func to deal with that scenario.


        // PUBLIC VARS
        $scope.events = $scope.__getDataFromHttpResponse(getEventList);
        $scope.schemaService = $scope.__getDataFromHttpResponse(getSchemaService);

        $scope.serviceName = '/system/script';

        $scope.currentEvent = '';
        $scope.currentEventType = '';

        $scope.currentScript = '';
        $scope.currentScriptPath = '';

        $scope.eventList = [];


        $scope.staticEventName = 'static';
        $scope.preprocessEventName = "pre_process";
        $scope.postprocessEventName = "post_process";


        $scope.eventTypes = {
            staticEvent: {
                name: 'static',
                label: "Static"
            },
            preprocessEvent: {
                name: 'pre_process',
                label: 'Pre-Process'
            },
            postprocessEvent: {
                name: 'post_process',
                label: 'Post-Process'
            }
        };


        $scope.menuOpen = true;
        $scope.menuEventType = '';
        $scope.menuEventPath = '';
        $scope.menuLevel = 0;

        $scope.breadcrumbs = [];

        $scope.isClean = true;


        // PUBLIC API
        $scope.toggleMenu = function () {

            $scope._toggleMenu();
        };

        $scope.setEvent = function (event) {

            $scope._setEvent(event);
        };

        $scope.setEventType = function (eventType) {

            $scope._setEventType(eventType);
        };

        $scope.setEventPath = function (eventPath) {

            $scope._setEventPath(eventPath);
        };

        $scope.setScript = function (path, event) {

            $scope._setScript(path, event);
        }

        $scope.menuBack = function () {

            $scope._menuBack();
        };

        $scope.save = function () {

            $scope._save();
        };

        $scope.delete = function () {

            if ($scope._confirmDeleteScript()) {
                $scope._delete();
            }
        };


        // PRIVATE API

        $scope._setCurrentScriptPath = function(currentEventPathStr) {

            $scope.currentScriptPath = currentEventPathStr;
        };

        $scope._setCurrentScript = function (scriptNameStr) {

            $scope.currentScript = scriptNameStr;
        };

        $scope._createEventsList = function (event) {

            var eventFound = false,
                i = 0;

            while(!eventFound && i < $scope.events.length) {

                // $scope.events[i] becomes undefined inside of our .then()
                // So we'll store it here
                var theEvent = $scope.events[i];

                if ($scope.events[i].name === event) {

                    eventFound = true;

                    $scope._getServiceFromServer().then(
                        function (result) {

                            var records = $scope.__getDataFromHttpResponse(result);

                            if (records) {

                                // Not sure why $scope.events[i[ is undefined at this point
                                //console.log($scope.events[i])
                                $scope._createEvents(theEvent, records);
                            }


                        },
                        function (reject) {



                        }
                    );
                    $scope.eventList = $scope.events[i];

                }
                i++
            }
        };

        $scope._getServiceFromServer = function () {


            return $http({
                method: 'GET',
                url: DSP_URL + '/rest/' + $scope.currentEvent.name
            })
        };

        $scope._stripLeadingSlash = function (path) {

            if (path.path.substring(0,1) === '/') {
                path.path = path.path.slice(1, path.path.length);

            }
        };

        $scope._createEvents = function(event, associatedData) {

            if (event.paths[1].path.indexOf("table_name") != "-1" ) {
                angular.forEach(event.paths, function (path) {


                   $scope._stripLeadingSlash(path);


                    var preEvent, postEvent, preObj, postObj, deleteEvent, selectEvent, updateEvent, insertEvent;
                    var pathIndex = path.path.lastIndexOf("/") + 1;
                    var pathName = path.path.substr(pathIndex);

                    angular.forEach(associatedData, function(obj) {

                        var newpath = {};
                        updateEvent = {"type": "put",
                            "event": [
                                event.name + "." + obj.name + ".update"
                            ]};
                        deleteEvent = {"type": "delete",
                            "event": [
                                event.name + "." + obj.name + ".delete"
                            ]};
                        insertEvent = {"type": "post",
                            "event": [
                                event.name + "." + obj.name + ".insert"
                            ]};
                        selectEvent = {"type": "get",
                            "event": [
                                event.name + "." + obj.name + ".select"
                            ]};
                        newpath.verbs = [];
                        newpath.path = "/" + event.name + "/" + obj.name;

                        path.verbs.forEach(function (verb) {
                            preEvent = event.name + "." + obj.name + "." + verb.type + "." + "pre_process";
                            preObj = {"type": verb.type, "event": [preEvent]};
                            postEvent = event.name + "." + obj.name + "." + verb.type + "." + "post_process";
                            postObj = {"type": verb.type, "event": [postEvent]};


                            newpath.verbs.push(preObj);
                            newpath.verbs.push(postObj);

                        });

                        var found = false;
                        event.paths.forEach(function (pathObj) {

                            if (pathObj.path === newpath.path) {
                                found = true;
                            }

                        });

                        if (!found) {
    //                                            newpath.verbs.push(selectEvent);
    //                                            newpath.verbs.push(insertEvent);
    //                                            newpath.verbs.push(updateEvent);
    //                                            newpath.verbs.push(deleteEvent);
                            event.paths.push(newpath)
                        }
                    })
                })
            }
            else if (event.paths[1].path.indexOf("container") != "-1") {

                angular.forEach(event.paths, function (path) {

                    $scope._stripLeadingSlash(path);


                    var preEvent, postEvent, preObj, postObj, deleteEvent, selectEvent, updateEvent, insertEvent;
                    var pathIndex = path.path.lastIndexOf("/") + 1;
                    var pathName = path.path.substr(pathIndex);

                    var newpath = {};
                    angular.forEach(associatedData, function(obj) {
                        newpath = {};
                        updateEvent = {"type": "put",
                            "event": [
                                event.name + "." + obj.name + ".update"
                            ]};
                        deleteEvent = {"type": "delete",
                            "event": [
                                event.name + "." + obj.name + ".delete"
                            ]};
                        insertEvent = {"type": "post",
                            "event": [
                                event.name + "." + obj.name + ".insert"
                            ]};
                        selectEvent = {"type": "get",
                            "event": [
                                event.name + "." + obj.name + ".select"
                            ]};
                        newpath.verbs = [];
                        newpath.path = "/" + event.name + "/" + obj.name;

                        path.verbs.forEach(function (verb) {
                            preEvent = event.name + "." + obj.name + "." + verb.type + "." + "pre_process";
                            preObj = {"type": verb.type, "event": [preEvent]};
                            postEvent = event.name + "." + obj.name + "." + verb.type + "." + "post_process";
                            postObj = {"type": verb.type, "event": [postEvent]};


                            newpath.verbs.push(preObj);
                            newpath.verbs.push(postObj);

                        });
                        var found = false;
                        event.paths.forEach(function (pathObj) {

                            if (pathObj.path === newpath.path) {
                                found = true;
                            }

                        });
                        if (!found) {
    //                                                newpath.verbs.push(selectEvent);
    //                                                newpath.verbs.push(insertEvent);
    //                                                newpath.verbs.push(updateEvent);
    //                                                newpath.verbs.push(deleteEvent);
                            event.paths.push(newpath)
                        }

                    });
                });
            }
            else {
                angular.forEach(event.paths, function (path) {

                    $scope._stripLeadingSlash(path);

                    var preEvent, postEvent, preObj, postObj, deleteEvent, selectEvent, updateEvent, insertEvent;
                    var pathIndex = path.path.lastIndexOf("/") + 1;
                    var pathName = path.path.substr(pathIndex);

                    angular.forEach(path.verbs, function(verb){

                        if (event.name !== pathName) {
                            preEvent = event.name + "." + pathName + "." + verb.type + "." + "pre_process";
                            postEvent = event.name + "." + pathName + "." + verb.type + "." + "post_process";
                        } else {
                            preEvent = pathName + "." + verb.type + "." + "pre_process";
                            postEvent = pathName + "." + verb.type + "." + "post_process";
                        }
                        preObj = {"type": verb.type, "event": [preEvent]};
                        postObj = {"type": verb.type, "event": [postEvent]};
                        path.verbs.push(preObj);
                        path.verbs.push(postObj);

                    });
                });
            }
        };

        $scope._confirmCloseScript = function () {

            return confirm('Save script before closing?');
        };

        $scope._confirmDeleteScript = function () {

            return confirm("Delete script?");
        }

        $scope._closeScript = function () {

            if (!$scope.isClean) {
                if ($scope._confirmCloseScript()) {
                    $scope.save();
                }
            }
        };


        // Menu Control
        $scope._setMenuToggle = function (stateBool) {

            $scope.menuOpen = stateBool;
        };

        $scope._toggleMenuState = function () {

            $scope.menuOpen = !$scope.menuOpen;
        };

        $scope._setCurrentEvent = function (event) {

            $scope.currentEvent = event;
        };

        $scope._setCurrentEventType = function (eventType) {

            $scope.menuEventType = eventType;
        };

        $scope._setCurrentEventPath = function (eventPath) {

            $scope.menuEventPath = eventPath;
        };

        $scope._incrementMenuLevel = function () {

            $scope.menuLevel++;
        };

        $scope._decrementMenuLevel = function () {

            $scope.menuLevel--;
        };

        $scope._setMenuLevel = function (levelInt) {

            $scope.menuLevel = levelInt;
        };

        $scope._jumpToMenu = function (index) {


            index = index || null;

            switch($scope.menuLevel) {

                case 0:
                    $scope._setCurrentEvent('');
                    $scope._setCurrentEventType('');
                    $scope._setCurrentEventPath('');
                    $scope._setCurrentScript('');

                    if (index) {
                        $scope._bcRemovePaths(index);
                    }else {
                        $scope._bcRemovePath();
                    }

                    break;

                case 1:
                    $scope._setCurrentEventType('');
                    $scope._setCurrentEventPath('');
                    $scope._setCurrentScript('');

                    if (index) {
                        $scope._bcRemovePaths(index);
                    }else {
                        $scope._bcRemovePath();
                    }
                    break;

                case 2:
                    $scope._setCurrentEventPath('');
                    $scope._setCurrentScript('');

                    if (index) {
                        $scope._bcRemovePaths(index);
                    }else {
                        $scope._bcRemovePath();
                    }
                    break;

                case 3:
                    $scope._closeScript();
                    $scope._setCurrentScript('');
                    $scope._bcRemovePath();
                    break;

                default:
            }
        }


        // Breadcrumbs
        $scope._bcAddPath = function (bcPathStr) {

            $scope.breadcrumbs.push(bcPathStr);
        };

        $scope._bcRemovePath = function () {

            $scope.breadcrumbs.pop();
        };

        $scope._bcRemovePaths = function (index) {

            $scope.breadcrumbs.splice(index, $scope.breadcrumbs.length - index);
        }

        $scope._bcReplaceLastPath = function(newPathStr) {

            $scope.breadcrumbs[$scope.breadcrumbs.length - 1] = newPathStr;
        };

        $scope._bcJumpTo = function (index) {

            $scope._closeScript();
            $scope._setMenuLevel(index + 1);
            $scope._jumpToMenu(index + 1);
        };


        // Event Sorting
        $scope._isStaticEvent = function (verb) {

            if(verb.event[0].substr(verb.event[0].length - $scope.preprocessEventName.length, $scope.preprocessEventName.length) === $scope.preprocessEventName
                || verb.event[0].substr(verb.event[0].length - $scope.postprocessEventName.length, $scope.postprocessEventName.length) === $scope.postprocessEventName){

                return false;
            }

            return true;
        };

        $scope._isPreprocessEvent = function (verb) {

            if(verb.event[0].substr(verb.event[0].length - $scope.preprocessEventName.length, $scope.preprocessEventName.length) === $scope.preprocessEventName) {
                return true;
            }

            return false;
        };

        $scope._isPostprocessEvent = function (verb) {

            if (verb.event[0].substr(verb.event[0].length - $scope.postprocessEventName.length, $scope.postprocessEventName.length) === $scope.postprocessEventName) {

                return true;
            }

            return false;
        };

        $scope._isVariablePath = function (path) {

            if (path.path.indexOf("}") != "-1") {

                return true;
            }

            return false;
        }

        $scope._hasStaticEvent = function (path) {

            var hasStaticEvent = false,
                i = 0;

            while (!hasStaticEvent && i < path.verbs.length ) {

                if ($scope._isStaticEvent(path.verbs[i])) {

                    hasStaticEvent = true;
                }

                i++;
            }

            return hasStaticEvent;
        };

        $scope._hasPreprocessEvent = function (path) {

            var hasPreprocessEvent = false,
                i = path.verbs.length - 1;

            while (!hasPreprocessEvent && i >= 0) {

                if ($scope._isPreprocessEvent(path.verbs[i])) {

                    hasPreprocessEvent = true;
                }

                i--
            }

            return hasPreprocessEvent;
        };

        $scope._hasPostprocessEvent = function (path) {

            var hasPostprocessEvent = false,
                i = path.verbs.length - 1;


            while (!hasPostprocessEvent && i >= 0) {

                if ($scope._isPostprocessEvent(path.verbs[i])) {

                    hasPostprocessEvent = true;

                }

                i--
            }

            return hasPostprocessEvent;
        };



        // COMPLEX IMPLEMENTATION
        $scope._toggleMenu = function() {

            $scope._toggleMenuState();
        };

        $scope._setEvent = function (event) {

            $scope._setCurrentEvent(event);
            $scope._bcAddPath(event.name);
            $scope._incrementMenuLevel();

        };

        $scope._setEventType = function (eventType)  {

            $scope._setCurrentEventType(eventType);
            $scope._bcAddPath(eventType.name);
            $scope._incrementMenuLevel();

        };

        $scope._setEventPath = function (eventPath) {

            $scope._setCurrentEventPath(eventPath);
            $scope._bcAddPath(eventPath.path);
            $scope._incrementMenuLevel();

        };

        $scope._setScript = function (currentEventPathStr, currentScriptStr) {

            if (!$scope.currentScript) {
                $scope._bcAddPath(currentScriptStr);
                $scope._incrementMenuLevel();
            }else {

                if ($scope.isClean) {

                    $scope._bcReplaceLastPath(currentScriptStr);

                }else {
                    $scope._closeScript()
                        $scope._bcReplaceLastPath(currentScriptStr);
                }
            }

            $scope._setCurrentScript(currentScriptStr);
            $scope._setCurrentScriptPath(currentEventPathStr);

        };

        $scope._menuBack = function () {

            if ($scope.menuLevel === 0) return false;

            $scope._decrementMenuLevel();
            $scope._jumpToMenu();
        };

        $scope._save = function () {

            $scope.$broadcast('save:script');
        };

        $scope._delete = function () {

            $scope.$broadcast('delete:script');
        };


        // WATCHERS AND INIT
        var watchCurrentEvent = $scope.$watch('currentEvent', function (newValue, oldValue) {

            if (!newValue) return false;

            $scope._createEventsList(newValue.name);
        });


        // MESSAGES
        $scope.$on('$destroy', function (e) {

            watchCurrentEvent();
        });

    }])
    .directive('dfAceEditor', ['DSP_URL', '$http', function (DSP_URL, $http) {

        return {
            restrict: 'E',
            scope: {
                serviceName: '=',
                fileName: '=',
                filePath: '=',
                isClean: '='
            },
            templateUrl: 'views/df-ace-editor.html',
            link: function (scope, elem, attrs) {



                scope.editor = null;
                scope.currentScriptObj = '';


                // PRIVATE API
                scope._getFileFromServer = function (requestDataObj) {

                    return $http({
                        method: 'GET',
                        url: DSP_URL + '/rest' + requestDataObj.serviceName + '/' + requestDataObj.fileName,
                        cache: false
                    })
                };

                scope._saveFileOnServer = function (requestDataObj) {

                    return $http({
                        method: 'PUT',
                        url: DSP_URL + '/rest' + requestDataObj.serviceName + '/' + requestDataObj.fileName,
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        data: {
                            post_body: requestDataObj.body
                        }
                    })
                };

                scope._deleteFileOnServer = function (requestDataObj) {

                    return $http({

                        method: 'DELETE',
                        url: DSP_URL + '/rest' + requestDataObj.serviceName + '/' + requestDataObj.fileName,
                        params: {
                            script_id:requestDataObj.scriptId
                        }
                    })
                };

                scope._setEditorInactive = function (stateBool) {

                    if (stateBool) {

                        scope.editor.setOptions({
                            readOnly: true,
                            highlightActiveLine: false,
                            highlightGutterLine: false
                        })
                        scope.editor.renderer.$cursorLayer.element.style.opacity=0;
                    }else {
                        scope.editor.setOptions({
                            readOnly: false,
                            highlightActiveLine: true,
                            highlightGutterLine: true
                        })
                        scope.editor.renderer.$cursorLayer.element.style.opacity=100;
                    }
                };

                scope._loadEditor = function (contents, mode, inactive) {

                    inactive = inactive || false;

                    scope.editor = ace.edit('ide');

                    scope.editor.setTheme("ace/theme/twilight");

                    if(mode){
                        scope.editor.session.setMode("ace/mode/json");
                    }else{
                        scope.editor.session.setMode("ace/mode/javascript");
                    }

                    scope._setEditorInactive(inactive);


                    scope.editor.session.setValue(contents);

                    scope.editor.focus();

                    scope.editor.on('input', function() {
                        scope.$apply(function() {
                            scope.isClean = scope.editor.session.getUndoManager().isClean();

                        })
                    });
                };

                scope._cleanEditor = function () {

                    scope.editor.session.getUndoManager().reset();
                    scope.editor.session.getUndoManager().markClean();
                };


                // WATCHERS AND INIT

                var watchScriptFileName = scope.$watch('fileName', function (newValue, oldValue) {

                    if (!newValue) {
                        console.log("no valiue");
                        scope._loadEditor('', false, true);
                        return false;
                    }

                    var requestDataObj = {
                        serviceName: scope.serviceName,
                        fileName: newValue
                    };

                    scope._getFileFromServer(requestDataObj).then(
                        function(result) {

                            scope.currentScript = result.data;
                            scope._loadEditor(result.data.script_body, false);



                        },
                        function(reject) {

                            scope._loadEditor('', false);

                        }
                    )
                });



                // MESSAGES
                scope.$on('$destroy', function (e) {

                    watchScriptFileName();
                });

                scope.$on('save:script', function(e) {

                    var requestDataObj = {
                            serviceName: scope.serviceName,
                            fileName: scope.fileName,
                            body:  scope.editor.getValue() || " "
                        };

                    scope._saveFileOnServer(requestDataObj).then(
                        function(result) {

                            scope._cleanEditor();
                            // @TODO: Handle Success
                        },
                        function(reject) {

                            console.log(reject)
                        }
                    )
                });

                scope.$on('delete:script', function (e) {

                    var requestDataObj = {
                        serviceName: scope.serviceName,
                        fileName: scope.fileName,
                        scriptId:  scope.currentScriptObj.script_id
                    };

                    scope._deleteFileOnServer(requestDataObj).then(
                        function(result) {

                            scope.editor.setValue('', false);
                            scope._cleanEditor();
                        },
                        function(reject) {

                            // @TODO: Handle failure
                            //console.log(reject)
                        }
                    )
                });
            }
        }
    }])
    .directive('dreamfactoryAutoHeight', ['$window', '$route', function ($window) {

        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {

                // Return jQuery window ref
                scope._getWindow = function () {

                    return $(window);
                };

                // Return jQuery document ref
                scope._getDocument = function () {

                    return $(document);
                };


                // Return jQuery window or document.  If neither justreturn the
                // string value for the selector engine
                scope._getParent = function(parentStr) {

                    switch (parentStr) {
                        case 'window':
                            return scope._getWindow()
                            break;

                        case 'document':
                            return scope._getDocument();
                            break;

                        default:
                            return $(parentStr);
                    }
                };


                // TODO: Element position/offset out of whack on route change.  Set explicitly.  Not the best move.
                scope._setElementHeight = function () {
                    angular.element(elem).css({
                        height: scope._getParent(attrs.autoHeightParent).height() - 173 - attrs.autoHeightPadding
                    });


                    /*console.log(scope._getParent(attrs.autoHeightParent).height());
                     console.log($(elem).offset().top)
                     console.log(angular.element(elem).height())*/
                };


                scope._setElementHeight();

                // set height on resize
                angular.element($window).on('resize', function () {
                    scope._setElementHeight();
                });
            }
        }
    }])


// End main.js