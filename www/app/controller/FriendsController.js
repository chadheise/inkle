Ext.define("inkle.controller.FriendsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            // Views
            mainTabView: "mainTabView",
            friendsView: "friendsView",
            addFriendsView: "addFriendsView",
            groupMembersView: "groupMembersView",
            
            // Top toolbar segmented buttons
            friendsViewSegmentedButton: "#friendsViewSegmentedButton",
            requestsButton: "#friendsViewRequestsButton",

            // Top toolbar buttons
            removeFriendsButton: "#friendsViewRemoveFriendsButton",
            removeFriendsDoneButton: "#friendsViewRemoveFriendsDoneButton",
            addFriendsButton: "#friendsViewAddFriendsButton",
            editGroupsButton: "#friendsViewEditGroupsButton",
            editGroupsDoneButton: "#friendsViewEditGroupsDoneButton",
            createGroupButton: "#friendsViewCreateGroupButton",
            addFriendsViewDoneButton: "#addFriendsViewDoneButton",
            groupMembersViewDoneButton: "#groupMembersViewDoneButton",
            
            // Lists
            friendsList: "#friendsViewFriendsList",
            groupsList: "#friendsViewGroupsList",
            groupMembersList: "#groupMembersList",
            requestsList: "#friendsViewRequestsList",
            
            // Elements
            addFriendsSearchField: "#addFriendsSearchField",
            addFriendsSuggestions: "#addFriendsSuggestions",
            friendsViewMainContent: "#friendsViewMainContent"
        },
        control: {
            friendsView: {
                // Segmented button toggling
                friendsViewSegmentedButtonToggled: "updateFriendsViewActiveItem",

                // Toolbar buttons
                friendsViewRemoveFriendsButtonTapped: "toggleEditFriendsList",
                friendsViewRemoveFriendsDoneButtonTapped: "toggleEditFriendsList",
                friendsViewAddFriendsButtonTapped: "activateAddFriendsView",
                friendsViewEditGroupsButtonTapped: "toggleEditGroupsList",
                friendsViewEditGroupsDoneButtonTapped: "toggleEditGroupsList",
                friendsViewCreateGroupButtonTapped: "createGroup",
                groupMembersViewDoneButtonTapped: "activateFriendsView",

                // Requests accept/ignore buttons
                acceptRequestButtonTapped: "respondToRequest",
                ignoreRequestButtonTapped: "respondToRequest",

                // Pull to refresh
                friendsViewFriendsListRefreshed: "updateFriendsList",
                friendsViewGroupsListRefreshed: "updateGroupsList",
                friendsViewRequestsListRefreshed: "updateRequestsList",

                // View activation
                activate: "hideFriendsTabBadge",
                deactivate: "showFriendsTabBadge",

                // Miscellaneous
                friendsViewGroupsListItemTapped: "activateGroupMembersView",
                deleteLockTapped: "toggleDeleteLock",
                groupNameInputBlurred: "renameGroup"
            },

            addFriendsView: {
                addFriendsViewDoneButtonTapped: "activateFriendsView",
                addFriendsSearchFieldKeyedUp: "updateAddFriendsSuggestions",
                addFriendButtonTapped: "addFriend",
                inviteFriendButtonTapped: "inviteFriend"
            },

            groupMembersView: {
                selectionItemTapped: "toggleSelectionItem"
            }
        }
    },

	/**********************/
	/*  VIEW TRANSITIONS  */
	/**********************/
	
	/* Activates the friends view */
	activateFriendsView: function(source) {
        // If coming from the add friends view, slide that view away
        if (source == "addFriendsView") {
            Ext.Viewport.animateActiveItem(this.getMainTabView(), {
                type: "slide",
                direction: "down"
            });
        }

        // If coming from the group members view, pop that view off
        else if (source == "groupMembersView") {
            this.getFriendsView().pop();

            this.getGroupMembersViewDoneButton().hide();
            this.getEditGroupsButton().show();
            this.getCreateGroupButton().show();

            // Update the groups list
            this.updateGroupsList();
        }
    },
	
	/* Activates the add friends view */
	activateAddFriendsView: function() {
        if (this.getAddFriendsView())
        {
            Ext.Viewport.animateActiveItem(this.getAddFriendsView(), {
                type: "slide",
                direction: "up"
            });
        }
        else
        {
            var addFriendsView = Ext.create("inkle.view.AddFriends");
            Ext.Viewport.animateActiveItem(addFriendsView, {
                type: "slide",
                direction: "up"
            });
        }
    },
	
	/* Activates the group members */
	activateGroupMembersView: function(groupId) {
		if (!this.getEditGroupsButton().isHidden()) {
			this.getFriendsView().push({
				xtype: "groupMembersView",
				data: {
					groupId: groupId
				}
			});

            // Display the appropriate toolbar buttons
            this.getEditGroupsButton().hide();
            this.getCreateGroupButton().hide();
            this.getGroupMembersViewDoneButton().show();

            // Update the group members list
            this.updateGroupMembersList(groupId);
		}
    },

	/**************/
	/*  COMMANDS  */
	/**************/
	
	/* Updates the active item for the friends view */
	updateFriendsViewActiveItem: function(index) {
        // Update the active friends view item
		this.getFriendsViewMainContent().setActiveItem(index);

		// Friends list
		if (index === 0) {
            // Display the appropriate buttons
			this.getEditGroupsButton().hide();
            this.getEditGroupsDoneButton().hide();
            this.getCreateGroupButton().hide();
            this.getRemoveFriendsButton().show();
            this.getAddFriendsButton().show();

            // Reset the friends list's delete locks and disclosure arrows
            this.updateDeleteLocksState("friendsViewFriendsList", "reset");
            this.updateDisclosureArrowsState("friendsViewFriendsList", "reset");
		}

        // Groups list
		else if (index === 1) {
            // Display the appropriate buttons
            this.getRemoveFriendsButton().hide();
            this.getRemoveFriendsDoneButton().hide();
            this.getAddFriendsButton().hide();
            this.getEditGroupsButton().show();
            this.getCreateGroupButton().show();

            // Reset the groups list's delete locks, disclosure arrows, and group names
            this.updateDeleteLocksState("friendsViewGroupsList", "reset");
            this.updateDisclosureArrowsState("friendsViewGroupsList", "reset");
            this.updateGroupNamesState("reset");
		}

        // Requests list
		else if (index === 2) {
            // Display the appropriate buttons
			this.getRemoveFriendsButton().hide();
            this.getRemoveFriendsDoneButton().hide();
            this.getAddFriendsButton().hide();
            this.getEditGroupsButton().hide();
            this.getEditGroupsDoneButton().hide();
            this.getCreateGroupButton().hide();
		}

        // Destroy the list delete button if it exists
        var deleteButton = Ext.fly(Ext.query(".listDeleteButton")[0]);
        if (deleteButton) {
            deleteButton.destroy();
        }
	},

    /* Updates the state of the inputted list's delete locks */
    updateDeleteLocksState: function(listId, newState) {
        var deleteLocks = Ext.query("#" + listId + " .deleteLock");
        for (var i = 0; i < deleteLocks.length; i++) {
            var deleteLock = Ext.fly(deleteLocks[i]);
            deleteLock.removeCls("deleteLockRotateLeft");
            deleteLock.removeCls("deleteLockRotateRight");
            if (newState == "editable") {
                deleteLock.removeCls("deleteLockSlideLeft");
                deleteLock.removeCls("deleteLockHidden");
                deleteLock.addCls("deleteLockSlideRight");
            }
            else if (newState == "uneditable") {
                deleteLock.removeCls("deleteLockSlideRight");
                deleteLock.removeCls("deleteLockRotateLeft");
                deleteLock.removeCls("deleteLockRotateRight");
                deleteLock.addCls("deleteLockSlideLeft");
                deleteLock.addCls("deleteLockHidden");
            }
            else if (newState == "reset") {
                deleteLock.removeCls("deleteLockSlideRight");
                deleteLock.removeCls("deleteLockSlideLeft");
                deleteLock.removeCls("deleteLockRotateLeft");
                deleteLock.removeCls("deleteLockRotateRight");
                deleteLock.addCls("deleteLockHidden");
            }
        }
    },

    /* Updates the state of the inputted list's disclosure arrows */
    updateDisclosureArrowsState: function(listId, newState) {
        var disclosureArrows = Ext.query("#" + listId + " .disclosureArrow");
        for (var i = 0; i < disclosureArrows.length; i++) {
            var disclosureArrow = Ext.fly(disclosureArrows[i]);
            
            if (newState == "editable") {
                disclosureArrow.removeCls("disclosureArrowSlideRight");
                disclosureArrow.removeCls("disclosureArrowHidden");
                disclosureArrow.addCls("disclosureArrowSlideLeft");
            }
            else if (newState == "uneditable") {
                disclosureArrow.removeCls("disclosureArrowSlideLeft");
                disclosureArrow.addCls("disclosureArrowSlideRight");
                disclosureArrow.addCls("disclosureArrowHidden");
            }
            else if (newState == "reset") {
                disclosureArrow.removeCls("disclosureArrowSlideLeft");
                disclosureArrow.removeCls("disclosureArrowSlideRight");
                disclosureArrow.removeCls("disclosureArrowHidden");
            }
        }
    },

    /* Updates the state of the groups list's group names */
    updateGroupNamesState: function(newState) {
        var groupNameInputs = Ext.query("#friendsViewGroupsList .groupNameInput");
        for (var i = 0; i < groupNameInputs.length; i++) {
            var groupNameInput = Ext.fly(groupNameInputs[i]);
            if (newState == "reset") {
                groupNameInput.addCls("groupNameInputHidden");
            }
            else {
                groupNameInput.toggleCls("groupNameInputHidden");
            }
        }
            
        var groupNames = Ext.query("#friendsViewGroupsList .groupName");
        for (i = 0; i < groupNames.length; i++) {
            var groupName = Ext.fly(groupNames[i]);
            if (groupName.parent(".group").getAttribute("data-groupId") != -1) {
                if (newState == "reset") {
                    groupName.removeClass("groupNameHidden");
                }
                else {
                    groupName.toggleCls("groupNameHidden");
                }
            }
        }
    },

    /* Toggles whether or not the friends list is editable */
    toggleEditFriendsList: function(newState) {
        // Show the appropriate toolbar buttons according to the new state
        if (newState == "editable") {
            this.getAddFriendsButton().hide();
            this.getRemoveFriendsButton().hide();
            this.getRemoveFriendsDoneButton().show();
        }
        else if (newState == "uneditable") {
            this.getRemoveFriendsDoneButton().hide();
            this.getAddFriendsButton().show();
            this.getRemoveFriendsButton().show();

            // Destroy the list delete button if it exists
            var deleteButton = Ext.fly(Ext.query(".listDeleteButton")[0]);
            if (deleteButton) {
                deleteButton.destroy();
            }
        }

        // Update the states of the friends list's delete locks and disclosure arrows
        this.updateDeleteLocksState("friendsViewFriendsList", newState);
        this.updateDisclosureArrowsState("friendsViewFriendsList", newState);
    },

    /* Toggles whether or not the groups list is editable */
    toggleEditGroupsList: function(newState) {
        // Show the appropriate toolbar buttons according to the new state
        if (newState == "editable") {
            this.getEditGroupsButton().hide();
            this.getCreateGroupButton().hide();
            this.getEditGroupsDoneButton().show();
        }
        else if (newState == "uneditable") {
            this.getEditGroupsDoneButton().hide();
            this.getEditGroupsButton().show();
            this.getCreateGroupButton().show();
        }

        // Update the states of the groups list's delete locks, disclosure arrows, and group names
        this.updateDeleteLocksState("friendsViewGroupsList", newState);
        if (newState == "editable") {
            this.updateDisclosureArrowsState("friendsViewGroupsList", "uneditable");
        }
        else if (newState == "uneditable") {
            this.updateDisclosureArrowsState("friendsViewGroupsList", "editable");
        }
        this.updateGroupNamesState();
    },

    /* Toggles the lock state of the inputted delete lock and the visibility of its corresponding a delete button */
    toggleDeleteLock: function(list, tappedListItem, tappedDeleteLock, tappedRecord) {
        // Update variables depending on the list type of the tapped delete lock
        var tappedId, url;
        if (tappedDeleteLock.parent(".group")) {
            tappedId = tappedDeleteLock.parent(".group").getAttribute("data-groupId");
            url = inkle.app.getBaseUrl() + "/deleteGroup/";
        }
        else {
            tappedId = tappedDeleteLock.parent(".member").getAttribute("data-memberId");
            url = inkle.app.getBaseUrl() + "/removeFriend/";
        }

        // "Lock" the tapped delete lock if it is already "unlocked"
        if (tappedDeleteLock.hasCls("deleteLockRotateLeft")) {
            tappedDeleteLock.removeCls("deleteLockRotateLeft");
            tappedDeleteLock.addCls("deleteLockRotateRight");
        }

        // Otherwise, "unlock" the tapped delete lock and create the corresponding delete button
        else {
            tappedDeleteLock.removeCls("deleteLockRotateRight");
            tappedDeleteLock.addCls("deleteLockRotateLeft");

            // Create the corresponding delete button
            var deleteButton = Ext.create("Ext.Button", {
                text: "Delete",
                cls: "listDeleteButton",
                handler: function() {
                    // Remove the corresponding item from the logged-in member's friends or groups list
                    Ext.Ajax.request({
                        url: url,
                        params: {
                            groupId: tappedId,
                            memberId: tappedId
                        },
                        success: function(response) {
                            // Remove the tapped record from the store
                            tappedRecord.stores[0].remove(tappedRecord);
                        },
                        failure: function(response) {
                            console.log(response.resonseText);
                            Ext.Msg.alert("Error", "Unable to delete item. Please try again later.");
                        },
                        scope: this
                    });
                }
            });

            // Add the delete button to the list item
            deleteButton.renderTo(Ext.DomQuery.selectNode(".deleteButtonPlaceholder", tappedListItem.dom));

            // Add a handler to remove the delete button when a touch event occurs in the corresponding list
            var removeDeleteButton = function() {
                deleteButton.destroy();
                tappedDeleteLock.removeCls("deleteLockRotateLeft");
                tappedDeleteLock.addCls("deleteLockRotateRight");
            };
            
            list.on({
                single: true,
                buffer: 250,
                itemtouchstart: removeDeleteButton
            });

            list.element.on({
                single: true,
                buffer: 250,
                touchstart: removeDeleteButton
            });

            this.getFriendsViewSegmentedButton().on({
                single: true,
                buffer: 250,
                touchstart: removeDeleteButton
            });
        }
	},

	/* Creates a new group, puts the groups list in edit mode, and sets the focus on the new group */
	createGroup: function() {
		Ext.Ajax.request({
            url: inkle.app.getBaseUrl() + "/createGroup/",
            success: function(response) {
                groupId = response.responseText;

				// Re-load the groups list, put it in edit mode, and set the focus on the new group's input field
				this.getGroupsList().getStore().load({
					callback: function(records, operation, success) {
						this.toggleEditGroupsList("editable");
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
				url: inkle.app.getBaseUrl() + "/renameGroup/",
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
    		url: inkle.app.getBaseUrl() + "/addFriend/",
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
	
    /* Toggles the tapped selection item's state and the membership of corresponding member in the current group */
	toggleSelectionItem: function(tappedSelectionItem) {
        // Get the member and gropu IDs associate with the tapped selection item 
		var memberId = tappedSelectionItem.parent(".member").getAttribute("data-memberId");
		var groupId = this.getGroupMembersView().getData()["groupId"];

        // Toggle the selection item and the memsber's membership in the group
		if (tappedSelectionItem.hasCls("selected")) {	
			Ext.Ajax.request({
				url: inkle.app.getBaseUrl() + "/removeFromGroup/",
				params: {
					memberId: memberId,
					groupId: groupId
				},
                success: function(response) {
                    tappedSelectionItem.set({
                        "src" : "resources/images/deselected.png"
                    });
                },
				failure: function(response) {
					console.log(response.responseText);
					Ext.Msg.alert("Error", "Unable to remove this member from your group. Please try again later.");
	        	},
                scope: this
			});
		}
		else {
			Ext.Ajax.request({
				url: inkle.app.getBaseUrl() + "/addToGroup/",
				params: {
					memberId: memberId,
					groupId: groupId
				},
                success: function(response) {
                    tappedSelectionItem.set({
                        "src" : "resources/images/selected.png"
                    });
                },
				failure: function(response) {
					console.log(response.responseText);
					Ext.Msg.alert("Error", "Unable to add this member to your group. Please try again later.");
	        	},
                scope: this
			});
		}

        // Toggle the tapped selection item's state
        tappedSelectionItem.toggleCls("selected");
	},
	
	respondToRequest: function(memberId, response) {
		Ext.Ajax.request({
			url: inkle.app.getBaseUrl() + "/respondToRequest/",
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
				this.updateRequestsList();
    		},
        	failure: function(response) {
        		console.log(response.responseText);
        		Ext.Msg.alert("Error", response.responseText);
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
	
    /* Updates the groups list */
	updateGroupsList: function(groupId) {
        this.getGroupsList().getStore().load();
	},

    /* Updates the group members list according to the inputted group ID */
    updateGroupMembersList: function(groupId) {
        var groupMembersStore = this.getGroupMembersList().getStore();
        groupMembersStore.setProxy({
            extraParams: {
                groupId: groupId
            }
        });
        groupMembersStore.load();
    },
	
    /* Updates the requests list */
	updateRequestsList: function() {
        this.getRequestsList().getStore().load();
	},

    /****************/
    /*  TAB BADGES  */
    /****************/
    /* Hides the "Friends" tab badge */
    hideFriendsTabBadge: function() {
        this.getMainTabView().getTabBar().getAt(2).setBadgeText("");
    },
    
    /* Shows the "Friends" tab badge */
    showFriendsTabBadge: function() {
        Ext.Ajax.request({
            url: inkle.app.getBaseUrl() + "/numFriendRequests/",
            
            success: function(response) {
                numFriendRequests = response.responseText;
                if (numFriendRequests !== 0) {
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
});
