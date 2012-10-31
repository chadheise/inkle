Ext.define("inkle.controller.MyInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
        	mainTabView: "mainTabView",
            myInklingsView: "myInklingsView",
            newInklingView: "newInklingView",
            newInklingInvitedGroupsPanel: "#newInklingInvitedGroupsPanel",
            inklingInvitationsPanel: "panel[id=inklingInvitationsPanel]",
            
            myInklingsViewToolbar: "#myInklingsViewToolbar",
            
        	newInklingInvitedFriendsList: "#newInklingInvitedFriendsList",

            inklingInvitationsList: "#inklingInvitationsList",

        	shareWithSelect: "#shareWithSelect",

        	newInklingInvitedGroupsPanel: "panel[id=newInklingInvitedGroupsPanel]",
        	newInklingInvitedGroupsList: "#newInklingInvitedGroupsList",        
        	
            // Toolbar buttons
            inklingInvitationsButton: "#inklingInvitationsButton",
            newInklingButton: "#newInklingButton",
            inviteResponseBackButton: "#inviteResponseBackButton",
            myInklingsInklingBackButton: "#myInklingsInklingBackButton",
            inklingFeedBackButton: "#inklingFeedBackButton",
            inklingFeedButton: "#inklingFeedButton",
            saveInklingButton: "#saveInklingButton",
            newInklingCancelButton: "#newInklingCancelButton",
            newInklingInvitedFriendsBackButton: "#newInklingInvitedFriendsBackButton",
            newInklingInvitedGroupsButton: "#newInklingInvitedGroupsButton",
            newInklingDoneButton: "#newInklingDoneButton",
            inklingInviteesDoneButton: "#inklingInviteesDoneButton",
            allFriendsInviteesDoneButton: "#allFriendsInviteesDoneButton"
        },
        control: {
            myInklingsView: {
            	inklingTapped: "activateInklingView",
            	inklingInvitationsButtonTapped: "toggleInklingInvitationsVisibility",
            	onInviteResponseBackButtonTapped: "activateMyInklingsView",
            	newInklingButtonTapped: "activateNewInklingView",
            	newInklingCancelButtonTapped: "activateMyInklingsView",
            	newInklingDoneButtonTapped: "createInkling",
            	inklingInviteesDoneButtonTapped: "activateNewInklingViewPop",
            	allFriendsInviteesDoneButtonTapped: "activateInklingInviteesViewPop",
            	newInklingInvitedFriendsBackButtonTapped: "activateNewInklingViewPop",
            	newInklingInvitedGroupsButtonTapped: "toggleNewInklingInvitedGroupsPanel",
            	activate: "hideMyInklingsTabBadge",
            	deactivate: "hideMyInklingsPanels",
            	activeitemchange: "hideMyInklingsPanels",
            },
            
            newInklingView: {
            	newInklingInviteesTapped: "activateInklingInviteesView",
            	isPrivateCheckboxChecked: "toggleShareWithSelect",
            	isPrivateCheckboxUnchecked: "toggleShareWithSelect",
            	forwardingSelectionItemTapped: "toggleForwardingSelectionItem",
            	selectedGroupsSelectionItemTapped: "selectSelectedGroupsSelectionItem",
            	noOneSelectionItemTapped: "selectNoOneSelectionItem",
            	selectedGroupsGroupSelectionItemTapped: "toggleSelectedGroupsGroupSelectionItem"
            },
            
            newInklingInvitedFriendsView: {
            	memberSelectionButtonTapped: "toggleSelectionButton"
            },
            
            inklingInvitationsPanel: {
                invitationButtonTapped: "respondToInklingInvitation"
            },
            
            newInklingInvitedGroupsPanel: {
            	groupSelectionButtonTapped: "toggleSelectionButton"
            }
        }
    },

	/* Transitions*/
	/* Activates the my inklings view from the new inkling view */
	activateMyInklingsView: function() {
    	// Pop the new inkling view from the my inklings view
    	this.getMyInklingsView().pop();
    	
    	// Show appropriate buttons
		this.getMyInklingsInklingBackButton().hide();
		this.getInklingFeedButton().hide();
		this.getNewInklingCancelButton().hide();
		this.getNewInklingDoneButton().hide();
		this.getInviteResponseBackButton().hide();
		this.getInklingInvitationsButton().show();
		this.getNewInklingButton().show();
    	
    	// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("My Inklings");
		
        //this.getGroupsList().getStore().load();
    },
	
	// Activates the inkling view
	activateInklingView: function(inklingId) {
		// Show appropriate buttons
		this.getNewInklingButton().hide();
		this.getInklingInvitationsButton().hide();
		this.getMyInklingsInklingBackButton().show();
		this.getInklingFeedButton().show();
		
		// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("Inkling");
		
    	this.getMyInklingsView().push({
        	xtype: "inklingView",
        	data: {
        		inklingId: inklingId
        	}
        });
    },
    
    // Activates the new inkling view
	activateNewInklingView: function() {
		// Show appropriate buttons
		this.getNewInklingButton().hide();
		this.getInklingInvitationsButton().hide();
		this.getNewInklingCancelButton().show();
		this.getNewInklingDoneButton().show();
		
		// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("New Inkling");
		    
        // Initialize a new inkling
        var inklingId;
        Ext.Ajax.request({
        	async: false,
			url: "http://127.0.0.1:8000/sencha/createInkling/",
			success: function(response) {
				inklingId = response.responseText;
			},
			failure: function(response) {
				console.log(response.responseText);
				Ext.Msg.alert("Error", response.responseText);
			}
		});
		
    	this.getMyInklingsView().push({
        	xtype: "newInklingView",
        	data: {
        		inklingId: inklingId
        	}
        });
    },
    
    // Activates the new inkling view
	activateNewInklingViewPop: function() {
		// Show appropriate buttons
		this.getNewInklingInvitedFriendsBackButton().hide();
		this.getNewInklingInvitedGroupsButton().hide()
		this.getNewInklingCancelButton().show();
		this.getNewInklingDoneButton().show();
		
		// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("New Inkling");
		
		// Update the number of invitees
        Ext.Ajax.request({
			url: "http://127.0.0.1:8000/sencha/numInvitedFriends/",
			params: {
				inklingId: this.getNewInklingView().getData()["inklingId"]
			},
			success: function(response) {
				numInvitedFriends = response.responseText;
				if (numInvitedFriends == 1) {
					Ext.fly("numInvitedFriends").setText("1 friend invited");	
				}
				else {
					Ext.fly("numInvitedFriends").setText(numInvitedFriends + " friends invited");
				}
			},
			failure: function(response) {
				console.log(response.responseText);
				Ext.Msg.alert("Error", response.responseText);
			},
			scope: this
		});
		
		this.getNewInklingInvitedGroupsPanel().destroy();
		
    	this.getMyInklingsView().pop();
    },
    
    // Activates the inkling invitees view
	activateInklingInviteesView: function() {
		// Show appropriate buttons
		this.getNewInklingCancelButton().hide();
		this.getNewInklingDoneButton().hide();
		this.getNewInklingInvitedFriendsBackButton().show();
		this.getNewInklingInvitedGroupsButton().show();
		
		// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("Invite Friends");
		
		this.getMyInklingsView().push({
        	xtype: "newInklingInvitedFriendsView",
        	data: {
        		inklingId: this.getNewInklingView().getData()["inklingId"]
        	}
        });
        
        var newInklingInvitedFriendsStore = this.getNewInklingInvitedFriendsList().getStore();
		
		newInklingInvitedFriendsStore.setProxy({
			extraParams: {
				inklingId: this.getNewInklingView().getData()["inklingId"]
			}
		});
		newInklingInvitedFriendsStore.load();
    },
    
    /************/
    // Commands //
    /************/
    /* Toggles the visibility of the inkling invitations panel */
    toggleInklingInvitationsVisibility: function() {
        // Toggle the visibility of the inkling invitations panel
	    var inklingInvitationsPanel = this.getInklingInvitationsPanel();
	    console.log(inklingInvitationsPanel);
	    if (inklingInvitationsPanel.getHidden()) {
	    	inklingInvitationsPanel.showBy(this.getInklingInvitationsButton());
    	}
    	else {
    		inklingInvitationsPanel.hide();
    	}
    },
    
    createInkling: function() {
    	var newInklingValues = this.getNewInklingView().getValues();
    	if ((newInklingValues["location"] == "") && (newInklingValues["date"] == null) && (newInklingValues["time"] == "") && (newInklingValues["category"] == "") && (newInklingValues["notes"] == "") && (Ext.fly("numInvitees").getHtml() == "0 invitees"))
    	{
    		Ext.Msg.alert("Error", "No inkling information entered.");
    	}
    	else {
			this.getNewInklingView().submit({
				async: false,
				url: "http://127.0.0.1:8000/sencha/updateInkling/",
				method: "POST",
				params: {
					inklingId : this.getNewInklingView().getData()["inklingId"]
				}
			});
		
			this.activateMyInklingsView();
		}
    },
    
    // Toggles the state of the inputted selection button and (un)invites the appropriate friend(s)
	toggleSelectionButton: function(selectionButton, itemId, itemType) {	
		// Create a variable to hold a comma-separated string of selected groups
		var selectedGroupIds = "";
		
		// If the inputted selection button is selected, deselect it
		if (selectionButton.getAttribute("src") == "resources/images/selected.png") {
			selectionButton.set({
				"src": "resources/images/deselected.png"
			});

			if (itemType == "Group") {
				var url = "http://127.0.0.1:8000/sencha/uninviteGroup/";
			
				// Create the comma-separated string of selected groups
				var groupSelectionButtons = Ext.query("#newInklingInvitedGroupsList .selectionButton");
				for (var i = 0; i < groupSelectionButtons.length; i++) {
					var groupSelectionButton = Ext.fly(groupSelectionButtons[i]);
					if (groupSelectionButton.getAttribute("src") == "resources/images/selected.png") {
						selectedGroupIds = selectedGroupIds + groupSelectionButton.getAttribute("groupId") + ",";
					}
				}
			}
			else if (itemType == "Member") {
				var url = "http://127.0.0.1:8000/sencha/uninviteMember/";
			}
		}
		
		// Otherwise, select the inputted selection button
		else {
			selectionButton.set({
				"src": "resources/images/selected.png"
			});
			
			if (itemType == "Group") {
				var url = "http://127.0.0.1:8000/sencha/inviteGroup/";
			}
			else if (itemType == "Member") {
				var url = "http://127.0.0.1:8000/sencha/inviteMember/";
			}
		}
		
		var invitedGroupsPanel = this.getNewInklingInvitedGroupsPanel();
		if ((itemType == "Member") && (!invitedGroupsPanel.getHidden())) {
			invitedGroupsPanel.hide();
		}
		
		// (Un)invite the appropriate friend(s)
		var newInklingInvitedFriendsList = this.getNewInklingInvitedFriendsList();
		Ext.Ajax.request({
			url: url,
			params: {
				itemId: itemId,
				inklingId: this.getNewInklingView().getData()["inklingId"],
				selectedGroupIds: selectedGroupIds
			},
			success: function(response) {
				if (itemType == "Group") {
					newInklingInvitedFriendsList.getStore().load();
				}
			},
			failure: function(response) {
				console.log(response.responseText);
			}
		});
	},
	
	// Toggles the visibility of the new inkling invited groups panel
	toggleNewInklingInvitedGroupsPanel: function() {
		// Get the new inkling invited groups panel
		var newInklingInvitedGroupsPanel = this.getNewInklingInvitedGroupsPanel();
		
		// If the invited groups panel is hidden, re-load and show it
		if (newInklingInvitedGroupsPanel.getHidden()) {
			var newInklingInvitedGroupsStore = this.getNewInklingInvitedGroupsList().getStore();
			newInklingInvitedGroupsStore.setProxy({
				extraParams: {
					view: "invites",
					inklingId: this.getNewInklingView().getData()["inklingId"]
				}
			});
			
			var newInklingInvitedGroupsButton = this.getNewInklingInvitedGroupsButton();
			newInklingInvitedGroupsStore.load(
				function(records, operation, success) {
    				newInklingInvitedGroupsPanel.showBy(newInklingInvitedGroupsButton);
				}
			);
		}
		
		// Otherwise, hide the invited groups panel
		else {
			newInklingInvitedGroupsPanel.hide();
		}
	},
	
	// Hides the new inkling invited groups panel
	hideMyInklingsPanels: function() {
		var newInklingInvitedGroupsPanel = this.getNewInklingInvitedGroupsPanel();
		if (newInklingInvitedGroupsPanel) {
			newInklingInvitedGroupsPanel.hide();
		}
		
		// If the logged in member has been invited to at least one inkling, unhide the inkling invites button and set its text
        Ext.Ajax.request({
            url: "http://127.0.0.1:8000/sencha/numInklingInvitations/",
            success: function(response) {
                numInklingInvites = response.responseText;
                if (numInklingInvites != 0) {
                    this.getInklingInvitationsButton().show();
                    this.getInklingInvitationsButton().setBadgeText(numInklingInvites);
                    this.getMainTabView().getTabBar().getAt(1).setBadgeText(numInklingInvites);
                }
            },
            failure: function(response) {
                console.log(response.responseText);
            },
            scope: this
        });
        
        this.getInklingInvitationsPanel().hide();
	},
	
	hideMyInklingsTabBadge: function() {
	    this.getMainTabView().getTabBar().getAt(1).setBadgeText("");
	},
	
	// Toggles the new inkling's "Share with" field
	toggleShareWithSelect: function() {
		var shareWithSelect = this.getShareWithSelect();
		if (shareWithSelect.getHidden()) {
			this.getShareWithSelect().show();
		}
		else {
			this.getShareWithSelect().hide();
		}
	},
	
	toggleForwardingSelectionItem: function(forwardingSelectionItem) {
	    if (forwardingSelectionItem.getAttribute("src") == "resources/images/selected.png") {
			forwardingSelectionItem.set({
				"src": "resources/images/deselected.png"
			});
	    }
	    else {
	        forwardingSelectionItem.set({
				"src": "resources/images/selected.png"
			});
	    }
	},
	
	selectSelectedGroupsSelectionItem: function(selectedGroupsSelectionItem) {
	    if (selectedGroupsSelectionItem.getAttribute("src") == "resources/images/deselected.png") {
			selectedGroupsSelectionItem.set({
				"src": "resources/images/selected.png"
			});
	    
	        var noOneSelectionItem = Ext.fly("noOneSelectionItem");
	        noOneSelectionItem.set({
				"src": "resources/images/deselected.png"
			});
	    }
	},
	
	selectNoOneSelectionItem: function(noOneSelectionItem) {
	    if (noOneSelectionItem.getAttribute("src") == "resources/images/deselected.png") {
			noOneSelectionItem.set({
				"src": "resources/images/selected.png"
			});
			
			var selectedGroupsSelectionItem = Ext.fly("selectedGroupsSelectionItem");
	        selectedGroupsSelectionItem.set({
				"src": "resources/images/deselected.png"
			});
	    }
	},
	
	toggleSelectedGroupsGroupSelectionItem: function(groupSelectionItem) {
    	console.log(groupSelectionItem);
        var selectedGroupsSelectionItem = Ext.fly("selectedGroupsSelectionItem");
	    //if (selectedGroupsSelectionItem.getAttribute("src") == "resources/images/selected.png") {
    	    if (groupSelectionItem.getAttribute("src") == "resources/images/selected.png") {
	    		groupSelectionItem.set({
		    		"src": "resources/images/deselected.png"
			    });
    	    }
	        else {
	            groupSelectionItem.set({
    				"src": "resources/images/selected.png"
	    		});
	        }
	    //}
	},
	
	respondToInklingInvitation: function(invitationId, response) {
	    Ext.Ajax.request({
            url: "http://127.0.0.1:8000/sencha/respondToInklingInvitation/",
            params: {
				invitationId: invitationId,
				response: response
			},
            success: function(response) {
                this.getInklingInvitationsList().getStore().load();
                //this.getMyInklingsList.getStore().load();
            },
            failure: function(response) {
                console.log(response.responseText);
            },
            scope: this
        });
	},
	
	/**************************/
	/*  BASE CLASS FUNCTIONS  */
	/**************************/
    launch: function () {
        this.callParent(arguments);
        
        // If the main tab view is created, update the inkling invites button
        if (this.getMainTabView()) {
			// If the logged in member has been invited to at least one inkling, unhide the inkling invites button and set its text
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/numInklingInvitations/",
				success: function(response) {
					numInklingInvites = response.responseText;
					if (numInklingInvites != 0) {
						this.getInklingInvitationsButton().show();
                        this.getInklingInvitationsButton().setBadgeText(numInklingInvites);
                        this.getMainTabView().getTabBar().getAt(1).setBadgeText(numInklingInvites);
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