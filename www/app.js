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
        //"Ext.util.Cookies"
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
    baseUrl: "http://chads-macbook-pro.local:8000",
    //baseUrl: "http://127.0.0.1:8000",

    addFriendsTimeStamp: "",

    launch: function() {
        //console.log("a");
        //console.log(Ext.util.Cookies);
        //console.log("b");
        // Turn off caching for Ajax requests
        Ext.Ajax.on("beforerequest", function (connection, options) {
            //if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
                if (typeof(options.headers) == "undefined") {
                    //options.headers = {"X-CSRFToken": Ext.util.Cookies.get("csrftoken")};
                    options.headers = {"cache-control": "no-cache"};
                    //options.headers["X-CSRFToken"] = "testing";
                    //console.log(options.headers);
                }
                else {
                    //options.headers.extend({"X-CSRFToken": Ext.util.Cookies.get("csrftoken")});
                    options.headers["cache-control"] = "no-cache";
                    //options.headers["X-CSRFToken"] = "testing";
                    //console.log(options.headers);
                    //options.headers.extend({"cache-control": "no-cache"});
                }
            //}
        }, this);


        /*var cookieValue = null;
        console.log(document);
        console.log(document.cookie);
        if (document.cookie && document.cookie != '') {
            console.log("a");
            var cookies = document.cookie.split(';');
            console.log("a");
            for (var i = 0; i < cookies.length; i++) {
                console.log("b");
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        console.log(cookieValue);*/

        // Add csrf token to every ajax request
        //var csrf_token = document.getElementsByName("csrf-token")[0].getAttribute("content");
        //console.log(csrf_token);
        /*var token = Ext.util.Cookies.get("csrftoken");
        console.log(token);
        if(!token){
            Ext.Error.raise("Missing csrftoken cookie");
        } else {
            Ext.Ajax.defaultHeaders = Ext.apply(Ext.Ajax.defaultHeaders || {}, {
                "X-CSRFToken": token
            });
        }*/

        // Determine if the user is logged in and show the appropriate page
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/isLoggedIn/",

            success: function(response) {
                console.log(document.cookie);


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

        // using jQuery
        /*function getCookie(name) {
            console.log("getCookie()");
            var cookieValue = null;
            console.log(document.cookie);
            if (document.cookie && document.cookie != "") {
                console.log(cookies);
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        var csrftoken = getCookie('csrftoken');*/
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
