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
           		deleteLockTapped: "toggleGroupsListDeleteLockRotation",
           		deleteButtonTapped: "deleteListItem",
           		groupNameInputBlurred: "renameGroup",
           		
           		acceptRequestButtonTapped: "respondToRequest",
           		ignoreRequestButtonTapped: "respondToRequest",
           		
           		friendsViewGroupsListItemTapped: "activateGroupMembersView",
           		
           		activate: "hideFriendsTabBadge",
           		deactivate: "showFriendsTabBadge",
           	},
           	
           	addFriendsView: {
           		addFriendsDoneButtonTapped: "activateFriendsView",
           		addFriendsSearchFieldKeyedUp: "updateAddFriendsSuggestions",
           		addFriendButtonTapped: "addFriend"
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
        
        this.getGroupsList().getStore().load();
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
		removeFriendsButton.setIconMask(true);
		removeFriendsButton.setIconCls("removeFriend");
		removeFriendsButton.setText("");
    },
	
	/* Activates the group members view from the friends view groups list */
	activateGroupMembersView: function(groupId) {
		if (this.getEditGroupsButton().getText() == "Edit") {
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
			this.getEditGroupsButton().setText("Edit");
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
			this.getRemoveFriendsButton().show();
			this.getAddFriendButton().show();
			this.getEditGroupsButton().hide();
			this.getCreateGroupButton().hide();
			
			// Reset the remove friends button
			var removeFriendsButton = this.getRemoveFriendsButton();
			removeFriendsButton.setIconMask(true);
			removeFriendsButton.setIconCls("removeFriend");
			removeFriendsButton.setText("");
		}
		else if (index == 1) {
			this.getRemoveFriendsButton().hide();
			this.getAddFriendButton().hide();
			this.getEditGroupsButton().show();
			this.getCreateGroupButton().show();
			
			this.getEditGroupsButton().setText("Edit");
		}
		else {
			this.getRemoveFriendsButton().hide();
			this.getAddFriendButton().hide();
			this.getEditGroupsButton().hide();
			this.getCreateGroupButton().hide();
		}
		
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
		
		// Hide the disclosure arrows
		var disclosureArrows = Ext.query(".disclosureArrow");
		for (var i = 0; i < disclosureArrows.length; i++) {
			var disclosureArrow = Ext.fly(disclosureArrows[i].getAttribute("id"));
			
			if (disclosureArrow) {
				disclosureArrow.removeCls("disclosureArrowSlideRight");
				disclosureArrow.removeCls("disclosureArrowSlideLeft");
				disclosureArrow.removeCls("disclosureArrowHidden");
			}
		}
	},
	
	/* Toggles the visibility of the delete locks */
	toggleDeleteLocksVisibility: function(listId, buttonText) {
		var deleteLocks = Ext.query("#" + listId + " .deleteLock");
		for (var i = 0; i < deleteLocks.length; i++) {
			var deleteLock = Ext.fly(deleteLocks[i].getAttribute("id"));
			if (deleteLock.hasCls("deleteLockHidden")) {
				deleteLock.removeCls("deleteLockHidden");
				deleteLock.removeCls("deleteLockSlideLeft");
				deleteLock.addCls("deleteLockSlideRight");
			}
			else {
				deleteLock.removeCls("deleteLockSlideRight");
				deleteLock.addCls("deleteLockHidden");
				deleteLock.addCls("deleteLockSlideLeft");
			}
			deleteLock.removeCls("deleteLockRotateLeft");
			deleteLock.removeCls("deleteLockRotateRight");
		}
		
		var button;
		if (buttonText == "removeFriend") {
			button = this.getRemoveFriendsButton();
		}
		else {
			button = this.getEditGroupsButton();
		}
		
		if ((button.getText() == buttonText) || (button.getIconMask())) {
			if (buttonText == "removeFriend") {
				button.setIconMask(false);
				button.setIconCls("");
				this.getAddFriendButton().hide();
			}
			else {
				this.getCreateGroupButton().hide();
			}
			
			button.setText("Done");			
			
			var disclosureArrows = Ext.query("#" + listId + " .disclosureArrow");
			for (var i = 0; i < disclosureArrows.length; i++) {
				var disclosureArrow = Ext.fly(disclosureArrows[i].getAttribute("id"));
				
				disclosureArrow.removeCls("disclosureArrowSlideLeft");
				disclosureArrow.addCls("disclosureArrowSlideRight");
				disclosureArrow.addCls("disclosureArrowHidden");
			}
			
			var groupNameInputs = Ext.query("#" + listId + " .groupNameInput");
			for (var i = 0; i < groupNameInputs.length; i++) {
				var groupNameInput = Ext.fly(groupNameInputs[i].getAttribute("id"));
				groupNameInput.removeCls("groupNameInputHidden");
			}
			
			var groupNames = Ext.query("#" + listId + " .groupName");
			for (var i = 0; i < groupNames.length; i++) {
				var groupName = Ext.fly(groupNames[i].getAttribute("id"));
				if (groupName.getAttribute("groupId") != -1) {
                    groupName.addCls("groupNameHidden");
                }
			}
		}
		else {
			if (buttonText == "removeFriend") {
				button.setIconMask(true);
				button.setIconCls("removeFriend");
				button.setText("");
				this.getAddFriendButton().show();
			}
			else {			
				button.setText(buttonText);
				this.getCreateGroupButton().show();
			}
			
			var deleteButtons = Ext.query("#" + listId + " .deleteButton");
			for (var i = 0; i < deleteButtons.length; i++) {
				var deleteButton = Ext.fly(deleteButtons[i].getAttribute("id"));
				
				if (!deleteButton.hasCls("deleteButtonHidden")) {
					deleteButton.removeCls("deleteButtonSlideLeft");
					deleteButton.addCls("deleteButtonSlideRight");
					deleteButton.addCls("deleteButtonHidden");
				}
			}
			
			var disclosureArrows = Ext.query("#" + listId + " .disclosureArrow");
			for (var i = 0; i < disclosureArrows.length; i++) {
				var disclosureArrow = Ext.fly(disclosureArrows[i].getAttribute("id"));
				
				disclosureArrow.removeCls("disclosureArrowSlideRight");
				disclosureArrow.removeCls("disclosureArrowHidden");
				disclosureArrow.addCls("disclosureArrowSlideLeft");
			}
			
			var groupNameInputs = Ext.query("#" + listId + " .groupNameInput");
			for (var i = 0; i < groupNameInputs.length; i++) {
				var groupNameInput = Ext.fly(groupNameInputs[i].getAttribute("id"));
				groupNameInput.addCls("groupNameInputHidden");
			}
			
			var groupNames = Ext.query("#" + listId + " .groupName");
			for (var i = 0; i < groupNames.length; i++) {
				var groupName = Ext.fly(groupNames[i].getAttribute("id"));
				groupName.removeCls("groupNameHidden");
			}
		}
	},
	
	/* Toggles the rotation of the inputted groups list delete lock */
	toggleGroupsListDeleteLockRotation: function(tappedId) {
		var deleteLock = Ext.fly(tappedId + "DeleteLock");
		if (deleteLock.hasCls("deleteLockRotateLeft")) {
			deleteLock.removeCls("deleteLockRotateLeft");
			deleteLock.addCls("deleteLockRotateRight");
			
			var deleteButton = Ext.fly(tappedId + "DeleteButton");
			deleteButton.removeCls("deleteButtonSlideLeft");
			deleteButton.addCls("deleteButtonHidden");
			deleteButton.addCls("deleteButtonSlideRight");
		}
		else {
			deleteLock.removeCls("deleteLockRotateRight");
			deleteLock.addCls("deleteLockRotateLeft");
			
			var deleteButton = Ext.fly(tappedId + "DeleteButton");
			deleteButton.removeCls("deleteButtonSlideRight");
			deleteButton.removeCls("deleteButtonHidden");
			deleteButton.addCls("deleteButtonSlideLeft");
        }
	},
	
	deleteListItem: function(tappedId, idType) {
		if (idType == "group") {
			var groupsList = this.getGroupsList();
			var groupsStore = groupsList.getStore();
			var record = groupsStore.findRecord("id", tappedId);
			groupsStore.remove(record);
						
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/deleteGroup/",
				params: {
					groupId: tappedId
				},
				failure: function(response) {
					Ext.Msg.alert("Error", response.responseText);
				}
			});
		}
		else if (idType == "member") {
			var friendsList = this.getFriendsList();
			var friendsStore = friendsList.getStore();
			var record = friendsStore.findRecord("id", tappedId);
			friendsStore.remove(record);
			
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/removeFriend/",
				params: {
					memberId: tappedId
				},
				failure: function(response) {
					Ext.Msg.alert("Error", response.responseText);
				}
			});
		}
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
		
		addFriendsStore.setProxy({
			extraParams: {
				query: this.getAddFriendsSearchField().getValue()
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
		var mainTabView = this.getMainTabView();
		var requestsButton = this.getRequestsButton();
		var friendsList = this.getFriendsList();
		var requestsList = this.getRequestsList();
		
		Ext.Ajax.request({
			url: "http://127.0.0.1:8000/sencha/respondToRequest/",
    		params: {
    			memberId: memberId,
    			response: response
    		},
    		success: function(response) {
    			numFriendRequests = response.responseText;
				if (numFriendRequests != 0) {
					mainTabView.getTabBar().getAt(2).setBadgeText(numFriendRequests);
					requestsButton.setBadgeText(numFriendRequests);
				}
				else {
					mainTabView.getTabBar().getAt(2).setBadgeText("");
					requestsButton.setBadgeText("");
				}
				
				friendsList.getStore().load();
				requestsList.getStore().load();
    		},
        	failure: function(response) {
        		console.log(response.responseText);
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
	},
	
	
	/**************************/
	/*  BASE CLASS FUNCTIONS  */
	/**************************/
    launch: function () {
        this.callParent(arguments);
        
        // If the main tab view is created, update the inkling invites button
        if (this.getMainTabView()) {
			// Update the badge text if there are any friend requests
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
    }
});