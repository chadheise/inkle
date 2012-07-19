Ext.define("inkle.controller.FriendsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
            friendsView: "friendsView",
            addFriendsView: "addFriendsView",
            blotMembersView: "blotMembersView",
            
            // Toolbars
            friendsViewToolbar: "#friendsViewToolbar",
            addFriendsViewToolbar: "#addFriendsViewToolbar",
            
            // Toolbar buttons
            removeFriendsButton: "#friendsViewRemoveFriendsButton",
            addFriendButton: "#friendsViewAddFriendsButton",
            editBlotsButton: "#friendsViewEditBlotsButton",
            createBlotButton: "#friendsViewCreateBlotButton",
            
            // Lists
            friendsList: "#friendsViewFriendsList",
            blotsList: "#friendsViewBlotsList",
            blotMembersList: "#blotMembersList",
            
            // Elements
            addFriendsSearchField: "#addFriendsSearchField",
            addFriendsSuggestions: "#addFriendsSuggestions",
            friendsViewContainer: "#friendsViewContainer"
    	},
        control: {
            friendsView: {
            	// Commands
            	friendsViewFriendsButtonTapped: "updateFriendsViewActiveItem",
            	friendsViewBlotsButtonTapped: "updateFriendsViewActiveItem",
            	friendsViewSharingButtonTapped: "updateFriendsViewActiveItem",
           		
           		friendsViewEditBlotsButtonTapped: "toggleDeleteLocksVisibility",
           		friendsViewRemoveFriendsButtonTapped: "toggleDeleteLocksVisibility",
           		friendsViewAddFriendsButtonTapped: "activateAddFriendsView",
           		deleteLockTapped: "toggleBlotsListDeleteLockRotation",
           		deleteButtonTapped: "deleteListItem",
           		
           		friendsViewBlotsListItemTapped: "activateBlotMembersView"
           	},
           	
           	addFriendsView: {
           		addFriendsDoneButtonTapped: "activateFriendsView",
           		addFriendsSearchFieldKeyedUp: "updateAddFriendsSuggestions",
           		addFriendButtonTapped: "addFriend"
           	},
           	
           	blotMembersView: {
           		blotMembersDoneButtonTapped: "activateFriendsView",
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
        
        this.getBlotsList().getStore().load();
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
		
		// Reset the text for the remove friends button
		this.getRemoveFriendsButton().setText("-");
    },
	
	/* Activates the blot members view from the friends view blots list */
	activateBlotMembersView: function(blotId) {
		if (this.getEditBlotsButton().getText() == "Done") {
			// Push the blot members view onto the friends view
			this.getFriendsView().push({
				xtype: "blotMembersView",
				data: {
					blotId: blotId
				}
			});
	
			var blotMembersStore = this.getBlotMembersList().getStore();
			
			blotMembersStore.setProxy({
				extraParams: {
					blotId: blotId
				}
			});
			blotMembersStore.load();
	
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
			
			// Reset the text for the edit blots button
			this.getEditBlotsButton().setText("Edit");
		}
    },

	/**************/
	/*  COMMANDS  */
	/**************/
	
	/* Updates the HTML for the friends view */
	updateFriendsViewActiveItem: function(index) {
		// Update the active friends view item
		this.getFriendsViewContainer().setActiveItem(index);
		
		// Show and hide the appropriate buttons
		if (index == 0) {
			this.getRemoveFriendsButton().show();
			this.getAddFriendButton().show();
			this.getEditBlotsButton().hide();
			this.getCreateBlotButton().hide();
			
			this.getRemoveFriendsButton().setText("-");
		}
		else if (index == 1) {
			this.getRemoveFriendsButton().hide();
			this.getAddFriendButton().hide();
			this.getEditBlotsButton().show();
			this.getCreateBlotButton().show();
			
			this.getEditBlotsButton().setText("Edit");
		}
		else {
			this.getRemoveFriendsButton().hide();
			this.getAddFriendButton().hide();
			this.getEditBlotsButton().hide();
			this.getCreateBlotButton().hide();
		}
		
		var deleteLocks = Ext.query(".deleteLock");
		for (var i = 0; i < deleteLocks.length; i++) {
			var deleteLock = Ext.fly(deleteLocks[i].getAttribute("id"));
			deleteLock.removeCls("deleteLockSlideRight");
			deleteLock.removeCls("deleteLockSlideLeft");
			deleteLock.addCls("deleteLockHidden");
		}
		
		var deleteButtons = Ext.query(".deleteButton");
		for (var i = 0; i < deleteButtons.length; i++) {
			var deleteButton = Ext.fly(deleteButtons[i].getAttribute("id"));
			deleteButton.removeCls("deleteButtonSlideLeft");
			deleteButton.removeCls("deleteButtonSlideRight");
			deleteButton.addCls("deleteButtonHidden");
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
		if (buttonText == "-") {
			button = this.getRemoveFriendsButton();
		}
		else {
			button = this.getEditBlotsButton();
		}
		
		if (button.getText() == buttonText) {
			button.setText("Done");
		}
		else {
			button.setText(buttonText);
			
			var deleteButtons = Ext.query("#" + listId + " .deleteButton");
			for (var i = 0; i < deleteButtons.length; i++) {
				var deleteButton = Ext.fly(deleteButtons[i].getAttribute("id"));
				
				if (!deleteButton.hasCls("deleteButtonHidden")) {
					deleteButton.removeCls("deleteButtonSlideLeft");
					deleteButton.addCls("deleteButtonSlideRight");
					deleteButton.addCls("deleteButtonHidden");
				}
			}
		}
	},
	
	/* Toggles the rotation of the inputted blots list delete lock */
	toggleBlotsListDeleteLockRotation: function(tappedId) {
		var deleteLock = Ext.fly(tappedId + "DeleteLock");
		var deleteButton = Ext.fly(tappedId + "DeleteButton");
		if (deleteLock.hasCls("deleteLockRotateLeft")) {
			deleteLock.removeCls("deleteLockRotateLeft");
			deleteLock.addCls("deleteLockRotateRight");
			
			deleteButton.removeCls("deleteButtonSlideLeft");
			deleteButton.addCls("deleteButtonHidden");
			deleteButton.addCls("deleteButtonSlideRight");
		}
		else {
			deleteLock.removeCls("deleteLockRotateRight");
			deleteLock.addCls("deleteLockRotateLeft");
			
			deleteButton.removeCls("deleteButtonSlideRight");
			deleteButton.removeCls("deleteButtonHidden");
			deleteButton.addCls("deleteButtonSlideLeft");
        }
	},
	
	deleteListItem: function(tappedId, idType) {
		if (idType == "blot") {
			var blotsList = this.getBlotsList();
			var blotsStore = blotsList.getStore();
			var record = blotsStore.findRecord("id", tappedId);
			blotsStore.remove(record);
						
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/deleteBlot/",
				params: {
					blotId: tappedId
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
		console.log(addFriendButton);
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
				url: "http://127.0.0.1:8000/sencha/removeFromBlot/",
				params: {
					memberId: memberId,
					blotId: this.getBlotMembersView().getData()["blotId"]
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
				url: "http://127.0.0.1:8000/sencha/addToBlot/",
				params: {
					memberId: memberId,
					blotId: this.getBlotMembersView().getData()["blotId"]
				},
				failure: function(response) {
					console.log(response.responseText);
					Ext.Msg.alert("Error", response.responseText);
	        	}
			});
		}
	}
});