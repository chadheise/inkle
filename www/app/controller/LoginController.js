Ext.define("inkle.controller.LoginController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            // Views
            loginView: "loginView",
            loginFormView: "loginFormView",
            registrationView: "registrationView",
            mainTabView: "mainTabView",
            allInklingsGroupsListPanel: "panel[id=allInklingsGroupsListPanel]",
            allInklingsDatePickerPanel: "panel[id=allInklingsDatePickerPanel]",
            inklingInvitationsPanel: "panel[id=inklingInvitationsPanel]",
            
            // Elements
            loginEmail: "#loginFormEmail",
            loginPassword: "#loginFormPassword",
            registrationFirstName: "#registrationFormFirstName",
            datePicker: "#allInklingsDatePicker",
            allInklingsDateButton: "#allInklingsDateButton",
            inklingInvitationsButton: "#inklingInvitationsButton",
            requestsButton: "#friendsViewRequestsButton",
        },
        control: {
            loginView: {
                emailLoginButtonTapped: "activateLoginFormView",
				facebookLoginButtonTapped: "loginWithFacebook",
				registrationTapped: "activateRegistrationView"
            },
            
            loginFormView: {
                loginFormCancelButtonTapped: "activateLoginView",
                loginFormLoginButtonTapped: "loginWithEmail"
            },
            
            registrationView: {
                registrationFormCancelButtonTapped: "activateLoginView",
                registrationFormRegisterButtonTapped: "registerMember"
            },
            
            mainTabView: {
                activate: "setBadges",
            }
        }
    },
    
    /**********************/
	/*  HELPER FUNCTIONS  */
	/**********************/
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
    
    /**********************/
	/*  VIEW TRANSITIONS  */
	/**********************/
	/* Creates and activates the login form view */
	activateLoginFormView: function() {
	    if (this.getLoginFormView())
	    {
	        Ext.Viewport.animateActiveItem(this.getLoginFormView(), { type: "flip" });
	    }
	    else
	    {
            var loginFormView = Ext.create("inkle.view.LoginForm");
	        Ext.Viewport.animateActiveItem(loginFormView, { type: "flip" });
	    }

	    // Set the focus on the email input
	    this.getLoginEmail().focus();
	    //windows.scrollTo(0,0);
	},
	
	/* Creates and activates the registration view */
	activateRegistrationView: function() {
	    if (this.getRegistrationView())
	    {
	        Ext.Viewport.animateActiveItem(this.getRegistrationView(), { type: "flip" });
	    }
	    else
	    {
            var registrationView = Ext.create("inkle.view.Registration");
	        Ext.Viewport.animateActiveItem(registrationView, { type: "flip" });
	    }
	    
	    // Set the focus on the first name input
	    this.getRegistrationFirstName().focus();
	},
	
	/* Activates the login view */
	activateLoginView: function() {
	    Ext.Viewport.animateActiveItem(this.getLoginView(), { type: "flip" });
	},
	
	/* Creates and activates the main tab view */
    activateMainTabView: function() {
        // Destroy the main tab view
		if (this.getMainTabView()) {
            this.getMainTabView().destroy();
		}
		
		// Destroy all other components
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
        Ext.Viewport.animateActiveItem(mainTabView, {
            type: "slide",
            direction: "up"
        });
    },
	
    /**************/
	/*  COMMANDS  */
	/**************/
	/* Submits the login form */
    loginWithEmail: function() {
		this.getLoginFormView().submit({
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
    
    /* Logs the user in with Facebook */
	loginWithFacebook: function() {
        var object = this;
        FB.login(function(response) {
            if (response.authResponse) {
                var facebookAccessToken = response.authResponse.accessToken;
                FB.api("/me", function(response) {
                    Ext.Ajax.request({
                        url: inkle.app.baseUrl + "/facebookLogin/",
                        headers : { "cache-control": "no-cache" },
                        params: {
                            facebookId: response.id,
                            facebookAccessToken: facebookAccessToken,
                            email: response.email,
                            firstName: response.first_name,
                            lastName: response.last_name,
                            birthday: response.birthday,
                            gender: response.gender
                        },

                        callback: function(options, success, response) {
                            var realSuccess = JSON.parse(response.responseText)["success"];
                            var error = JSON.parse(response.responseText)["error"];
                            if (realSuccess) {
                                this.activateMainTabView();
                            }
                            else {
                                Ext.Msg.alert("Error", error);
                                FB.logout();
                            }
                        },

                        scope: object
                    });
                });
            }
            else {
                alert("User cancelled login or did not fully authorize.");
            }
        },
        {
            scope: "email,user_birthday,publish_stream"
        });
    },
    
    /* Registers a new member */
    registerMember: function() {
		this.getRegistrationView().submit({
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
    
    /* Sets the badges in the "My Inklings" and "Friends" tabs */
    setBadges: function() {
        // Set the "My Inklings" tab and inkling invites badges
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/numInklingInvitations/",
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
            url: inkle.app.baseUrl + "/numFriendRequests/",
            
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
