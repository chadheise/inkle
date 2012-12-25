Ext.define("inkle.controller.FriendsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
        	mainTabView: "mainTabView",
            friendsView: "friendsView",
            addFriendsView: "addFriendsView",
            groupMembersView: "groupMembersView",
            
            // Toolbars
            friendsViewToolbar: "#friendsViewToolbar",
            addFriendsViewToolbar: "#addFriendsViewToolbar",
            
            // Toolbar buttons
            removeFriendsButton: "#friendsViewRemoveFriendsButton",
            addFriendButton: "#friendsViewAddFriendsButton",
            editGroupsButton: "#friendsViewEditGroupsButton",
            createGroupButton: "#friendsViewCreateGroupButton",
            
            // Lists
            friendsList: "#friendsViewFriendsList",
            groupsList: "#friendsViewGroupsList",
            groupMembersList: "#groupMembersList",
            requestsList: "#friendsViewRequestsList",
            
            // Segmented buttons
            requestsButton: "#friendsViewRequestsButton",
            
            // Elements
            addFriendsSearchField: "#addFriendsSearchField",
            addFriendsSuggestions: "#addFriendsSuggestions",
            friendsViewContainer: "#friendsViewContainer"
    	},
        control: {
            friendsView: {
            	// Commands
            	friendsViewSegmentedButtonToggled: "updateFriendsViewActiveItem",
            	
           		friendsViewEditGroupsButtonTapped: "toggleDeleteLocksVisibility",
           		friendsViewCreateGroupButtonTapped: "createGroup",
           		friendsViewRemoveFriendsButtonTapped: "toggleDeleteLocksVisibility",
           		friendsViewAddFriendsButtonTapped: "activateAddFriendsView",
           		deleteLockTapped: "toggleDeleteButtonVisibility",
           		friendDeleteButtonTapped: "deleteFriendListItem",
                groupDeleteButtonTapped: "deleteGroupListItem",
           		groupNameInputBlurred: "renameGroup",
           		
           		acceptRequestButtonTapped: "respondToRequest",
           		ignoreRequestButtonTapped: "respondToRequest",
           		
           		friendsViewGroupsListItemTapped: "activateGroupMembersView",
           		
           		friendsViewFriendsListRefreshed: "updateFriendsList",
           		friendsViewGroupsListRefreshed: "updateGroupsList",
           		friendsViewRequestsListRefreshed: "updateRequestsList",
           		
           		activate: "hideFriendsTabBadge",
           		deactivate: "showFriendsTabBadge"
           	},
           	
           	addFriendsView: {
           		addFriendsDoneButtonTapped: "activateFriendsView",
           		addFriendsSearchFieldKeyedUp: "updateAddFriendsSuggestions",
           		addFriendButtonTapped: "addFriend",
           		inviteFriendButtonTapped: "inviteFriend"
           	},
           	
           	groupMembersView: {
           		groupMembersBackButtonTapped: "activateFriendsView",
           		selectionItemTapped: "toggleSelectionItem"
           	}
        }
    },

	/**********************/
	/*  VIEW TRANSITIONS  */
	/**********************/
	
	/* Activates the friends view from the add friends view */
	activateFriendsView: function() {
    	// Pop the add friends view from the friends view
    	this.getFriendsView().pop();
		
		// Show the friends view toolbar
        this.getFriendsViewToolbar().show();
        
        this.updateGroupsList();
    },
	
	/* Activates the add friends view from the friends view friends list */
	activateAddFriendsView: function() {
    	// Push the add friends view onto the friends view
    	this.getFriendsView().push({
        	xtype: "addFriendsView"
        });

		// Hide the friends view toolbar        
        this.getFriendsViewToolbar().hide();
        
        // Hide the delete locks
        var deleteLocks = Ext.query(".deleteLock");
		for (var i = 0; i < deleteLocks.length; i++) {
			var deleteLock = Ext.fly(deleteLocks[i].getAttribute("id"));
			deleteLock.removeCls("deleteLockSlideRight");
			deleteLock.removeCls("deleteLockSlideLeft");
			deleteLock.addCls("deleteLockHidden");
		}
		
		// Hide the delete buttons
		var deleteButtons = Ext.query(".deleteButton");
		for (var i = 0; i < deleteButtons.length; i++) {
			var deleteButton = Ext.fly(deleteButtons[i].getAttribute("id"));
			deleteButton.removeCls("deleteButtonSlideLeft");
			deleteButton.removeCls("deleteButtonSlideRight");
			deleteButton.addCls("deleteButtonHidden");
		}
		
		// Reset the remove friends button
		var removeFriendsButton = this.getRemoveFriendsButton();
		removeFriendsButton.setText("");
		removeFriendsButton.setIconMask(true);
		removeFriendsButton.setIconCls("minusFriendIcon");
		
		//Get facebook friends here
    },
	
	/* Activates the group members view from the friends view groups list */
	activateGroupMembersView: function(groupId) {
		if (this.getEditGroupsButton().getIconCls() == "editIcon") {
			// Push the group members view onto the friends view
			this.getFriendsView().push({
				xtype: "groupMembersView",
				data: {
					groupId: groupId
				}
			});
	
			var groupMembersStore = this.getGroupMembersList().getStore();
			
			groupMembersStore.setProxy({
				extraParams: {
					groupId: groupId
				}
			});
			groupMembersStore.load();
	
			// Hide the friends view toolbar        
			this.getFriendsViewToolbar().hide();
			
			// Hide the delete locks
			var deleteLocks = Ext.query(".deleteLock");
			for (var i = 0; i < deleteLocks.length; i++) {
				var deleteLock = Ext.fly(deleteLocks[i].getAttribute("id"));
				deleteLock.removeCls("deleteLockSlideRight");
				deleteLock.removeCls("deleteLockSlideLeft");
				deleteLock.addCls("deleteLockHidden");
			}
			
			// Hide the delete buttons
			var deleteButtons = Ext.query(".deleteButton");
			for (var i = 0; i < deleteButtons.length; i++) {
				var deleteButton = Ext.fly(deleteButtons[i].getAttribute("id"));
				deleteButton.removeCls("deleteButtonSlideLeft");
				deleteButton.removeCls("deleteButtonSlideRight");
				deleteButton.addCls("deleteButtonHidden");
			}
			
			// Reset the text for the edit groups button
			this.getEditGroupsButton().setText("");
			this.getEditGroupsButton().setIconMask(true);
			this.getEditGroupsButton().setIconCls("editIcon");
		}
    },

	/**************/
	/*  COMMANDS  */
	/**************/
	
	hideFriendsTabBadge: function() {
	    this.getMainTabView().getTabBar().getAt(2).setBadgeText("");
	},
	
	showFriendsTabBadge: function() {
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
	},
	
	/* Updates the active item for the friends view */
	updateFriendsViewActiveItem: function(index) {
		// Update the active friends view item
		this.getFriendsViewContainer().setActiveItem(index);
		
		// Show and hide the appropriate buttons
		if (index == 0) {
            // Show the friends buttons
			this.getRemoveFriendsButton().show();
			this.getAddFriendButton().show();
			this.getEditGroupsButton().hide();
			this.getCreateGroupButton().hide();
			
			// Reset the remove friends button
			var removeFriendsButton = this.getRemoveFriendsButton();
			removeFriendsButton.setIconMask(true);
			removeFriendsButton.setIconCls("minusFriendIcon");
			removeFriendsButton.setText("");
		}
		else if (index == 1) {
            // Show the groups buttons
			this.getRemoveFriendsButton().hide();
			this.getAddFriendButton().hide();
			this.getEditGroupsButton().show();
			this.getCreateGroupButton().show();
			
			// Reset the edit groups button
			var editGroupsButton = this.getEditGroupsButton();
			editGroupsButton.setIconMask(true);
			editGroupsButton.setIconCls("editIcon");
			editGroupsButton.setText("");

            // Hide the group name inputs
            var groupNameInputs = Ext.query("#friendsViewGroupsList .groupNameInput");
            for (var i = 0; i < groupNameInputs.length; i++) {
                var groupNameInput = Ext.fly(groupNameInputs[i]);
                groupNameInput.addCls("groupNameInputHidden");
            }
            
            // Show the group names
            var groupNames = Ext.query("#friendsViewGroupsList .groupName");
            for (var i = 0; i < groupNames.length; i++) {
                var groupName = Ext.fly(groupNames[i]);
                if (groupName.parent(".group").getAttribute("data-groupId") != -1) {
                    groupName.removeCls("groupNameHidden");
                }
            }
		}
		else {
            // Show the requests buttons
			this.getRemoveFriendsButton().hide();
			this.getAddFriendButton().hide();
			this.getEditGroupsButton().hide();
			this.getCreateGroupButton().hide();
		}
		
		// Hide the delete locks
		var deleteLocks = Ext.query(".deleteLock");
		for (var i = 0; i < deleteLocks.length; i++) {
			var deleteLock = Ext.fly(deleteLocks[i]);
			deleteLock.removeCls("deleteLockSlideRight");
			deleteLock.removeCls("deleteLockSlideLeft");
			deleteLock.addCls("deleteLockHidden");
		}
		
		// Hide the delete buttons
		var deleteButtons = Ext.query(".deleteButton");
		for (var i = 0; i < deleteButtons.length; i++) {
			var deleteButton = Ext.fly(deleteButtons[i]);
			deleteButton.removeCls("deleteButtonSlideLeft");
			deleteButton.removeCls("deleteButtonSlideRight");
			deleteButton.addCls("deleteButtonHidden");
		}
		
		// Hide the disclosure arrows
		var disclosureArrows = Ext.query(".disclosureArrow");
		for (var i = 0; i < disclosureArrows.length; i++) {
			var disclosureArrow = Ext.fly(disclosureArrows[i]);
			
			if (disclosureArrow) {
				disclosureArrow.removeCls("disclosureArrowSlideRight");
				disclosureArrow.removeCls("disclosureArrowSlideLeft");
				disclosureArrow.removeCls("disclosureArrowHidden");
			}
		}
	},
	
	/* Toggles the visibility of the delete locks (for the friends and groups lists) */
	toggleDeleteLocksVisibility: function(listId, buttonIconCls) {
		// Get the clicked button
		var button;
		if (buttonIconCls == "minusFriendIcon") {
			button = this.getRemoveFriendsButton();
		}
		else {
			button = this.getEditGroupsButton();
		}
		
		// If the remove friends or edits groups button (aka not the "Done" button) was clicked 
		if (button.getIconMask()) {
			// Update the button into a "Done" button
			button.setIconMask(false);
			button.setIconCls("");
			button.setText("Done");
			
			// Hide the other toolbar button
			if (buttonIconCls == "minusFriendIcon") {
				this.getAddFriendButton().hide();
			}
			else {
				this.getCreateGroupButton().hide();
			}		
			
			// Hide the disclosure arrows by sliding them to the right
			var disclosureArrows = Ext.query("#" + listId + " .disclosureArrow");
			for (var i = 0; i < disclosureArrows.length; i++) {
				var disclosureArrow = Ext.fly(disclosureArrows[i]);
				
				disclosureArrow.removeCls("disclosureArrowSlideLeft");
				disclosureArrow.addCls("disclosureArrowSlideRight");
				disclosureArrow.addCls("disclosureArrowHidden");
			}
			
            // Show the group name inputs and hide the group names if this is the groups lists
            if (buttonIconCls != "minusFriendIcon") {
    			var groupNameInputs = Ext.query("#friendsViewGroupsList .groupNameInput");
    			for (var i = 0; i < groupNameInputs.length; i++) {
    				var groupNameInput = Ext.fly(groupNameInputs[i]);
    				groupNameInput.removeCls("groupNameInputHidden");
    			}
    			
    			var groupNames = Ext.query("#friendsViewGroupsList .groupName");
    			for (var i = 0; i < groupNames.length; i++) {
    				var groupName = Ext.fly(groupNames[i]);
    				if (groupName.parent(".group").getAttribute("data-groupId") != -1) {
                        groupName.addCls("groupNameHidden");
                    }
    			}
            }
		}
		
		// Otherwise, the "Done" button was clicked
		else {
		    // Update the button from a "Done" button to an icon button
			button.setText("");
			button.setIconMask(true);
		   	
		   	// Unhide the other toolbar button
			if (buttonIconCls == "minusFriendIcon") {
				button.setIconCls("minusFriendIcon");
				this.getAddFriendButton().show();
			}
			else {
			    button.setIconCls("editIcon");
				this.getCreateGroupButton().show();
			}
			
			var deleteButtons = Ext.query("#" + listId + " .deleteButton");
			for (var i = 0; i < deleteButtons.length; i++) {
				var deleteButton = Ext.fly(deleteButtons[i]);
				
				if (!deleteButton.hasCls("deleteButtonHidden")) {
					deleteButton.removeCls("deleteButtonSlideLeft");
					deleteButton.addCls("deleteButtonSlideRight");
					deleteButton.addCls("deleteButtonHidden");
				}
			}
			
			// Unhide the disclosure arrows by sliding them to the left
			var disclosureArrows = Ext.query("#" + listId + " .disclosureArrow");
			for (var i = 0; i < disclosureArrows.length; i++) {
				var disclosureArrow = Ext.fly(disclosureArrows[i]);
				
				disclosureArrow.removeCls("disclosureArrowSlideRight");
				disclosureArrow.removeCls("disclosureArrowHidden");
				disclosureArrow.addCls("disclosureArrowSlideLeft");
			}
			
            // Hide the group name inputs and show the group names if this is the groups lists
            if (buttonIconCls != "minusFriendIcon") {
    			// Hide the group name inputs
    			var groupNameInputs = Ext.query("#friendsViewGroupsList .groupNameInput");
    			for (var i = 0; i < groupNameInputs.length; i++) {
    				var groupNameInput = Ext.fly(groupNameInputs[i]);
    				groupNameInput.addCls("groupNameInputHidden");
    			}
    			
    			// Unhide the group names
    			var groupNames = Ext.query("#friendsViewGroupsList .groupName");
    			for (var i = 0; i < groupNames.length; i++) {
    				var groupName = Ext.fly(groupNames[i]);
    				groupName.removeCls("groupNameHidden");
    			}
            }
		}

		// Toggle the visibility of the delete locks
		var deleteLocks = Ext.query("#" + listId + " .deleteLock");
		for (var i = 0; i < deleteLocks.length; i++) {
			var deleteLock = Ext.fly(deleteLocks[i]);
			if (deleteLock.hasCls("deleteLockHidden")) {
				deleteLock.removeCls("deleteLockHidden");
				deleteLock.removeCls("deleteLockSlideLeft");
				deleteLock.addCls("deleteLockSlideRight");
			}
			else {
				deleteLock.removeCls("deleteLockSlideRight");
				deleteLock.addCls("deleteLockSlideLeft");
				deleteLock.addCls("deleteLockHidden");
			}
			deleteLock.removeCls("deleteLockRotateLeft");
			deleteLock.removeCls("deleteLockRotateRight");
		}
	},
	
	/* Toggles the visibility of a delete button and the rotation of the delete corresponding delete lock */
	toggleDeleteButtonVisibility: function(tappedDeleteLock) {
		// Get the delete button associated with the tapped delete lock
        try {
            var deleteButton = tappedDeleteLock.parent(".group").child(".deleteButton");
		}
        catch (error) {
            var deleteButton = tappedDeleteLock.parent(".member").child(".deleteButton");
        }

		// Animate the delete lock and button
		if (tappedDeleteLock.hasCls("deleteLockRotateLeft")) {
			tappedDeleteLock.removeCls("deleteLockRotateLeft");
			tappedDeleteLock.addCls("deleteLockRotateRight");
			
			deleteButton.removeCls("deleteButtonSlideLeft");
			deleteButton.addCls("deleteButtonHidden");
			deleteButton.addCls("deleteButtonSlideRight");
		}
		else {
			tappedDeleteLock.removeCls("deleteLockRotateRight");
			tappedDeleteLock.addCls("deleteLockRotateLeft");
			
			deleteButton.removeCls("deleteButtonSlideRight");
			deleteButton.removeCls("deleteButtonHidden");
			deleteButton.addCls("deleteButtonSlideLeft");
        }
	},
	
    /* Removes the friend associated with the tapped delete button from the logged-in member's friends list */
	deleteFriendListItem: function(tappedDeleteButton) {
		// Get the member ID associated with the tapped delete button
        var tappedId = tappedDeleteButton.parent(".member").getAttribute("data-memberId");
        
        // Remove the friend associated with the tapped delete button from the logged-in member's friends list
        Ext.Ajax.request({
			url: "http://127.0.0.1:8000/sencha/removeFriend/",
			params: {
				memberId: tappedId
			},
            success: function(response) {
                // Remove the coresponding record from the friends list
                var friendsStore = this.getFriendsList().getStore();
                var record = friendsStore.findRecord("id", tappedId);
                friendsStore.remove(record);
            },
			failure: function(response) {
                console.log(response.responseText);
				Ext.Msg.alert("Error", "Unable to remove friend at this moment. Please try again later.");
			}, 
            scope: this
		});
	},

    /* Removes the group associated with the tapped delete button from the logged-in member's groups list */
    deleteGroupListItem: function(tappedDeleteButton) {
        // Get the ID of the tapped group list item
        var tappedId = tappedDeleteButton.parent(".group").getAttribute("data-groupId");

        // Remove the group associated with the tapped delete button from the logged-in member's groups list
        Ext.Ajax.request({
            url: "http://127.0.0.1:8000/sencha/deleteGroup/",
            params: {
                groupId: tappedId
            },
            success: function(response) {
                // Remove the corresponding record from the friends list
                var groupsStore = this.getGroupsList().getStore();
                var record = groupsStore.findRecord("id", tappedId);
                groupsStore.remove(record);
            },
            failure: function(response) {
                console.log(response.resonseText);
                Ext.Msg.alert("Error", "Unable to delete group at this moment. Please try again later.");
            },
            scope: this
        });
    },
	
	/* Creates a new group, puts the groups list in edit mode, and sets the focus on the new group */
	createGroup: function() {
		Ext.Ajax.request({
    		url: "http://127.0.0.1:8000/sencha/createGroup/",
		    success: function(response) {
        		groupId = response.responseText;
        		
				// Re-load the groups list, put it in edit mode, and set the focus on the new group's input field
				this.getGroupsList().getStore().load({
					callback: function(records, operation, success) {
						this.toggleDeleteLocksVisibility("friendsViewGroupsList", "Edit");
						Ext.fly("group" + groupId + "NameInput").dom.focus();
					},
					scope: this
				});
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Error", "Group not created");
        		console.log(response.responseText);
        	},
        	scope: this
		});
	},
	
	renameGroup: function(groupId) {
		var groupName = Ext.fly("group" + groupId + "Name");
		groupName = groupName.getHtml();
		
		var groupNameInput = Ext.fly("group" + groupId + "NameInput");
		groupNameInputValue = groupNameInput.getValue();
		
		if (groupName != groupNameInputValue) {
			var groupName = Ext.fly("group" + groupId + "Name");
			groupName.setHtml(groupNameInputValue);
			
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/renameGroup/",
				params: {
					groupId: groupId,
					name: groupNameInputValue
				},
				failure: function(response) {
					Ext.Msg.alert("Errors", response.errors);
					console.log(response.responseText);
				}
			});
		}
	},
	
	updateAddFriendsSuggestions: function() {	
		var addFriendsStore = this.getAddFriendsSuggestions().getStore();
		var query = this.getAddFriendsSearchField().getValue().toLowerCase();	
		
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

 		addFriendsStore.setProxy({
   		    extraParams: {
   			    query: query,
   				fbAccessToken: fbAccessToken
   			}
   		});
		
		addFriendsStore.load();
	},
	
	addFriend: function(memberId) {
		var addFriendButton = Ext.fly("member" + memberId + "AddFriendButton");
		
		addFriendButton.set({
			"value" : "Pending"
		});
		
		Ext.Ajax.request({
    		url: "http://127.0.0.1:8000/sencha/addFriend/",
    		params: {
    			memberId: memberId
    		},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
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
	
	toggleSelectionItem: function(memberId) {
		var selectionItem = Ext.fly("member" + memberId + "SelectionItem");
		var selectionItemSrc = selectionItem.getAttribute("src");

		if (selectionItemSrc == "resources/images/selected.png") {
			selectionItem.set({
				"src" : "resources/images/deselected.png"
			});
			
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/removeFromGroup/",
				params: {
					memberId: memberId,
					groupId: this.getGroupMembersView().getData()["groupId"]
				},
				failure: function(response) {
					console.log(response.responseText);
					Ext.Msg.alert("Error", response.responseText);
	        	}
			});
		}
		else {
			selectionItem.set({
				"src" : "resources/images/selected.png"
			});
			
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/addToGroup/",
				params: {
					memberId: memberId,
					groupId: this.getGroupMembersView().getData()["groupId"]
				},
				failure: function(response) {
					console.log(response.responseText);
					Ext.Msg.alert("Error", response.responseText);
	        	}
			});
		}
	},
	
	respondToRequest: function(memberId, response) {
		Ext.Ajax.request({
			url: "http://127.0.0.1:8000/sencha/respondToRequest/",
    		params: {
    			memberId: memberId,
    			response: response
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
				this.updatedRequestsList();
    		},
        	failure: function(response) {
        		console.log(response.responseText);
        		Ext.Msg.alert("Error", response.responseText);
        	},
        	scope: this
		});
	},
	
	updateFriendsList: function() {
	    this.getFriendsList().getStore().load();
	},
	
	updateGroupsList: function() {
	    this.getGroupsList().getStore().load();
	},
	
	updateRequestsList: function() {
	    this.getRequestsList().getStore().load();
	}
});