Ext.define("inkle.controller.SettingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            settingsView: "settingsView",
            loginView: "loginView",
            loginFormView: "loginFormView",
            registrationView: "registrationView",
            inviteFacebookFriendsView: "inviteFacebookFriendsView"
        },
        control: {
            settingsView: {
                settingsLogoutButtonTapped: "logout",
                settingsEditButtonTapped: "editSettings",
                inviteFacebookFriendsTapped: "inviteFacebookFriends"
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
    	alert("inside controller");
    	// Push the invite facebook friends view onto the settings view
    	console.log(this.getSettingsView());
    	this.getSettingsView().push({
        	xtype: "inviteFacebookFriendsView"
        });
        alert("controller 2");
    },
 
    editSettings: function() {
        console.log("editSettings");
    }
});