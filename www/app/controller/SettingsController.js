Ext.define("inkle.controller.SettingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            settingsView: "settingsView",
            loginView: "loginView"
        },
        control: {
            settingsView: {
                settingsLogoutButtonTapped: "logout",
                settingsEditButtonTapped: "editSettings"
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
		
		// Active the login view
		this.activateLoginView();
    },
 
    editSettings: function() {
        console.log("editSettings");
    }
});