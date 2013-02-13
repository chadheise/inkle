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
    	"ShareSettings",
    	"changePassword",
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
	baseUrl: "http://chads-macbook-pro.local:8000",
	//baseUrl: "http://127.0.0.1:8000",
	
    launch: function() {
		// Determine if the user is logged in
		var isLoggedIn;
		Ext.Ajax.request({
    		async: false,
    		url: inkle.app.baseUrl + "/isLoggedIn/",
		    success: function(response) {
        		isLoggedIn = response.responseText;
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Errors", response.errors);
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
