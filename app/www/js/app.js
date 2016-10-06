// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var handleOpenURL = function(url) {
    console.log("RECEIVED URL: " + url);
    // remove TSDRMobile:// from path
    url = url.slice(13);
    window.localStorage.setItem("external_load", url);
};
angular.module('main', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ionic-multiselect'])

    .run(function($ionicPlatform, $window, $rootScope, $cordovaSQLite, $cordovaPushV5, AppInitService, $state) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            console.log("Device ready called");
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar requiredreini
                StatusBar.styleDefault();
            }
            // $rootScope.serverBaseUrl = "http://localhost:3001";
            $rootScope.serverBaseUrl = "http://tsdrservicelb-689905421.us-east-1.elb.amazonaws.com";

            //$window.setTimeout(function(){AppInitService.initializeApp();}, 15000);
            AppInitService.initializeApp();

            $ionicPlatform.on("resume", function(){
                console.log("App resumed");
                AppInitService.reinitializeApp();
                if($window.localStorage.getItem("status_updates")){
                    $window.localStorage.removeItem("status_updates");
                    $state.go("tab.statusUpdates");
                }
            });
        });
    })

    .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // Each tab has its own nav history stack:

            .state('tab.search', {
                url: '/search?searchString',
                views: {
                    'tab-search': {
                        templateUrl: 'templates/tab-search.html',
                        controller: 'SearchController'
                    }
                }
            })

            .state('tab.search-trademarkDetails', {
                url: '/search/trademarkDetails',
                params: {params: null},
                views: {
                    'tab-search': {
                        templateUrl: 'templates/trademark-detail.html',
                        controller: 'TrademarkDetailController'
                    }
                }
            })

            .state('tab.notebooks',{
                cache: false,
                url: '/notebooks',
                views: {
                    'tab-notebooks':{
                        templateUrl: 'templates/tab-notebooks.html',
                        controller: 'NotebooksController'
                    }
                }
            })

            .state("tab.bookmarks",{
                cache: false,
                url:'/notebooks/:notebookId/bookmarks',
                views:{
                    'tab-notebooks':{
                        templateUrl: 'templates/bookmarks.html',
                        controller: 'BookmarksController'
                    }
                }
            })

            .state('tab.bookmarks-trademarkDetails', {
                url: '/bookmarks/trademarkDetails',
                params: {params: null},
                views: {
                    'tab-notebooks': {
                        templateUrl: 'templates/trademark-detail.html',
                        controller: 'TrademarkDetailController'
                    }
                }
            })

            .state("tab.statusUpdates",{
                cache: false,
                url:'/notebooks/statusUpdates',
                views:{
                    'tab-notebooks':{
                        templateUrl: 'templates/status-updates.html',
                        controller: 'StatusUpdatesController'
                    }
                }
            })

            .state('tab.statusUpdates-trademarkDetails', {
                url: '/statusUpdates/trademarkDetails',
                params: {params: null},
                views: {
                    'tab-notebooks': {
                        templateUrl: 'templates/trademark-detail.html',
                        controller: 'TrademarkDetailController'
                    }
                }
            })

            .state('tab.settings',{
                url: '/settings',
                views: {
                    'tab-settings':{
                        templateUrl: 'templates/tab-settings.html',
                        controller: 'SettingsController'
                    }
                }
            })

            .state("tab.preferredStatusCodes",{
                url:'/settings/preferredStatusCodes',
                views:{
                    'tab-settings':{
                        templateUrl: 'templates/preferred-status-codes.html',
                        controller: 'PreferredStatusCodesController'
                    }
                }
            })

            .state("tab.statuscode",{
                url:'/settings/statusGroups/:statusGroupId/statuscode',
                views:{
                    'tab-settings':{
                        templateUrl: 'templates/tab-statuscode.html',
                        controller: 'StatusCodesController'
                    }
                }
            })

            .state("tab.help",{
                url:'/settings/help',
                views:{
                    'tab-settings':{
                        templateUrl: 'templates/help.html',
                        controller: 'HelpController'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/search');

    });
