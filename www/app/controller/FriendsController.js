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
            friendsViewFriendsList: "#friendsViewFriendsList",
            friendsViewGroupsList: "#friendsViewGroupsList",
            groupMembersList: "#groupMembersList",
            friendsViewRequestsList: "#friendsViewRequestsList",
            allInklingsGroupsList: "#allInklingsGroupsList",

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
                friendsViewAddFriendsButtonTapped: "transitionToAddFriendsView",
                friendsViewEditGroupsButtonTapped: "toggleEditGroupsList",
                friendsViewEditGroupsDoneButtonTapped: "toggleEditGroupsList",
                friendsViewCreateGroupButtonTapped: "createGroup",
                groupMembersViewBackButtonTapped: "transitionToFriendsView",

                // List disclosure/itemtap
                friendsViewGroupsListItemTapped: "transitionToGroupMembersView",
                friendsViewRequestsListItemTapped: "activateRequestsActionSheet",

                // Pull to refresh
                friendsViewFriendsListRefreshed: "updateFriendsList",
                friendsViewGroupsListRefreshed: "updateGroupsList",
                friendsViewRequestsListRefreshed: "updateRequestsList",

                // Miscellaneous
                deleteLockTapped: "toggleDeleteLock",
                groupNameInputBlurred: "renameGroup"
            },

            addFriendsView: {
                addFriendsViewDoneButtonTapped: "transitionToFriendsView",
                addFriendsSearchFieldKeyedUp: "updateAddFriendsSuggestions",
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
    /* Transitions to the friends view */
    transitionToFriendsView: function(source) {
        // If coming from the add friends view, slide that view away
        if (source == "addFriendsView") {
            this.getAddFriendsSearchField().setValue(""); //Clear search field
            this.getAddFriendsSuggestions().getStore().removeAll(); //Clear search results from store
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

    /* Transitions to the add friends view */
    transitionToAddFriendsView: function() {
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

    /* Transitions to the group members view */
    transitionToGroupMembersView: function(groupId) {
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

    /**************/
    /*  COMMANDS  */
    /**************/
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
                        this.respondToRequest(memberId, "accepted");

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
                        this.respondToRequest(memberId, "ignored");

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

    respondToRequest: function(memberId, friendRequestResponse) {
        console.log(friendRequestResponse);
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/respondToRequest/",
            params: {
                memberId: memberId,
                response: friendRequestResponse
            },
            success: function(response) {
                // Update the friend request button's badge
                var friendRequestsButton = this.getRequestsButton();
                var numFriendRequests = parseInt(friendRequestsButton) - 1;
                if (numFriendRequests != 0) {
                    friendRequestsButton.setBadgeText(numFriendRequests.toString());
                }
                else {
                    friendRequestsButton.setBadgeText("");
                }

                // Remove the tapped friend request from the friend requests list
                //this.getFriendsViewRequestsList().getStore().remove(record);

                // If the inkling invitation has been accepted, add it to the my inklings list
                if (friendRequestResponse == "accepted") {
                    var responseText = Ext.JSON.decode(response.responseText);
                    this.getFriendsViewRequestsList().getStore().add({
                        "inklingId": responseText["inklingId"],
                        "html": responseText["html"],
                        "groupingIndex": responseText["groupingIndex"]
                    });
                    this.getMyInklingsList().getStore().sort("groupingIndex");
                }




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
        var userId = data["memberId"];
        var facebookId = data["facebookId"];
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
            		    var personRecord = addFriendsStore.findRecord("memberId", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "pending");

                        //Change relationship badge to "Pending"
                        Ext.fly("addFriendsRelationshipTag"+ userId).setHtml('<span class="relationship">Pending</span>');
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
                        var personRecord = addFriendsStore.findRecord("memberId", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "none");

                        //Remove relationship badge
                        Ext.fly("addFriendsRelationshipTag"+ userId).setHtml("");
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
                this.respondToRequest(memberId, "accepted");

                var personRecord = addFriendsStore.findRecord("memberId", userId);

                //Change relationship field in store
                personRecord.set("relationship", "friend");

                //Change relationship badge to "Friend"
                Ext.fly("addFriendRelationshipTag"+ userId).setHtml('<span class="relationship">Friend</span>');

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
                this.respondToRequest(memberId, "ignored");

                var personRecord = addFriendsStore.findRecord("memberId", userId);

                //Change relationship field in store
                personRecord.set("relationship", "none");

                //Remove relationship badge
                Ext.fly("addFriendRelationshipTag"+ userId).setHtml("");

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
                        var personRecord = addFriendsStore.findRecord("memberId", userId);

                        //Change relationship field in store
                        personRecord.set("relationship", "none");

                        //alert(personRecord.get("html"));

                        //Remove relationship badge
                        Ext.fly("addFriendsRelationshipTag"+ userId).setHtml("");
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
                            // Remove the tapped record from the friend's tab groups list store
                            tappedRecord.stores[0].remove(tappedRecord);

                            // Remove the same group from the all inklings groups panel
                            if (url == inkle.app.baseUrl + "/deleteGroup/") {
                                var groupRecord = this.getAllInklingsGroupsList().getStore().findRecord("groupId", tappedId);
                                this.getAllInklingsGroupsList().getStore().remove(groupRecord);
                            }

                            // Destroy the delete lock
                            deleteLock.destroy();

                        },
                        failure: function(response) {
                            Ext.Msg.alert("Error", "Unable to delete item. Please try again later.");
                        },
                        scope: this
                    });
                },
                scope: this
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
                // Decode the JSON data
                var responseText = Ext.JSON.decode(response.responseText);

                // Add the new group to the friends tab groups list and re-sort it
                this.getFriendsViewGroupsList().getStore().add({
                    "groupId": responseText["groupId"],
                    "groupName": responseText["groupName"],
                    "html": responseText["htmlMainContent"]
                });
                this.getFriendsViewGroupsList().getStore().sort();

                // Make the groups list editable and set the focus to the new group's input
                this.toggleEditGroupsList("editable");

                // TODO: put the new group's name input into focus
                //Ext.fly("group" + repsonseText["groupName"] + "NameInput").dom.focus();

                // Add the new group to the all inkling tab groups list panel and re-sort it
                this.getAllInklingsGroupsList().getStore().add({
                    "groupId": responseText["groupId"],
                    "groupName": responseText["groupName"],
                    "html": responseText["htmlPanel"]
                });
                this.getAllInklingsGroupsList().getStore().sort();
            },

            failure: function(response) {
                Ext.Msg.alert("Error", "Group not created. Please try again later.");
            },

            scope: this
        });
    },

    /* Renames the inputted group and updates the groups associated records */
    renameGroup: function(groupNameInput) {
        // Get the group name
        var groupName = groupNameInput.parent().child(".groupName");
        var groupNameValue = groupName.getHtml();

        // Get the group name input
        var groupNameInputValue = groupNameInput.getValue();

        // If the value has changed, display it and update the database
        if (groupNameValue != groupNameInputValue) {
            // Get the current group's ID
            var groupId = groupNameInput.parent(".group").getAttribute("data-groupId");

            // Determine the selected state of the all inklings group list item
            var allInklingsGroupHtml = Ext.query("#allInklingsGroupsList [data-groupId='" + groupId + "']")[0];
            var selected = Ext.fly(allInklingsGroupHtml).down(".selectionButton").hasCls("selected");

            // Update the group's name in the database and in the record's list
            Ext.Ajax.request({
                url: inkle.app.baseUrl + "/renameGroup/",

                params: {
                    groupId: groupId,
                    name: groupNameInputValue,
                    selected: selected
                },

                success: function(response) {
                    // Decode the JSON data
                    var responseText = Ext.JSON.decode(response.responseText);

                    // Update the group name dislpayed on the group list item
                    groupName.setHtml(groupNameInputValue);

                    // Update this record's groupName attribute so sorting works properly
                    var groupRecord = this.getFriendsViewGroupsList().getStore().findRecord("groupId", groupId);
                    groupRecord.setData({
                        "groupId": groupId,
                        "groupName": groupNameInputValue,
                        "html": responseText["htmlMainContent"]
                    });

                    // Rename the group in the all inkling tab groups list panel and re-sort the store
                    groupRecord = this.getAllInklingsGroupsList().getStore().findRecord("groupId", groupId);
                    groupRecord.setData({
                        "groupId": groupId,
                        "groupName": groupNameInputValue,
                        "html": responseText["htmlPanel"]
                    });
                    this.getAllInklingsGroupsList().getStore().sort();
                },

                failure: function(response) {
                    Ext.Msg.alert("Errors", response.errors);
                },

                scope: this
            });
        }
    },

    updateAddFriendsSuggestions: function() {
        var addFriendsStore = this.getAddFriendsSuggestions().getStore();
        var addFriendsList = this.getAddFriendsSuggestions();
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
                    addFriendsStore.add(friendSuggestions);
                }
                Ext.Viewport.setMasked(false);
    		},
        	failure: function(response) {
        	    Ext.Viewport.setMasked(false);
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
        this.getFriendsViewFriendsList().getStore().load();
    },

    /* Updates the groups list */
    updateGroupsList: function(groupId) {
        this.getFriendsViewGroupsList().getStore().load();
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
        this.getFriendsViewRequestsList().getStore().load();
    },
});
