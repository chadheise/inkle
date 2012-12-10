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

            // Other
            linkFacebookAccountMessage: "#linkFacebookAccountMessage",

        },
        control: {
            settingsView: {
                settingsLogoutButtonTapped: "logout",
                settingsEditButtonTapped: "editSettings",
                inviteFacebookFriendsTapped: "inviteFacebookFriends",
                inviteFacebookFriendsBackButtonTapped: "inviteFacebookFriendsBack",
            },
            inviteFacebookFriendsView: {
           		inviteFriendButtonTapped: "inviteFriend"
           	},
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
 
    inviteFriend: function(memberId) {
		var inviteFriendButton = Ext.fly("member" + memberId + "InviteFriendButton");
		
		inviteFriendButton.set({
			"value" : "Sent"
		});
		
	    //var fbConnected = false;
		var fbAccessToken = "";
		FB.getLoginStatus(function(response) {
          if (response.status === 'connected') {
            // the user is logged in and has authenticated your
            // app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed
            // request, and the time the access token 
            // and signed request each expire
                //fbConnected = true;
                //var uid = response.authResponse.userID;
            fbAccessToken = response.authResponse.accessToken;
          } else if (response.status === 'not_authorized') {
            // the user is logged in to Facebook, 
            // but has not authenticated your app
          } else {
            // the user isn't logged in to Facebook.
          }
         });
		
		Ext.Ajax.request({
		    // THIS INCLUDES THE CLEINT_SECRET AND SHOULD NOT BE VISIBLE TO USERS - May need to hide on server side
    		url: "https://graph.facebook.com/oauth/access_token?client_id=355653434520396&client_secret=e6df96d1801e704fecd7cb3fea71b944&grant_type=client_credentials",
        	success: function(response) {
                appAccessToken = response.responseText.replace("access_token=", "");
        	    fbId = memberId.replace("fb","");
        		
        		var postData = {
        		    access_token: fbAccessToken,
        		    //body: 'body',
        		    message: "I've been using inkle to easily make social plans. You should join too!",
        		    link: "www.facebook.com/inkleit"
        		}
        		console.log(postData);
                FB.api('/' + fbId + '/feed', 'post', postData, function(response) {
                  if (!response || response.error) {
                    alert("You have not given inkle permission to post on your behalf. Enable these permissions to invite your friends.");
                    console.log(response);
                    FB.login(function() {
                      if (response.authResponse) {
                        // user gave permission        
                      } else {
                        // user did not give permission
                      }
                    }, {scope:'publish_stream'});
                  } else {
                    alert("A message inviting them to inkle has been posted to their facebook feed.");
                  }
                });
        	
        	},
        	failure: function(response) {
        		alert("Error", response.responseText);
        	}
		});
	},
 
    /* Logs the user in with facbeook and links their existing account to facebook */
	linkFacebookAccount: function() {
        var object = this;
        var facebookAccessToken;
        FB.login(function(response) {
            if (response.authResponse) {
                facebookAccessToken = response.authResponse.accessToken;
                 FB.api("/me", function(response) {
           		   //Log the user in to inkle
               	   Ext.Ajax.request({
                       url: "http://127.0.0.1:8000/sencha/linkFacebookAccount/",
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
                           //this.activateMainTabView();
                           alert("success!");
                       },
                       failure: function(response) {
                           Ext.Msg.alert(response.error);
                        },
                       	scope: object
               		});
                 });
               } else {
                 alert("User cancelled login or did not fully authorize.");
               }
            }, {scope: "email,user_birthday,publish_stream"});
    },

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
            var message = ""
            Ext.Ajax.request({
    			async: false,
    			url: "http://127.0.0.1:8000/sencha/isFacebookUser/",
    			success: function(response) {
    				if (response.responseText == "True") {
    				    message = [
            	            "<div>",
            	            "   <span>You must be logged in with facebook to invite facebook friends.</span>",
            	            "</div>",
            	        ].join("");
    				}
    				else {
    				    message = [
            	            "<div>",
            	            "   <span>To find facebook friends you need to link your inkle account to facebook. ",
            	            "Once you do so, you can login via email or facebook</span>",
            	            "</div>",
            	        ].join("");
    				}
    			},
    			failure: function(response) {
            		alert("Error " + response.errors);
    			}
    		});
            
            this.getSettingsView().push({
        	    xtype: "linkFacebookAccountView"
            });
            
            this.getLinkFacebookAccountMessage().setHtml(message);
            
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