Ext.define("inkle.controller.MyInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
        	mainTabView: "mainTabView",
            myInklingsView: "myInklingsView",
            newInklingView: "newInklingView",
            newInklingInvitedBlotsPanel: "#newInklingInvitedBlotsPanel",
            
            myInklingsViewToolbar: "#myInklingsViewToolbar",
            
            blotInviteesList: "#blotInviteesList",
        	allFriendsInviteesList: "#allFriendsInviteesList",
        	newInklingInvitedFriendsList: "#newInklingInvitedFriendsList",

        	shareWithSelect: "#shareWithSelect",

        	newInklingInvitedBlotsPanel: "#newInklingInvitedBlotsPanel",
        	newInklingInvitedBlotsList: "#newInklingInvitedBlotsList",
        
            // Toolbar buttons
            inklingInvitesButton: "#inklingInvitesButton",
            newInklingButton: "#newInklingButton",
            inviteResponseBackButton: "#inviteResponseBackButton",
            myInklingsInklingBackButton: "#myInklingsInklingBackButton",
            inklingFeedBackButton: "#inklingFeedBackButton",
            inklingFeedButton: "#inklingFeedButton",
            saveInklingButton: "#saveInklingButton",
            newInklingCancelButton: "#newInklingCancelButton",
            newInklingInvitedFriendsBackButton: "#newInklingInvitedFriendsBackButton",
            newInklingInvitedBlotsButton: "#newInklingInvitedBlotsButton",
            newInklingDoneButton: "#newInklingDoneButton",
            inklingInviteesDoneButton: "#inklingInviteesDoneButton",
            allFriendsInviteesDoneButton: "#allFriendsInviteesDoneButton"
        },
        control: {
            myInklingsView: {
            	inklingTapped: "activateInklingView",
            	inklingInvitesButtonTapped: "activateInviteResponseView",
            	onInviteResponseBackButtonTapped: "activateMyInklingsView",
            	newInklingButtonTapped: "activateNewInklingView",
            	newInklingCancelButtonTapped: "activateMyInklingsView",
            	newInklingDoneButtonTapped: "createInkling",
            	inklingInviteesDoneButtonTapped: "activateNewInklingViewPop",
            	allFriendsInviteesDoneButtonTapped: "activateInklingInviteesViewPop",
            	newInklingInvitedFriendsBackButtonTapped: "activateNewInklingViewPop",
            	newInklingInvitedBlotsButtonTapped: "toggleNewInklingInvitedBlotsPanel",
            	deactivate: "hideNewInklingInivtedBlotsPanel"
            },
            
            newInklingView: {
            	newInklingInviteesTapped: "activateInklingInviteesView",
            	isPrivateCheckboxChecked: "toggleShareWithSelect",
            	isPrivateCheckboxUnchecked: "toggleShareWithSelect"
            },
            
            inklingInviteesView: {
            	allFriendsInviteesItemTapped: "activateAllFriendsInviteesView",
            },
            
            newInklingInvitedFriendsView: {
            	memberSelectionButtonTapped: "toggleSelectionButton"
            },
            
            /*allFriendsInviteesView: {
            	memberSelectionItemTapped: "toggleMemberSelectionItem"
            },*/
            
            newInklingInvitedBlotsPanel: {
            	blotSelectionButtonTapped: "toggleSelectionButton"
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
		this.getInklingInvitesButton().show();
		this.getNewInklingButton().show();
    	
    	// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("My Inklings");
		
        //this.getBlotsList().getStore().load();
    },
	
	// Activates the inkling view
	activateInklingView: function(inklingId) {
		// Show appropriate buttons
		this.getNewInklingButton().hide();
		this.getInklingInvitesButton().hide();
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
    
    // Activates the invite response view
    activateInviteResponseView: function() {
    	// Show appropriate buttons
		this.getNewInklingButton().hide();
		this.getInklingInvitesButton().hide();
		this.getInviteResponseBackButton().show();
		
		// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("Inkling Invites");
		
    	this.getMyInklingsView().push({
        	xtype: "inviteResponseView"
        });
    },
    
    // Activates the new inkling view
	activateNewInklingView: function() {
		// Show appropriate buttons
		this.getNewInklingButton().hide();
		this.getInklingInvitesButton().hide();
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
		//this.getInklingInviteesDoneButton().hide();
		this.getNewInklingInvitedFriendsBackButton().hide();
		this.getNewInklingInvitedBlotsButton().hide()
		this.getNewInklingCancelButton().show();
		this.getNewInklingDoneButton().show();
		
		// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("New Inkling");
		
		// Update the number of invitees
        var numInvitees;
        Ext.Ajax.request({
        	async: false,
			url: "http://127.0.0.1:8000/sencha/numInvitees/",
			params: {
				inklingId: this.getNewInklingView().getData()["inklingId"]
			},
			success: function(response) {
				numInvitees = response.responseText;
			},
			failure: function(response) {
				console.log(response.responseText);
				Ext.Msg.alert("Error", response.responseText);
			}
		});
		if (numInvitees == 1) {
			Ext.fly("numInvitees").setText("1 friend invited");	
		}
		else {
			Ext.fly("numInvitees").setText(numInvitees + " friends invited");
		}
		
    	this.getMyInklingsView().pop();
    },
    
    // Activates the inkling invitees view
	activateInklingInviteesView: function() {
		// Show appropriate buttons
		this.getNewInklingCancelButton().hide();
		this.getNewInklingDoneButton().hide();
		//this.getInklingInviteesDoneButton().show();
		this.getNewInklingInvitedFriendsBackButton().show();
		this.getNewInklingInvitedBlotsButton().show();
		
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
		
    	/*
    	this.getMyInklingsView().push({
        	xtype: "inklingInviteesView",
        	data: {
        		inklingId: this.getNewInklingView().getData()["inklingId"]
        	}
        });
        
        var blotInviteesStore = this.getBlotInviteesList().getStore();
			
		blotInviteesStore.setProxy({
			extraParams: {
				inklingId: this.getNewInklingView().getData()["inklingId"]
			}
		});
		blotInviteesStore.load();
		*/
    },
    
    // Activates the all friends inkling invitees view
	activateAllFriendsInviteesView: function() {
		// Show appropriate buttons
		this.getInklingInviteesDoneButton().hide();
		this.getAllFriendsInviteesDoneButton().show();
	
		this.getMyInklingsView().push({
        	xtype: "allFriendsInviteesView",
        	data: {
        		inklingId: this.getNewInklingView().getData()["inklingId"]
        	}
        });
	
		var allFriendsInviteesStore = this.getAllFriendsInviteesList().getStore();
			
		allFriendsInviteesStore.setProxy({
			extraParams: {
				inklingId: this.getNewInklingView().getData()["inklingId"]
			}
		});
		allFriendsInviteesStore.load();
    },
    
    // Activates the inkling invitees view
	activateInklingInviteesViewPop: function() {
		// Show appropriate buttons
		this.getAllFriendsInviteesDoneButton().hide();
		this.getInklingInviteesDoneButton().show();
		
    	this.getBlotInviteesList().getStore().load();
		
    	this.getMyInklingsView().pop();
    },
    
    
    /************/
    // Commands //
    /************/
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
    toggleSelectionButton: function(itemId, itemType) {
		// Get the selection button
		var selectionButton = Ext.fly(itemType + itemId + "SelectionButton");
		
		// Create a variable to hold a comma-separated string of selected blots
		var selectedBlotIds = "";
		
		// If the inputted selection button is selected, deselect it
		if (selectionButton.getAttribute("src") == "resources/images/selected.png") {
			selectionButton.set({
				"src": "resources/images/deselected.png"
			});

			if (itemType == "blot") {
				var url = "http://127.0.0.1:8000/sencha/uninviteBlot/";
			
				// Create the comma-separated string of selected blots
				var blotSelectionButtons = Ext.query(".blot .selectionButton");
				for (var i = 0; i < blotSelectionButtons.length; i++) {
					var blotSelectionButton = Ext.fly(blotSelectionButtons[i].getAttribute("id"));
					if (blotSelectionButton.getAttribute("src") == "resources/images/selected.png") {
						selectedBlotIds = selectedBlotIds + blotSelectionButton.getAttribute("blotId") + ",";
					}
				}
			}
			else if (itemType == "member") {
				var url = "http://127.0.0.1:8000/sencha/uninviteMember/";
			}
		}
		
		// Otherwise, select the inputted selection button
		else {
			selectionButton.set({
				"src": "resources/images/selected.png"
			});
			
			if (itemType == "blot") {
				var url = "http://127.0.0.1:8000/sencha/inviteBlot/";
			}
			else if (itemType == "member") {
				var url = "http://127.0.0.1:8000/sencha/inviteMember/";
			}
		}
		
		var invitedBlotsPanel = this.getNewInklingInvitedBlotsPanel();
		if ((itemType == "member") && (!invitedBlotsPanel.getHidden())) {
			invitedBlotsPanel.hide();
		}
		
		// (Un)invite the appropriate friend(s)
		var newInklingInvitedFriendsList = this.getNewInklingInvitedFriendsList();
		Ext.Ajax.request({
			url: url,
			params: {
				itemId: itemId,
				inklingId: this.getNewInklingView().getData()["inklingId"],
				selectedBlotIds: selectedBlotIds
			},
			success: function(response) {
				if (itemType == "blot") {
					newInklingInvitedFriendsList.getStore().load();
				}
			},
			failure: function(response) {
				console.log(response.responseText);
			}
		});
	},
	
	// Toggles the visibility of the new inkling invited blots panel
	toggleNewInklingInvitedBlotsPanel: function() {
		// Get the new inkling invited blots panel
		var newInklingInvitedBlotsPanel = this.getNewInklingInvitedBlotsPanel();
		
		// If the invited blots panel is hidden, re-load and show it
		if (newInklingInvitedBlotsPanel.getHidden()) {
			var newInklingInvitedBlotsStore = this.getNewInklingInvitedBlotsList().getStore();
			newInklingInvitedBlotsStore.setProxy({
				extraParams: {
					inklingId: this.getNewInklingView().getData()["inklingId"]
				}
			});
			
			var newInklingInvitedBlotsButton = this.getNewInklingInvitedBlotsButton();
			newInklingInvitedBlotsStore.load(
				function(records, operation, success) {
    				newInklingInvitedBlotsPanel.showBy(newInklingInvitedBlotsButton);
				}
			);
		}
		
		// Otherwise, hide the invited blots panel
		else {
			newInklingInvitedBlotsPanel.hide();
		}
	},
	
	// Hides the new inkling invited blots panel
	hideNewInklingInivtedBlotsPanel: function() {
		var newInklingInvitedBlotsPanel = this.getNewInklingInvitedBlotsPanel();
		if (newInklingInvitedBlotsPanel) {
			newInklingInvitedBlotsPanel.hide();
		}
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
	
	/**************************/
	/*  BASE CLASS FUNCTIONS  */
	/**************************/
    launch: function () {
        this.callParent(arguments);
        
        // If the main tab view is created, update the inkling invites button
        if (this.getMainTabView()) {
			// If the logged in member has been invited to at least one inkling, unhide the inkling invites button and set its text
			var mainTabView = this.getMainTabView();
			var inklingInvitesButton = this.getInklingInvitesButton();
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/numInklingInvites/",
				success: function(response) {
					numInklingInvites = response.responseText;
					if (numInklingInvites != 0) {
						inklingInvitesButton.show();
						inklingInvitesButton.setBadgeText(numInklingInvites);
						mainTabView.getTabBar().getAt(1).setBadgeText(numInklingInvites);
					}
				},
				failure: function(response) {
					console.log(response.responseText);
	        	}
			});
		}
    }
});