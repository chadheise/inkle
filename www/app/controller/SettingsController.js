Ext.define("inkle.controller.SettingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            settingsView: "settingsView",
            loginView: "loginView",
            loginFormView: "loginFormView",
            registrationView: "registrationView",
            inviteFacebookFriendsView: "inviteFacebookFriendsView",
            inviteFacebookFriendsList: "#inviteFacebookFriendsList",
            linkFacebookAccountView: "linkFacebookAccountView",
            
            // Toolbar buttons
            settingsLogoutButton: "#settingsLogoutButton",
            inviteFacebookFriendsBackButton: "#inviteFacebookFriendsBackButton",

        },
        control: {
            settingsView: {
                settingsLogoutButtonTapped: "logout",
                settingsEditButtonTapped: "editSettings",
                inviteFacebookFriendsTapped: "inviteFacebookFriends",
                inviteFacebookFriendsBackButtonTapped: "inviteFacebookFriendsBack",
            }
        }
    },
	
	/* Transitions */
    activateLoginView: function() {
    	// Destroy the old login view, if it exists
        if (this.getLoginView()) {
        	this.getLoginView().destroy();
        }
        if (this.getLoginFormView()) {
            this.getLoginFormView().destroy();
        }
        if (this.getRegistrationView()) {
            this.getRegistrationView().destroy();
        }
        
        // Create the login view
        var loginView = Ext.create("inkle.view.Login");
        
        // Animate the login view
        Ext.Viewport.animateActiveItem(loginView, { type: "slide", direction: "down" });
    },
	
    /* Commands */
    logout: function() {
        //Logout of facebook
        FB.logout(function(response) {
          // user is now logged out
        });
    
		Ext.Ajax.request({
			async: false,
			url: "http://127.0.0.1:8000/sencha/logout/",
			success: function(response) {
				console.log("Logged out");
			},
			failure: function(response) {
        		Ext.Msg.alert("Error", response.errors);
			}
		});
		
		// Active the login view
		this.activateLoginView();
    },
 
    /* Activates the add friends view from the friends view friends list */
	inviteFacebookFriends: function() {
        
        var fbAccessToken = "";
		FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                fbAccessToken = response.authResponse.accessToken;
            } else if (response.status === 'not_authorized') {
                // the user is logged in to Facebook, 
                // but has not authenticated your app
            } else {
                // the user isn't logged in to Facebook.
            }
        });
        
        if (fbAccessToken != "") {
            // Push the invite facebook friends view onto the settings view
            this.getSettingsView().push({
        	    xtype: "inviteFacebookFriendsView"
            });
            
            // Update the invite facebook friends list
            var inviteFacebookFriendsListStore = this.getInviteFacebookFriendsList().getStore();
            inviteFacebookFriendsListStore.setProxy({
                extraParams: {
                    fbAccessToken: fbAccessToken
                }
    		});
            inviteFacebookFriendsListStore.load();
        }
        else {
            // Push the view to link their account to facebook
            alert("not fb logged in");
            this.getSettingsView().push({
        	    xtype: "linkFacebookAccountView"
            });
        }

        //Update buttons
        this.getSettingsLogoutButton().hide();
        this.getInviteFacebookFriendsBackButton().show();
         
    },
 
    inviteFacebookFriendsBack: function() {
        this.getSettingsView().pop();
        this.getInviteFacebookFriendsBackButton().hide();
        this.getSettingsLogoutButton().show();
    },
 
    editSettings: function() {
        console.log("editSettings");
    }
});