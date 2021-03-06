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
            changePasswordView: "changePasswordView",
            changeEmailView: "changeEmailView",

            // Toolbar buttons
            settingsLogoutButton: "#settingsLogoutButton",
            inviteFacebookFriendsBackButton: "#inviteFacebookFriendsBackButton",
            shareSettingsBackButton: "#shareSettingsBackButton",
            changePasswordBackButton: "#changePasswordBackButton",
            changePasswordSubmitButton: "#changePasswordSubmitButton",
            changeEmailBackButton: "#changeEmailBackButton",
            changeEmailSubmitButton: "#changeEmailSubmitButton",

            // Top toolbar segmented buttons
            requestsButton: "#friendsViewRequestsButton",

            // Lists
            friendsList: "#friendsViewFriendsList",
            requestsList: "#friendsViewRequestsList",

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

                changePasswordTapped: "loadChangePasswordView",
                changePasswordBackButtonTapped: "changePasswordBack",
                changePasswordSubmitButtonTapped: "changePassword",

                changeEmailTapped: "loadChangeEmailView",
                changeEmailBackButtonTapped: "changeEmailBack",
                changeEmailSubmitButtonTapped: "changeEmail",

                initialize: "initializeSettingsView"
            },
            inviteFacebookFriendsView: {
           		inviteFacebookFriendsViewListItemTapped: "activateFacebookFriendsActionSheet",
           	},
           	linkFacebookAccountView: {
           	    linkFacebookAccountTapped: "linkFacebookAccount",
           	},
           	shareSettingsView: {
           	    selectedGroupsShareSettingTapped: "selectSelectedGroupsShareSetting",
            	groupShareSettingTapped: "toggleGroupShareSetting",
            	noOneShareSettingTapped: "selectNoOneShareSetting",
            	forwardingShareSettingTapped: "toggleForwardingShareSetting",
           	},
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
        			{ text: "Change email", key: "email"},
        			{ text: "Change password", key: "password" },
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

    changePasswordBack: function() {
        this.getSettingsView().pop();
        this.getChangePasswordBackButton().hide();
        this.getSettingsLogoutButton().show();
    },

    /* Commands */
    logout: function() {
        //Logout of facebook
        FB.logout(function(response) {
          // user is now logged out
        });

		Ext.Ajax.request({
			async: false,
			url: inkle.app.baseUrl + "/logout/",
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

    activateFacebookFriendsActionSheet: function(data) {
        var userId = data["memberId"];
        var facebookId = data["facebookId"];
        var relationship = data["relationship"];
        var inviteFacebookFriendsStore = this.getInviteFacebookFriendsList().getStore();

        //Create the possible action sheet buttons
        var addFriend = {
            text: "Add Friend",
            cls: "actionSheetNormalButton",
            handler: function(button, event) {
        		Ext.Ajax.request({
            		url: inkle.app.baseUrl + "/addFriend/",
            		params: {
            			memberId: userId
            		},
            		success: function(response) {
            		    var personRecord = inviteFacebookFriendsStore.findRecord("memberId", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "pending");

                        //Change relationship badge to "Pending"
                        Ext.fly("inviteFacebookFriendsRelationshipTag" + userId).setHtml('<span class="relationship">Pending</span>');
            		},
                	failure: function(response) {
                		Ext.Msg.alert("Error", response.responseText);
                	}
        		});

                var inviteFacebookFriendsActionSheet = Ext.getCmp("inviteFacebookFriendsActionSheet");
                inviteFacebookFriendsActionSheet.hide();
                inviteFacebookFriendsActionSheet.destroy();
            },
            scope: this
        };
        var inviteFacebookFriend = {
            text: " Invite on facebook",
            cls: "actionSheetNormalButton",
            handler: function(button, event) {
                this.inviteFriend(facebookId);

                var inviteFacebookFriendsActionSheet = Ext.getCmp("inviteFacebookFriendsActionSheet");
                inviteFacebookFriendsActionSheet.hide();
                inviteFacebookFriendsActionSheet.destroy();
            },
            scope: this
        };
        var removeFriend = {
            text: "Remove friend",
            cls: "actionSheetNormalButton",
            handler: function(button, event) {
                Ext.Ajax.request({
                    url: inkle.app.baseUrl + "/removeFriend/",
                    params: {
                        memberId: userId,
                    },
                    success: function(response) {
                        var personRecord = inviteFacebookFriendsStore.findRecord("memberId", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "none");

                        //Remove relationship badge
                        Ext.fly("inviteFacebookFriendsRelationshipTag"+ userId).setHtml("");
                    },
                    failure: function(response) {
                        Ext.Msg.alert("Error", response.error);
                    }
                });

                var inviteFacebookFriendsActionSheet = Ext.getCmp("inviteFacebookFriendsActionSheet");
                inviteFacebookFriendsActionSheet.hide();
                inviteFacebookFriendsActionSheet.destroy();
            },
            scope: this
        };
        var acceptRequest = {
            text: "Accept friend request",
            cls: "actionSheetNormalButton",
            handler: function(button, event) {
                Ext.Ajax.request({
                    url: inkle.app.baseUrl + "/respondToRequest/",
                    params: {
                        memberId: userId,
                        response: "accept"
                    },
                    success: function(response) {
                        var requestsButton = this.getRequestsButton();

                        numFriendRequests = response.responseText;
                        if (numFriendRequests != 0) {
                            requestsButton.setBadgeText(numFriendRequests);
                        }
                        else {
                            requestsButton.setBadgeText("");
                        }

                        this.updateFriendsList();
                        this.updateRequestsList();

                        var personRecord = inviteFacebookFriendsStore.findRecord("memberId", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "friend");

                        //Change relationship badge to "Friend"
                        Ext.fly("inviteFacebookFriendsRelationshipTag"+ userId).setHtml('<span class="relationship">Friend</span>');
                    },
                    failure: function(response) {
                        Ext.Msg.alert("Error", response.responseText);
                    },
                    scope: this
                });

                var inviteFacebookFriendsActionSheet = Ext.getCmp("inviteFacebookFriendsActionSheet");
                inviteFacebookFriendsActionSheet.hide();
                inviteFacebookFriendsActionSheet.destroy();
            },
            scope: this
        };
        var ignoreRequest = {
            text: "Ignore friend request",
            cls: "actionSheetNormalButton",
            handler: function(button, event) {
                Ext.Ajax.request({
                    url: inkle.app.baseUrl + "/respondToRequest/",
                    params: {
                        memberId: userId,
                        response: "ignore"
                    },
                    success: function(response) {
                        var requestsButton = this.getRequestsButton();
                        numFriendRequests = response.responseText;
                        if (numFriendRequests != 0) {
                            requestsButton.setBadgeText(numFriendRequests);
                        }
                        else {
                            requestsButton.setBadgeText("");
                        }
                        this.updateFriendsList();
                        this.updateRequestsList();

                        var personRecord = inviteFacebookFriendsStore.findRecord("memberId", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "none");

                        //Remove relationship badge
                        Ext.fly("inviteFacebookFriendsRelationshipTag"+ userId).setHtml("");
                    },
                    failure: function(response) {
                        Ext.Msg.alert("Error", response.responseText);
                    },
                    scope: this
                });

                var inviteFacebookFriendsActionSheet = Ext.getCmp("inviteFacebookFriendsActionSheet");
                inviteFacebookFriendsActionSheet.hide();
                inviteFacebookFriendsActionSheet.destroy();
            },
            scope: this
        };
        var revokeRequest = {
            text: "Revoke my friend request",
            cls: "actionSheetNormalButton",
            handler: function(button, event) {
                Ext.Ajax.request({
                    url: inkle.app.baseUrl + "/revokeRequest/",
                    params: {
                        userId: userId,
                    },
                    success: function(response) {
                        var personRecord = inviteFacebookFriendsStore.findRecord("memberId", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "none");

                        //alert(personRecord.get("html"));

                        //Remove relationship badge
                        Ext.fly("inviteFacebookFriendsRelationshipTag"+ userId).setHtml("");
                    },
                    failure: function(response) {
                        Ext.Msg.alert("Error", response.error);
                    }
                });

                var inviteFacebookFriendsActionSheet = Ext.getCmp("inviteFacebookFriendsActionSheet");
                inviteFacebookFriendsActionSheet.hide();
                inviteFacebookFriendsActionSheet.destroy();
            },
            scope: this
        };
        var cancel = {
            text: "Cancel",
            cls: "actionSheetCancelButton",
            handler: function(button, event) {
                var inviteFacebookFriendsActionSheet = Ext.getCmp("inviteFacebookFriendsActionSheet");
                inviteFacebookFriendsActionSheet.hide();
                inviteFacebookFriendsActionSheet.destroy();
            },
            scope: this
        };

        //Add the appropriate buttons to the action sheet item list
        var actionSheetItems = [];
        if (userId != "none") { //The person is an inkle user
            if (relationship == "friend") {
                actionSheetItems = [removeFriend, cancel];
            }
            else if (relationship == "pending") {
                actionSheetItems = [revokeRequest, cancel];
            }
            else if (relationship == "requested") {
                actionSheetItems = [acceptRequest, ignoreRequest, cancel];
            }
            else {
                actionSheetItems = [addFriend, cancel];
            }
        }
        else { //The person is not an inkle user (only on facebook)
            actionSheetItems = [inviteFacebookFriend, cancel];
        }

        // Create the action sheet
        var inviteFacebookFriendsActionSheet = Ext.create("Ext.ActionSheet", {
            id: "inviteFacebookFriendsActionSheet",
            items: actionSheetItems,
        });

        // Add the action sheet to the viewport
        Ext.Viewport.add(inviteFacebookFriendsActionSheet);
        inviteFacebookFriendsActionSheet.show();
    },

    inviteFriend: function(facebookId) {
	    FB.ui({
            method: 'feed',
            to: String(facebookId),
            message: 'This is the message ',
            link: "http://www.inkleit.com",
            //picture: //link to a picture of inkle logo
            name: "Join inkle!",
            caption: "www.inkleit.com",
            description: 'inkle makes it easy to plan dinners, hangouts, meetups, and other social events with your friends!',
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
                        url: inkle.app.baseUrl + "/linkFacebookAccount/",
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
                                Ext.Msg.alert("Error", error);
                                //NEED TO LOG OUT FACEBOOK ACCOUNT
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
            /*inviteFacebookFriendsListStore.setProxy({
                extraParams: {
                    fbAccessToken: fbAccessToken
                }
    		});
            inviteFacebookFriendsListStore.load();*/
            
            /*var inviteFacebookFriendsListStore = this.getInviteFacebookFriendsList().getStore();
            var letterGroups = new Array();
            letterGroups[0] = "abc";
            letterGroups[1] = "def";
            letterGroups[2] = "ghi";
            letterGroups[3] = "jkl";
            letterGroups[4] = "mno";
            letterGroups[5] = "pqr";
            letterGroups[6] = "stuv";
            letterGroups[7] = "wxyz";

            for (var i=0; i<letterGroups.length; i++)
            {
                Ext.Ajax.request({
            		url: inkle.app.baseUrl + "/inviteFacebookFriendsView/",
            		params: {
           				fbAccessToken: fbAccessToken,
           				startsWith: letterGroups[i]
            		},
            		success: function(response) {
            		    var facebookFriends = Ext.JSON.decode(response.responseText);
                        inviteFacebookFriendsListStore.add(facebookFriends);
            		},
                	failure: function(response) {
                		Ext.Msg.alert("Error", response.responseText);
                	}
        		});
        	}*/
        	
        	this.loadFacebookFriends(this, fbAccessToken, 50, 0);
            
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

    loadFacebookFriends: function(context, fbAccessToken, limit, offset) {
        var inviteFacebookFriendsListStore = this.getInviteFacebookFriendsList().getStore();
        Ext.Ajax.request({
    		url: inkle.app.baseUrl + "/inviteFacebookFriendsView/",
    		params: {
   				fbAccessToken: fbAccessToken,
   				limit: limit,
   				offset: offset,
    		},
    		success: function(response) {
    		    facebookFriends = Ext.JSON.decode(response.responseText);
                if (facebookFriends != "") {
                    inviteFacebookFriendsListStore.add(facebookFriends);
                    var newOffset = offset + limit;
                    context.loadFacebookFriends(context, fbAccessToken, limit, newOffset);
                }
                else {
                    inviteFacebookFriendsListStore.sort("lastName", "ASC"); //Once all the friends are loaded, ensure they are perfectly sorted
                }
    		},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
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

    loadChangePasswordView: function() {
        // Push the change password view
        this.getSettingsView().push({
       	    xtype: "changePasswordView"
        });

        //Update buttons
        this.getSettingsLogoutButton().hide();
        this.getChangePasswordBackButton().show();
        this.getChangePasswordSubmitButton().show();
    },

    changePasswordBack: function() {
        this.getSettingsView().pop();
        this.getChangePasswordBackButton().hide();
        this.getChangePasswordSubmitButton().hide();
        this.getSettingsLogoutButton().show();
    },

    loadChangeEmailView: function() {
        // Push the change email view
        this.getSettingsView().push({
       	    xtype: "changeEmailView"
        });
        //Update buttons
        this.getSettingsLogoutButton().hide();
        this.getChangeEmailBackButton().show();
        this.getChangeEmailSubmitButton().show();
    },

    changeEmailBack: function() {
        this.getSettingsView().pop();
        this.getChangeEmailBackButton().hide();
        this.getChangeEmailSubmitButton().hide();
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
                url: inkle.app.baseUrl + "/setShareSetting/",

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
                url: inkle.app.baseUrl + "/setShareSetting/",

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
                url: inkle.app.baseUrl + "/setShareSetting/",

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
            url: inkle.app.baseUrl + "/setShareSetting/",

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

    changePassword: function() {
        this.getChangePasswordView().submit({
			method: "POST",

            waitMsg: {
                xtype: "loadmask",
                message: "Processing",
                cls : "demos-loading"
            },

            success: function(form, response) {
            //this.activateMainTabView();
                Ext.Msg.alert("Success", "Your password was successfully changed!");
                //Clear form fields
                Ext.ComponentQuery.query('textfield[name="currentPassword"]').pop().setValue("");
                Ext.ComponentQuery.query('textfield[name="newPassword1"]').pop().setValue("");
                Ext.ComponentQuery.query('textfield[name="newPassword2"]').pop().setValue("");
            },

            failure: function(form, response) {
            Ext.Msg.alert("Error", response.error);
            },

            scope: this
        });
    },

    changeEmail: function() {
        this.getChangeEmailView().submit({
			method: "POST",

            waitMsg: {
                xtype: "loadmask",
                message: "Processing",
                cls : "demos-loading"
            },

            success: function(form, response) {
            //this.activateMainTabView();
                Ext.Msg.alert("Success", "Your email was successfully changed!");
                //Clear form fields
                Ext.ComponentQuery.query('textfield[name="changeEmailCurrentEmail"]').pop().setValue("");
                Ext.ComponentQuery.query('textfield[name="changeEmailPassword"]').pop().setValue("");
                Ext.ComponentQuery.query('textfield[name="changeEmailNewEmail1"]').pop().setValue("");
                Ext.ComponentQuery.query('textfield[name="changeEmailNewEmail2"]').pop().setValue("");
            },

            failure: function(form, response) {
                Ext.Msg.alert("Error", response.error);
            },

            scope: this
        });
    },

    /******************/
    /*  UPDATE LISTS  */
    /******************/
    /* Updates the friends list */
    updateFriendsList: function() {
        this.getFriendsList().getStore().load();
    },

    /* Updates the requests list */
    updateRequestsList: function() {
        this.getRequestsList().getStore().load();
    },
});
