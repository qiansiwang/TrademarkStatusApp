angular.module('main').service("AppInitService", function($q, $window, $cordovaSQLite, $cordovaPushV5, $http, $rootScope, AppConfig, TrademarkService, $cordovaBadge, $state){

    this.initializeApp = function(){
        console.log("Initializing App");
        var _this = this;
        if(!window.localStorage.getItem("deviceId")){
            TrademarkService.registerDeviceWithServer().then(function(res){
                var deviceId = res.data;
                window.localStorage.setItem("deviceId", deviceId);
                $rootScope.glDeviceId = deviceId;
                _this.initPush();
            })
        }else{
            $rootScope.glDeviceId = window.localStorage.getItem("deviceId");
            TrademarkService.checkStatusUpdates();
        }
        TrademarkService.logSession();
        //this.openCustomUrlConditionally();
    }



    this.reinitializeApp = function(){
        $rootScope.glDeviceId = window.localStorage.getItem("deviceId");
        this.initPush();
        PushNotification.hasPermission(function(data){
            // permission granted
            if(data.isEnabled){
                console.log("Push permission enabled");
            }else{
                console.log("Push no permission");
            }
        });

        TrademarkService.checkStatusUpdates();
        TrademarkService.logSession();
        //this.openCustomUrlConditionally();
    }

    this.initPush = function(){
        console.log("Starting initPush()")
        $cordovaPushV5.initialize({
            ios: {
                alert: "true",
                sound: 'true',
                "badge": "true"
            },
            android: {
                senderID: "589617667328"
            },
            windows: {}
        }).then(function(res){
            var push = res;
            console.log("On Push initialize");
            // this method is called in iOS even though user does not yet give permission, so need to check hasPermission()
            push.on("registration", function(data){
                console.log("Push On registration ");
                var registrationId = data.registrationId;
                // save the registration id to the database
                console.log("Push registration id - "+registrationId);
                PushNotification.hasPermission(function(data){
                    var push_enabled = 0;
                    if(data.isEnabled){
                        console.log("Push permission enabled");
                        push_enabled = 1;
                    }
                    TrademarkService.updatePushProperties(registrationId, push_enabled);
                });
            });
            push.on("notification", function(data){
                var additionalData = data.additionalData;
                $window.localStorage.setItem("status_updates", true);
                console.log(additionalData);
                console.log(data.message);

                /* // badge count is being set on push payload, so don't need it here
                TrademarkService.updateBadgeCount().then(function(){
                    push.finish(function(){
                        console.log("Finished processing push notification successfully");
                    });
                }, function(err){
                    push.finish(function(){
                        console.log("Finished processing push notification with error");
                    });
                });
                */
            });
            push.on("error", function(error){
                console.log("Error in push - "+error);
            })

        })
    }

    this.openCustomUrlConditionally = function(){
        if(window.localStorage.getItem("external_load")){
            var url = window.localStorage.getItem("external_load");
            window.localStorage.removeItem("external_load")
            $state.go("tab.search", {searchString: url});
        }
    }

});

