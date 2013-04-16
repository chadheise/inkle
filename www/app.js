/*Ext.Loader.setConfig( {enabled: true, disableCaching: true} );
Ext.data.Connection.disableCaching = true;
Ext.data.JsonP.disableCaching = true;*/
//Ext.data.proxy.Server.prototype.noCache = true;
//Ext.Ajax.disableCaching = true;

Ext.application({
    name: "inkle",

    models: [
    ],
    stores: [
    ],
    views: [
        "Main",
        "Login",
        "LoginForm",
        "ForgottenPassword",
        "ResetPassword",
        "Registration",
        "Offline",
        "AllInklings",
        "MyInklings",
        "NewInkling",
        "NewInklingInvitedFriends",
        "Inkling",
        "InklingFeed",
        "InklingMembersAttending",
        "InklingMembersAwaitingReply",
        "Friends",
        "AddFriends",
        "GroupMembers",
        "Settings",
        "InviteFacebookFriends",
        "LinkFacebookAccount",
        "ShareSettings",
        "ChangePassword",
        "ChangeEmail",
        "Walkthrough"
    ],
    controllers: [
        "MainTabController",
        "LoginController",
        "AllInklingsController",
        "InklingController",
        "MyInklingsController",
        "FriendsController",
        "SettingsController"
    ],

    requires: [
    ],

    /*
    icon: {
        57: "resources/icons/Icon.png",
        72: "resources/icons/Icon~ipad.png",
        114: "resources/icons/Icon@2x.png",
        144: "resources/icons/Icon~ipad@2x.png"
    },

    phoneStartupScreen: "resources/loading/Homescreen.jpg",
    tabletStartupScreen: "resources/loading/Homescreen~ipad.jpg",
    */

    //Set the base url for all server requests
    baseUrl: "http://chads-macbook-pro.local:8000", //Used for testing from Chad's iPhone
    //baseUrl: "http://127.0.0.1:8000",

    /*Push Notification functions */
    myLog: document.getElementById("log"),
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
     bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('resume', this.onResume, false);
    },
    onResume: function() {
        inkle.app.myLog.value="";
        // Clear the badge number - if a new notification is received it will have a number set on it for the badge
        inkle.app.setBadge(0);
        inkle.app.getPending(); // Get pending since we were reopened and may have been launched from a push notification
    },
    onDeviceReady: function() {
        inkle.app.register(); // Call to register device immediately every time since unique token can change (per Apple)
        
        // This will cause to fire when app is active already
        document.addEventListener('push-notification', function(event) {
            console.log('RECEIVED NOTIFICATION! Push-notification! ' + event);
            inkle.app.myLog.value+=JSON.stringify(['\nPush notification received!', event]);
            // Could pop an alert here if app is open and you still wanted to see your alert
            //navigator.notification.alert("Received notification - fired Push Event " + JSON.stringify(['push-//notification!', event]));
        });
        document.removeEventListener('deviceready', this.deviceready, false);
    },
    setBadge: function(num) {
        var pushNotification = window.plugins.pushNotification;
        inkle.app.myLog.value+="Clear badge... \n";
        pushNotification.setApplicationIconBadgeNumber(num);
    },
    receiveStatus: function() {
        var pushNotification = window.plugins.pushNotification;
        pushNotification.getRemoteNotificationStatus(function(status) {
            inkle.app.myLog.value+=JSON.stringify(['Registration check - getRemoteNotificationStatus', status])+"\n";
        });
    },
    getPending: function() {
        var pushNotification = window.plugins.pushNotification;
        pushNotification.getPendingNotifications(function(notifications) {
            inkle.app.myLog.value+=JSON.stringify(['getPendingNotifications', notifications])+"\n";
            console.log(JSON.stringify(['getPendingNotifications', notifications]));
        });
    },
    register: function() {
        var pushNotification = window.plugins.pushNotification;
        pushNotification.registerDevice({alert:true, badge:true, sound:true}, function(status) {
            inkle.app.myLog.value+=JSON.stringify(['registerDevice status: ', status])+"\n";
            inkle.app.storeToken(status.deviceToken);
        });
    },
    storeToken: function(token) {
        console.log("Token is " + token);
        var xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST","http://127.0.0.1:8888",true);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send("token="+token+"&message=pushnotificationtester");
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4) {
                //a response now exists in the responseTest property.
                console.log("Registration response: " + xmlhttp.responseText);
                inkle.app.myLog.value+="Registration server returned: " + xmlhttp.responseText;
            }
        }
    },
    /******************************/

    /* Application launch */
    launch: function() {
        console.log("launching app");
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/getCsrfToken/",

            callback: function(a, b, response) {
                // Get the CSRF token
                var csrfToken = response.responseText;

                // Turn off caching and set the CSRF token for all Ajax requests
                Ext.Ajax.on("beforerequest", function (connection, options) {
                    if (typeof(options.headers) == "undefined") {
                        options.headers = {
                            "cache-control": "no-cache",
                            "X-CSRFToken": csrfToken
                        };
                    }
                    else {
                        options.headers["cache-control"] = "no-cache";
                        options.headers["X-CSRFToken"] = csrfToken;
                    }
                }, this);

                //Request push notification permissions
                /*alert('inside app.js');
                alert(window.plugins.pushNotification);
                var pushNotification = window.plugins.pushNotification;
                pushNotification.registerDevice({alert:true, badge:true, sound:true}, function(status) {
                    inkle.app.myLog.value+=JSON.stringify(['registerDevice status: ', status])+"\n";
                    inkle.app.storeToken(status.deviceToken);
                });*/

                // Determine if the user is logged in and show the appropriate page
                Ext.Ajax.request({
                    url: inkle.app.baseUrl + "/isLoggedIn/",

                    success: function(response) {
                        var isLoggedIn = response.responseText;

                        // Show the main tab view if they are logged in
                        if (isLoggedIn === "True") {
                            Ext.Viewport.add([
                                { xtype: "mainTabView" }
                            ]);
                        }

                        // Show the login view if they are not logged in
                        else if (isLoggedIn === "False") {
                            Ext.Viewport.add([
                                { xtype: "loginView" }
                            ]);
                        }

                        // Show the offline view if they are offline
                        else {
                            Ext.Viewport.add([
                                { xtype: "offlineView" }
                            ]);
                        }
                    },

                    failure: function(response) {
                        // Show the offline view if they are offline
                        Ext.Viewport.add([
                            { xtype: "offlineView" }
                        ]);
                    }
                });
            }
        });
        
        var _this = this;
        document.addEventListener("resume", function(){
            _this.resume();
        });

        // TODO: add online/offline events
    },

    resume: function() {
        console.log("resume");
    },

    /*
    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function() {
                window.location.reload();
            }
        );
    }
    */
});
