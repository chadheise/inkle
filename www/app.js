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
        "ChangeEmail"
    ],
    controllers: [
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
    //baseUrl: "http://chads-macbook-pro.local:8000", //Used for testing from Chad's iPhone
    baseUrl: "http://127.0.0.1:8000",
    //baseUrl: "http://10.0.1.27:8000", //Used for android emulator on Chad's mac

    /* Application launch */
    launch: function() {
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
    }

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
