Ext.define("inkle.controller.FriendsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            // Views
            mainTabView: "mainTabView",
            friendsView: "friendsView",
            addFriendsView: "addFriendsView",
            groupMembersView: "groupMembersView",
            
            // Top toolbar
            friendsViewToolbar: "#friendsViewToolbar",

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
            groupMembersViewBackButton: "#groupMembersViewBackButton",
            
            // Lists
            friendsList: "#friendsViewFriendsList",
            groupsList: "#friendsViewGroupsList",
            groupMembersList: "#groupMembersList",
            requestsList: "#friendsViewRequestsList",
            
            // Elements
            addFriendsSearchField: "#addFriendsSearchField",
            addFriendsSuggestions: "#addFriendsList",
            friendsViewMainContent: "#friendsViewMainContent"
        },
        control: {
            friendsView: {
                // Segmented button toggling
                friendsViewSegmentedButtonToggled: "updateFriendsViewActiveItem",

                // Top toolbar buttons
                friendsViewRemoveFriendsButtonTapped: "toggleEditFriendsList",
                friendsViewRemoveFriendsDoneButtonTapped: "toggleEditFriendsList",
                friendsViewAddFriendsButtonTapped: "activateAddFriendsView",
                friendsViewEditGroupsButtonTapped: "toggleEditGroupsList",
                friendsViewEditGroupsDoneButtonTapped: "toggleEditGroupsList",
                friendsViewCreateGroupButtonTapped: "createGroup",
                groupMembersViewBackButtonTapped: "activateFriendsView",

                // List disclosure/itemtap
                friendsViewGroupsListItemTapped: "activateGroupMembersView",
                friendsViewRequestsListItemTapped: "activateRequestsActionSheet",

                // Pull to refresh
                friendsViewFriendsListRefreshed: "updateFriendsList",
                friendsViewGroupsListRefreshed: "updateGroupsList",
                friendsViewRequestsListRefreshed: "updateRequestsList",

                // View activation
                activate: "hideFriendsTabBadge",
                deactivate: "showFriendsTabBadge",

                // Miscellaneous
                deleteLockTapped: "toggleDeleteLock",
                groupNameInputBlurred: "renameGroup"
            },

            addFriendsView: {
                addFriendsViewDoneButtonTapped: "activateFriendsView",
                addFriendsSearchFieldKeyedUp: "updateAddFriendsSuggestions",
                addFriendButtonTapped: "addFriend",
                inviteFriendButtonTapped: "inviteFriend",
                addFriendsViewListItemTapped: "activateAddFriendsActionSheet",
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
            //this.getAddFriendsSearchField().setValue(""); //Clear search field
            ///this.getAddFriendsSuggestions()
            ///this.getAddFriendsSuggestions().getStore().removeAll();
            ///this.getAddFriendsSuggestions().getStore().load();
            Ext.Viewport.animateActiveItem(this.getMainTabView(), {
                type: "slide",
                direction: "down"
            });
        }

        // If coming from the group members view, pop that view off
        else if (source == "groupMembersView") {
            this.getFriendsView().pop();

            this.getGroupMembersViewBackButton().hide();
            this.getFriendsViewSegmentedButton().show();
            this.getEditGroupsButton().show();
            this.getCreateGroupButton().show();

            // Reset the toolbar's title
            this.getFriendsViewToolbar().setTitle("");

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
            this.getFriendsViewSegmentedButton().hide();
            this.getEditGroupsButton().hide();
            this.getCreateGroupButton().hide();
            this.getGroupMembersViewBackButton().show();

            // Update the toolbar's title
            this.getFriendsViewToolbar().setTitle("Members");

            // Update the group members list
            this.updateGroupMembersList(groupId);
        }
    },

    activateRequestsActionSheet: function(memberId) {
        // Create the action sheet
        var friendRequestsActionSheet = Ext.create("Ext.ActionSheet", {
            id: "friendRequestsActionSheet",
            cls: "actionSheet",
            items: [
                // Accept request
                {
                    text: "Accept",
                    cls: "actionSheetNormalButton",
                    handler: function(button, event) {
                        this.respondToRequest(memberId, "accept");

                        var friendRequestsActionSheet = Ext.getCmp("friendRequestsActionSheet");
                        friendRequestsActionSheet.hide();
                        friendRequestsActionSheet.destroy();
                    },
                    scope: this
                },

                // Ignore request
                {
                    text: "Ignore",
                    cls: "actionSheetNormalButton",
                    handler: function(button, event) {
                        this.respondToRequest(memberId, "ignore");

                        var friendRequestsActionSheet = Ext.getCmp("friendRequestsActionSheet");
                        friendRequestsActionSheet.hide();
                        friendRequestsActionSheet.destroy();
                    },
                    scope: this
                },

                // Cancel
                {
                    text: "Cancel",
                    cls: "actionSheetCancelButton",
                    handler: function(button, event) {
                        var friendRequestsActionSheet = Ext.getCmp("friendRequestsActionSheet");
                        friendRequestsActionSheet.hide();
                        friendRequestsActionSheet.destroy();
                    },
                    scope: this
                }
            ]
        });

        // Add the action sheet to the viewport
        Ext.Viewport.add(friendRequestsActionSheet);
        friendRequestsActionSheet.show();
    },

    respondToRequest: function(memberId, response) {
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/respondToRequest/",
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
                Ext.Msg.alert("Error", response.responseText);
            },
            scope: this
        });
    },

    activateAddFriendsActionSheet: function(data) {
        var userId = data["id"];
        var facebookId = data["facebook_id"];
        var relationship = data["relationship"];
        var addFriendsStore = this.getAddFriendsSuggestions().getStore();
        
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
            		    var personRecord = addFriendsStore.findRecord("id", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "pending");
                        
                        //Change relationship badge to "Pending"
                        Ext.fly("addFriendRelationshipTag"+ userId).setHtml('<span class="relationship">Pending</span>');
            		},
                	failure: function(response) {
                		Ext.Msg.alert("Error", response.responseText);
                	}
        		});
                
                var addFriendsActionSheet = Ext.getCmp("addFriendsActionSheet");
                addFriendsActionSheet.hide();
                addFriendsActionSheet.destroy();
            },
            scope: this
        };
        var inviteFacebookFriend = {
            text: " Invite on facebook",
            cls: "actionSheetNormalButton",
            handler: function(button, event) {
                this.inviteFriend(facebookId);
                
                var addFriendsActionSheet = Ext.getCmp("addFriendsActionSheet");
                addFriendsActionSheet.hide();
                addFriendsActionSheet.destroy();
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
                        var personRecord = addFriendsStore.findRecord("id", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "none");
                        
                        //Remove relationship badge
                        Ext.fly("addFriendRelationshipTag"+ userId).setHtml("");
                    },
                    failure: function(response) {
                        Ext.Msg.alert("Error", response.error);
                    }
                });
                
                var addFriendsActionSheet = Ext.getCmp("addFriendsActionSheet");
                addFriendsActionSheet.hide();
                addFriendsActionSheet.destroy();
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
                        
                        var personRecord = addFriendsStore.findRecord("id", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "friend");
                        
                        //Change relationship badge to "Friend"
                        Ext.fly("addFriendRelationshipTag"+ userId).setHtml('<span class="relationship">Friend</span>');
                    },
                    failure: function(response) {
                        Ext.Msg.alert("Error", response.responseText);
                    },
                    scope: this
                });
                
                var addFriendsActionSheet = Ext.getCmp("addFriendsActionSheet");
                addFriendsActionSheet.hide();
                addFriendsActionSheet.destroy();
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
                        
                        var personRecord = addFriendsStore.findRecord("id", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "none");
                        
                        //Remove relationship badge
                        Ext.fly("addFriendRelationshipTag"+ userId).setHtml("");
                    },
                    failure: function(response) {
                        Ext.Msg.alert("Error", response.responseText);
                    },
                    scope: this
                });
                
                var addFriendsActionSheet = Ext.getCmp("addFriendsActionSheet");
                addFriendsActionSheet.hide();
                addFriendsActionSheet.destroy();
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
                        var personRecord = addFriendsStore.findRecord("id", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "none");
                        
                        //alert(personRecord.get("html"));
                        
                        //Remove relationship badge
                        Ext.fly("addFriendRelationshipTag"+ userId).setHtml("");
                    },
                    failure: function(response) {
                        Ext.Msg.alert("Error", response.error);
                    }
                });
                
                var addFriendsActionSheet = Ext.getCmp("addFriendsActionSheet");
                addFriendsActionSheet.hide();
                addFriendsActionSheet.destroy();
            },
            scope: this
        };
        var cancel = {
            text: "Cancel",
            cls: "actionSheetCancelButton",
            handler: function(button, event) {
                var addFriendsActionSheet = Ext.getCmp("addFriendsActionSheet");
                addFriendsActionSheet.hide();
                addFriendsActionSheet.destroy();
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
        var addFriendsActionSheet = Ext.create("Ext.ActionSheet", {
            id: "addFriendsActionSheet",
            items: actionSheetItems,
        });

        // Add the action sheet to the viewport
        Ext.Viewport.add(addFriendsActionSheet);
        addFriendsActionSheet.show();
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

            // Reset the friends list's delete locks
            this.toggleDeleteLocksVisibility("friendsViewFriendsList", "uneditable");
        }

        // Groups list
        else if (index === 1) {
            // Display the appropriate buttons
            this.getRemoveFriendsButton().hide();
            this.getRemoveFriendsDoneButton().hide();
            this.getAddFriendsButton().hide();
            this.getEditGroupsButton().show();
            this.getCreateGroupButton().show();

            // Reset the groups list's delete locks and group names
            this.toggleDeleteLocksVisibility("friendsViewGroupsList", "uneditable");
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

    /* Updates the visibility of the inputted list's delete locks */
    toggleDeleteLocksVisibility: function(listId, newState) {
        // Get the list item's class
        var listItemClass;
        if (listId == "friendsViewFriendsList") {
            listItemClass = "member";
        }
        else if (listId == "friendsViewGroupsList") {
            listItemClass = "group";
        }

        var deleteLocks = Ext.query("#" + listId + " .deleteLock");
        for (var i = 0; i < deleteLocks.length; i++) {
            var deleteLock = Ext.fly(deleteLocks[i]);

            // Lock the delete lock
            deleteLock.removeCls("unlockDeleteLock");

            // Toggle the visibility of the delete lock
            if (newState == "editable") {
                deleteLock.parent("." + listItemClass).addCls("showDeleteLock");
            }
            else if (newState == "uneditable") {
                deleteLock.parent("." + listItemClass).removeCls("showDeleteLock");
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
        if (newState == "editable") {
            // Show the appropriate toolbar buttons
            this.getFriendsViewSegmentedButton().hide();
            this.getAddFriendsButton().hide();
            this.getRemoveFriendsButton().hide();
            this.getRemoveFriendsDoneButton().show();

            // Update the toolbar's title
            this.getFriendsViewToolbar().setTitle("Remove Friends");
        }
        else if (newState == "uneditable") {
            // Show the appropriate toolbar buttons
            this.getRemoveFriendsDoneButton().hide();
            this.getAddFriendsButton().show();
            this.getFriendsViewSegmentedButton().show();
            this.getRemoveFriendsButton().show();

            // Update the toolbar's title
            this.getFriendsViewToolbar().setTitle("");

            // Destroy the list delete button if it exists
            var deleteButton = Ext.fly(Ext.query(".listDeleteButton")[0]);
            if (deleteButton) {
                deleteButton.destroy();
            }
        }

        // Update the visibility of the friends list's delete locks
        this.toggleDeleteLocksVisibility("friendsViewFriendsList", newState);
    },

    /* Toggles whether or not the groups list is editable */
    toggleEditGroupsList: function(newState) {
        // Show the appropriate toolbar buttons according to the new state
        if (newState == "editable") {
            this.getFriendsViewSegmentedButton().hide();
            this.getEditGroupsButton().hide();
            this.getCreateGroupButton().hide();
            this.getEditGroupsDoneButton().show();

            // Update the toolbar's title
            this.getFriendsViewToolbar().setTitle("Edit Groups");
            
            // Hide the disclosure arrows
            var disclosureArrows = Ext.query("#friendsViewGroupsList .disclosureArrow");
            //for (i = 0; i < disclosureArrows.length; i++) {
                var disclosureArrow = Ext.fly(disclosureArrows[0]);
                disclosureArrow.hide();
            //}
        }
        else if (newState == "uneditable") {
            this.getEditGroupsDoneButton().hide();
            this.getFriendsViewSegmentedButton().show();
            this.getEditGroupsButton().show();
            this.getCreateGroupButton().show();

            // Update the toolbar's title
            this.getFriendsViewToolbar().setTitle("");
            
            // Destroy the list delete button if it exists
            var deleteButton = Ext.fly(Ext.query(".listDeleteButton")[0]);
            if (deleteButton) {
                deleteButton.destroy();
            }
            
            // Show the disclosure arrows
            var disclosureArrows = Ext.query("#friendsViewGroupsList .disclosureArrow");
            //for (i = 0; i < disclosureArrows.length; i++) {
                var disclosureArrow = Ext.fly(disclosureArrows[0]);
                disclosureArrow.show();
            //}
        }

        // Update the states of the groups list's delete locks, and group names
        this.toggleDeleteLocksVisibility("friendsViewGroupsList", newState);
        this.updateGroupNamesState();
    },

    /* Toggles the lock state of the inputted delete lock and the visibility of its corresponding a delete button */
    toggleDeleteLock: function(list, tappedListItem, tappedDeleteLock, tappedRecord) {
        // Update variables depending on the list type of the tapped delete lock
        var tappedId, url;
        if (tappedDeleteLock.parent(".group")) {
            tappedId = tappedDeleteLock.parent(".group").getAttribute("data-groupId");
            url = inkle.app.baseUrl + "/deleteGroup/";
        }
        else {
            tappedId = tappedDeleteLock.parent(".member").getAttribute("data-memberId");
            url = inkle.app.baseUrl + "/removeFriend/";
        }

        // Keep the tapped delete lock locked if it has the proper class
        if (tappedDeleteLock.hasCls("keepLocked")) {
            tappedDeleteLock.removeCls("keepLocked");
        }

        // "Lock" the tapped delete lock if it is unlocked
        else if (tappedDeleteLock.hasCls("unlockDeleteLock")) {
            tappedDeleteLock.removeCls("unlockDeleteLock");
        }

        // Otherwise, "unlock" the tapped delete lock and create the corresponding delete button
        else {
            tappedDeleteLock.addCls("unlockDeleteLock");

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

                            // Destroy the delete lock
                            deleteLock.destroy();

                        },
                        failure: function(response) {
                            Ext.Msg.alert("Error", "Unable to delete item. Please try again later.");
                        },
                        scope: this
                    });
                }
            });

            // Add the delete button to the list item
            deleteButton.renderTo(Ext.DomQuery.selectNode(".deleteButtonPlaceholder", tappedListItem.dom));

            // Add a handler to remove the delete button when a touch event occurs in the corresponding list
            var removeDeleteButton = function(list, index, target, record, event, options) {
                // If there is an unlocked delete lock and the delete button was not pressed, lock the delete lock and destroy the delete button
                var unlockDeleteLocks = Ext.query(".unlockDeleteLock");
                if ((unlockDeleteLocks.length != 0) && (!event.getTarget(".listDeleteButton"))) {
                    // Destroy the delete button
                    deleteButton.destroy();

                    // Reset the tapped delete lock's rotation
                    Ext.fly(unlockDeleteLocks[0]).removeCls("unlockDeleteLock");

                    // Keep the delete lock locked if the same record is being tapped but the delete lock itself was not tapped
                    if ((record == tappedRecord) && (event.getTarget(".deleteLock"))) {
                        tappedDeleteLock.addCls("keepLocked");
                    }
                }

                // Remove the event listener on the list
                list.un("itemtouchstart", removeDeleteButton, this);
            };

            // Remove the delete button whenever an item in the friends list is tapped
            list.on("itemtouchstart", removeDeleteButton, this);
        }
    },

    /* Creates a new group, puts the groups list in edit mode, and sets the focus on the new group */
    createGroup: function() {
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/createGroup/",
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

    renameGroup: function(groupNameInput) {
        // Get the group name
        var groupName = groupNameInput.parent().child(".groupName");
        var groupNameValue = groupName.getHtml();

        // Get the group name input
        var groupNameInputValue = groupNameInput.getValue();

        // If the value has changed, display it and update the database
        if (groupNameValue != groupNameInputValue) {
            // Update the group name dislpayed on the group list item
            groupName.setHtml(groupNameInputValue);

            // Update the database
            Ext.Ajax.request({
                url: inkle.app.baseUrl + "/renameGroup/",
                headers : { "cache-control": "no-cache" },
                params: {
                    groupId: groupNameInput.parent(".group").getAttribute("data-groupId"),
                    name: groupNameInputValue
                },
                failure: function(response) {
                    Ext.Msg.alert("Errors", response.errors);
                }
            });
        }
    },

    updateAddFriendsSuggestions: function() {
        var addFriendsStore = this.getAddFriendsSuggestions().getStore();
        var query = this.getAddFriendsSearchField().getValue().toLowerCase();
        var currentView = this; //Store reference to this to get currentQuery in ajax callback

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
        
        Ext.Viewport.setMasked({ xtype: 'loadmask', message: 'Loading...', indicator:true});
        Ext.Ajax.request({
    		url: inkle.app.baseUrl + "/peopleSearch/",
    		params: {
    			query: query,
   				fbAccessToken: fbAccessToken
    		},
    		success: function(response) {
    		    var friendSuggestions = Ext.JSON.decode(response.responseText);
    		    currentQuery = currentView.getAddFriendsSearchField().getValue().toLowerCase();
    
    		    if (query == currentQuery ) { //Only refresh the list data if the results are for the current query
                    addFriendsStore.removeAll();
                    //addFriendsStore.add(friendSuggestions); //This doesn't add all the list items for an unknown reason
                    for (var index in friendSuggestions) {
                        addFriendsStore.add(friendSuggestions[index]);
                    }
                }
                Ext.Viewport.setMasked(false);
    		},
        	failure: function(response) {
        	    Ext.Viewport.setMasked(false);
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
	},
	
	addFriend: function(memberId) {
		var addFriendButton = Ext.fly("member" + memberId + "AddFriendButton");
		
		addFriendButton.set({
			"value" : "Pending"
		});
		
		Ext.Ajax.request({
    		url: inkle.app.baseUrl + "/addFriend/",
    		params: {
    			memberId: memberId
    		},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
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

    /* Toggles the tapped selection item's state and the membership of corresponding member in the current group */
    toggleSelectionItem: function(tappedSelectionItem) {
        // Get the member and group IDs associated with the tapped selection item 
        var memberId = tappedSelectionItem.parent(".member").getAttribute("data-memberId");
        var groupId = this.getGroupMembersView().getData()["groupId"];

        // Toggle the selection item and the memsber's membership in the group
        if (tappedSelectionItem.hasCls("selected")) {	
            Ext.Ajax.request({
                url: inkle.app.baseUrl + "/removeFromGroup/",
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
                    Ext.Msg.alert("Error", "Unable to remove this member from your group. Please try again later.");
                },
                scope: this
            });
        }
        else {
            Ext.Ajax.request({
                url: inkle.app.baseUrl + "/addToGroup/",
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
                    Ext.Msg.alert("Error", "Unable to add this member to your group. Please try again later.");
                },
                scope: this
            });
        }

        // Toggle the tapped selection item's state
        tappedSelectionItem.toggleCls("selected");
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
    },
});
