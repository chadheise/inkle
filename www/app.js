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
        "Registration",
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
        "ShareSettings"
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
	
    launch: function() {
        console.log("launching app");

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

		// Determine if the user is logged in
		var isLoggedIn;
		Ext.Ajax.request({
            async: false,
            url: "http://127.0.0.1:8000/isLoggedIn/",
            success: function(response) {
                isLoggedIn = response.responseText;
            },
            failure: function(response) {
                Ext.Msg.alert("Errors", response.errors);
                console.log(response.responseText);
            }
		});

		// Show the main tab view is the user is logged in
		if (isLoggedIn === "True") {
			Ext.Viewport.add([
				{ xtype: "mainTabView" }
			]);
		}
		
		// Otherwise, show the login view
		else {
			Ext.Viewport.add([
				{ xtype: "loginView" }
			]);
		}
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
