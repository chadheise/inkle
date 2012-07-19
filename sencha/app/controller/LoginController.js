Ext.define("inkle.controller.LoginController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            loginView: "loginView",
            mainTabView: "mainTabView",
            loginEmail: "#loginEmail",
            loginPassword: "#loginPassword",
            datePicker: "#allInklingsDatePicker",
            blotsPicker: "#allInklingsBlotsPicker",
            allInklingsDateButton: "#allInklingsDateButton"
        },
        control: {
            loginView: {
                loginSubmitButtonTapped: "loginSubmit"
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
    
    	// Set the blots picker to "All Blots"
        var blotsPicker = this.getBlotsPicker();
        blotsPicker.setValue({
        	blot: -1
        });
        
        // Animate the main tab view
        Ext.Viewport.animateActiveItem(mainTabView, { type: "slide", direction: "up" });
    },
	
    /* Commands */
    loginSubmit: function() {
        console.log("loginSubmit");
		
		var loginView = this.getLoginView();

		loginView.submit({
			method: "POST",
						
         	waitMsg: {
         		xtype: "loadmask",
            	message: "Processing",
            	cls : "demos-loading"
         	},
         				
         	scope: this,
         				
         	success: function(form, response) {
            	console.log("Login successful");
            	this.activateMainTabView();
         	},
         				
         	failure: function(form, response) {
         		console.log("Login failed");
        	    Ext.Msg.alert("Error", response.errors);
         	}
        });
    }
});