Ext.define("inkle.controller.LoginController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            // Views
            loginView: "loginView",
            mainTabView: "mainTabView",
            allInklingsGroupsListPanel: "panel[id=allInklingsGroupsListPanel]",
            allInklingsDatePickerPanel: "panel[id=allInklingsDatePickerPanel]",
            inklingInvitationsPanel: "panel[id=inklingInvitationsPanel]",
            
            // Elements
            loginEmail: "#loginEmail",
            loginPassword: "#loginPassword",
            datePicker: "#allInklingsDatePicker",
            allInklingsDateButton: "#allInklingsDateButton",
            
            inklingInvitationsButton: "#inklingInvitationsButton",
            requestsButton: "#friendsViewRequestsButton",
        },
        control: {
            loginView: {
                loginSubmitButtonTapped: "loginSubmit",
				facebookLoginSubmitButtonTapped: "facebookLoginSubmit"
            },
            mainTabView: {
                activate: "setBadges",
            }
        }
    },
    
    /* Helper functions */
	/* Returns the day string associated with the inputted index */
	getDayString: function(index) {
		var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return days[index];
	},
	
	/* Returns the month string associated with the inputted index */
	getMonthString: function(index) {
		months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
		return months[index];
	},
    
    /* Transitions */
    activateMainTabView: function() {
    	console.log("Activating main tab view");
        
        // Reset the login form
        this.getLoginEmail().reset();
        this.getLoginPassword().reset();
        
        // Destroy the main tab view
		if (this.getMainTabView()) {
		    this.getMainTabView().destroy();
		}
		
		//Destroy all other components
		if (this.getAllInklingsGroupsListPanel()) {
		    this.getAllInklingsGroupsListPanel().destroy();
		}
		if (this.getAllInklingsDatePickerPanel()) {
		    this.getAllInklingsDatePickerPanel().destroy();
		}
		if (this.getInklingInvitationsPanel()) {
		    this.getInklingInvitationsPanel().destroy();
		}
        
        
        // Create the main tab view
        var mainTabView = Ext.create("inkle.view.Main");
        
        // Animate the main tab view
        Ext.Viewport.animateActiveItem(mainTabView, { type: "slide", direction: "up" });
        
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
        var object = this;
        var facebookAccessToken;
        FB.login(function(response) {
            if (response.authResponse) {
                facebookAccessToken = response.authResponse.accessToken;
                 FB.api('/me', function(response) {
           		   //Log the user in to inkle
               	   Ext.Ajax.request({
                       url: "http://127.0.0.1:8000/sencha/login/",
                       params: {
                           facebookId: response.id,
                           facebookAccessToken: facebookAccessToken,
                   		   email: response.email,
                   		   first_name: response.first_name,
                   		   last_name: response.last_name,
                   		   gender: response.gender,
                   		   birthday: response.birthday
                   	   },
               		   success: function(response) {
                           this.activateMainTabView();
                       },
                       failure: function(response) {
                           Ext.Msg.alert(response.error);
                        },
                       	scope: object
               		});
                 });
               } else {
                 alert('User cancelled login or did not fully authorize.');
               }
            }, {scope: 'email,user_birthday'});
    },
    
    setBadges: function() {
        console.log("Setting badges");
        
        console.log(this.getMainTabView() == true);
        
        // Set the "My Inklings" tab and inkling invites badges
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/numInklingInvitations/",
				success: function(response) {
					numInklingInvites = response.responseText;
					if (numInklingInvites != 0) {
						this.getMainTabView().getTabBar().getAt(1).setBadgeText(numInklingInvites);
						this.getInklingInvitationsButton().setBadgeText(numInklingInvites);
                    }
				},
				failure: function(response) {
					console.log(response.responseText);
	        	},
	        	scope: this
			});
        
        // Set the "Friends" tab and friends requests badges
        Ext.Ajax.request({
            url: "http://127.0.0.1:8000/sencha/numFriendRequests/",
            
            success: function(response) {
                numFriendRequests = response.responseText;
                if (numFriendRequests != 0) {
                    this.getMainTabView().getTabBar().getAt(2).setBadgeText(numFriendRequests);
                    this.getRequestsButton().setBadgeText(numFriendRequests);
                }
            },
            
            failure: function(response) {
                console.log(response.responseText);
            },
            
            scope: this
        });
    }
});