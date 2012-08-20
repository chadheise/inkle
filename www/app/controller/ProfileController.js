Ext.define("inkle.controller.ProfileController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            profileView: "profileView",
            loginView: "loginView"
        },
        control: {
            profileView: {
                profileLogoutButtonTapped: "logout",
                profileEditButtonTapped: "editProfile"
            }
        }
    },
	
	/* Transitions */
    activateLoginView: function() {
    	console.log("Activating login view");
    	
    	// Destroy the old login view, if it exists
        if (this.getLoginView()) {
        	this.getLoginView().destroy();
        }
        
        // Create the login view
        var loginView = Ext.create("inkle.view.Login");
        
        // Animate the login view
        Ext.Viewport.animateActiveItem(loginView, { type: "slide", direction: "down" });
    },
	
    /* Commands */
    logout: function() {
        console.log("logout");
    
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
		
		this.activateLoginView();
    },
 
    editProfile: function() {
        console.log("editProfile");
    }
});