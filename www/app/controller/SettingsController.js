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
            shareSettingsView: "shareSettingsView",
            
            // Toolbar buttons
            settingsLogoutButton: "#settingsLogoutButton",
            inviteFacebookFriendsBackButton: "#inviteFacebookFriendsBackButton",
            shareSettingsBackButton: "#shareSettingsBackButton",

            // Other
            linkFacebookAccountMessage: "#linkFacebookAccountMessage",
            settingsList: "#settingsList",

        },
        control: {
            settingsView: {
                settingsLogoutButtonTapped: "logout",
                settingsEditButtonTapped: "editSettings",
                inviteFacebookFriendsTapped: "inviteFacebookFriends",
                inviteFacebookFriendsBackButtonTapped: "inviteFacebookFriendsBack",
                shareSettingsTapped: "shareSettings",
                shareSettingsBackButtonTapped: "shareSettingsBack",
                initialize: "initializeSettingsView"
            },
            inviteFacebookFriendsView: {
           		inviteFriendButtonTapped: "inviteFriend",
           	},
           	linkFacebookAccountView: {
           	    linkFacebookAccountTapped: "linkFacebookAccount",
           	},
           	shareSettingsView: {
           	    selectedGroupsShareSettingTapped: "selectSelectedGroupsShareSetting",
            	groupShareSettingTapped: "toggleGroupShareSetting",
            	noOneShareSettingTapped: "selectNoOneShareSetting",
            	forwardingShareSettingTapped: "toggleForwardingShareSetting",
           	}
        }
    },
	
	initializeSettingsView: function() {
    
        //Determine if the user is logged in with facebook
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
    
        // Update the settings list based on whether or not the user is logged in with facebook
        var settingsListStore = this.getSettingsList().getStore();
        if (fbAccessToken != "") {
             settingsListStore.setData([
        			{ text: "Notifications", key: "notifications" },
        			{ text: "Sharing", key: "sharing"},
        			{ text: "Invite Facebook Friends", key: "inviteFacebookFriends"}
        		]);
        }
        else {
            settingsListStore.setData([
        			{ text: "Update email", key: "email"},
        			{ text: "Update password", key: "password" },
        			{ text: "Update picture", key: "picture" },
        			{ text: "Notifications", key: "notifications" },
        			{ text: "Sharing", key: "sharing" },
        			{ text: "Invite Facebook Friends", key: "linkFacebookAccount" },
        			{ text : "Link to Facebook account", key: "linkFacebookAccount" }
        		]);
        }
        //settingsListStore.load();
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
			url: "http://127.0.0.1:8000/logout/",
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
                        url: "http://127.0.0.1:8000/linkFacebookAccount/",
                        params: {
                            facebookId: response.id,
                            facebookAccessToken: facebookAccessToken,
                   		    email: response.email
                   	    },
               		    callback: function(options, success, response) {
                            var realSuccess = JSON.parse(response.responseText)["success"];
                            var error = JSON.parse(response.responseText)["error"];
                            if (realSuccess) {
                                this.activateLoginView();
                            }
                            else {
                                Ext.Msg.alert(error);
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
    
    shareSettings: function() {
        // Push the share settings view
        this.getSettingsView().push({
    	    xtype: "shareSettingsView"
        });
        //Update buttons
        this.getSettingsLogoutButton().hide();
        this.getShareSettingsBackButton().show();
    },
    
    shareSettingsBack: function() {
        this.getSettingsView().pop();
        this.getShareSettingsBackButton().hide();
        this.getSettingsLogoutButton().show();
    },
 
    editSettings: function() {
        console.log("editSettings");
    },
    
    /*Share Settings */
    selectSelectedGroupsShareSetting: function(selectedGroupsShareSetting) {
        //Only make ajax call if the item was not selected
	    if (selectedGroupsShareSetting.getAttribute("src") == "resources/images/deselected.png") {
    	    Ext.Ajax.request({
                url: "http://127.0.0.1:8000/setShareSetting/",
                headers : { "cache-control": "no-cache" },
                params: {
                    setting: "shareWithSelectedGroups",
                    value: "true"
               	},
                success: function(response) {
                    //Only change selection images if call was a success
                    selectedGroupsShareSetting.set({
            	       "src": "resources/images/selected.png" 
            	    });

            	    Ext.get('shareSettingsOptions').select('img.groupShareSetting').each(function() {
                        if (this.getAttribute("src") == "resources/images/fadedselected.png") {
                            this.set({
                                "src": "resources/images/selected.png"
                            });
                        }
                    });

            	    var noOneShareSetting = Ext.get('shareSettingsOptions').select(".noOneShareSetting");
                    noOneShareSetting.set({
            			"src": "resources/images/deselected.png"
            		});
                },
                failure: function(response) {
                    console.log(response.responseText);
                },
                scope: this
            });
        }
	},
	
	toggleGroupShareSetting: function(groupShareSetting) {
    	var value = "true";
    	if (groupShareSetting.getAttribute("src") == "resources/images/selected.png") {
            value = "false";
        }
        var group_id = groupShareSetting.getAttribute("groupId");
        //Select query returns a set of objects, there should only be one so we get it with elements[0]
    	var selectedGroupsShareSetting = Ext.get("shareSettingsOptions").select(".selectedGroupsShareSetting").elements[0];
	    if (selectedGroupsShareSetting.getAttribute("src") == "resources/images/selected.png") {
            //Only make ajax call if the selectedGroupsShareSetting is selected
    	    Ext.Ajax.request({
                url: "http://127.0.0.1:8000/setShareSetting/",
                headers : { "cache-control": "no-cache" },
                params: {
                    setting: "shareGroupByDefault",
                    value: value,
                    group_id: group_id
               	},
                success: function(response) {
                    //Only change selection images if call was a success
                    if (groupShareSetting.getAttribute("src") == "resources/images/selected.png") {
            			groupShareSetting.set({
            				"src": "resources/images/deselected.png"
            			});
            	    }
            	    else {
            	        groupShareSetting.set({
            				"src": "resources/images/selected.png"
            			});
            	    }
                },
                failure: function(response) {
                    console.log(response.responseText);
                },
                scope: this
            });
	    }
	},
	
	selectNoOneShareSetting: function(noOneShareSetting) {
	    //Only make ajax call if the item was not selected
	    if (noOneShareSetting.getAttribute("src") == "resources/images/deselected.png") {
    	    Ext.Ajax.request({
                url: "http://127.0.0.1:8000/setShareSetting/",
                headers : { "cache-control": "no-cache" },
                params: {
                    setting: "shareWithSelectedGroups",
                    value: "false"
               	},
                success: function(response) {
                    //Only change selection images if call was a success
                    noOneShareSetting.set({
            	       "src": "resources/images/selected.png" 
            	    });

            	    Ext.get('shareSettingsOptions').select('img.groupShareSetting').each(function() {
                        if (this.getAttribute("src") == "resources/images/selected.png") {
                            this.set({
                                "src": "resources/images/fadedselected.png"
                            });
                        }
                    });

            	    var selectedGroupsShareSetting = Ext.get("shareSettingsOptions").select(".selectedGroupsShareSetting");
                    selectedGroupsShareSetting.set({
            			"src": "resources/images/deselected.png"
            		});
                },
                failure: function(response) {
                    console.log(response.responseText);
                },
                scope: this
            });
        }
	},
	
	toggleForwardingShareSetting: function(forwardingShareSetting) {
	    var value = "true";
	    if (forwardingShareSetting.getAttribute("src") == "resources/images/selected.png") {
			value = "false";
	    }
	    
	    //Only make ajax call if the item was not selected
	    Ext.Ajax.request({
            url: "http://127.0.0.1:8000/setShareSetting/",
            headers : { "cache-control": "no-cache" },
            params: {
                setting: "allowInklingAttendeesToShare",
                value: value
           	},
            success: function(response) {
                //Only change selection images if call was a success
                if (forwardingShareSetting.getAttribute("src") == "resources/images/selected.png") {
        			forwardingShareSetting.set({
        				"src": "resources/images/deselected.png"
        			});
        	    }
        	    else {
        	        forwardingShareSetting.set({
        				"src": "resources/images/selected.png"
        			});
        	    }
            },
            failure: function(response) {
                console.log(response.responseText);
            },
            scope: this
        });
	},
    
});
