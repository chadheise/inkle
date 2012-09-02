Ext.define("inkle.controller.LoginController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            loginView: "loginView",
            mainTabView: "mainTabView",
            loginEmail: "#loginEmail",
            loginPassword: "#loginPassword",
            datePicker: "#allInklingsDatePicker",
            allInklingsDateButton: "#allInklingsDateButton"
        },
        control: {
            loginView: {
                loginSubmitButtonTapped: "loginSubmit",
				facebookLoginSubmitButtonTapped: "facebookLoginSubmit"
            }
        }
    },
    
    /* Helper functions */
	// Returns the day string associated with the inputted index
	getDayString: function(index) {
		var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		return days[index];
	},
	
	// Returns the month string associated with the inputted index
	getMonthString: function(index) {
		months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
		return months[index];
	},
    
    /* Transitions */
    activateMainTabView: function() {
    	console.log("Activating main tab view");
        
        // Reset the login form
        this.getLoginEmail().reset();
        this.getLoginPassword().reset();
        
        // Destroy the old main tab view, if it exists
        if (this.getMainTabView()) {
        	this.getMainTabView().destroy();
        }
        
        // Create the main tab view
        var mainTabView = Ext.create("inkle.view.Main");
        
        // Set the value of the date picker
        var datePicker = this.getDatePicker();
        today = new Date();
        datePicker.setValue(today);
        
        // Set the date of the date picker button
        var allInklingsDateButton = this.getAllInklingsDateButton();
	    var day = this.getDayString(today.getDay());
	    var date = today.getDate();
	    var month = this.getMonthString(today.getMonth());
	    allInklingsDateButton.setText(day + ", " + month + " " + date);
        
        // Animate the main tab view
        Ext.Viewport.animateActiveItem(mainTabView, { type: "slide", direction: "up" });
    },
	
    /* Commands */
    loginSubmit: function() {
		var loginView = this.getLoginView();

		loginView.submit({
			method: "POST",
						
         	waitMsg: {
         		xtype: "loadmask",
            	message: "Processing",
            	cls : "demos-loading"
         	},
         				
         	success: function(form, response) {
            	this.activateMainTabView();
         	},
         				
         	failure: function(form, response) {
        	    Ext.Msg.alert("Error", response.error);
         	},
         	
         	scope: this
        });
    },
	facebookLoginSubmit: function() {
        console.log("facebookLoginSubmit");
        var facebookId;
   		var email;
        FB.login(function(response) {
            if (response.authResponse) {
                 FB.api('/me', function(response) {
                   facebookId = response.id;
           		   email = response.email;
                 });
               } else {
                 alert('User cancelled login or did not fully authorize.');
               }
            }, {scope: 'email,user_birthday'});
		
		alert(facebookId);
        alert(email);
		
		//Log the user in to inkle
		Ext.Ajax.request({
    		url: "http://127.0.0.1:8000/login/",
    		params: {
    			facebookId: facebookId,
    			email: email
    		},
		    success: function(response) {
				/*if (response.responseText === "True") {
					this.getInklingFeedButton().show();
				}
				else {
					this.getJoinInklingButton().show();
				}*/
				console.log("Login successful");
            	this.activateMainTabView();
        	},
        	failure: function(response) {
        		console.log(response.responseText);
        		Ext.Msg.alert("Error", "Something went wrong.");
        	},
        	scope: this
		});
    }
});