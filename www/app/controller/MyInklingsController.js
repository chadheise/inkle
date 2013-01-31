Ext.define("inkle.controller.MyInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            // Views
            mainTabView: "mainTabView",
            myInklingsView: "myInklingsView",
            newInklingView: "newInklingView",
            //newInklingInvitedGroupsPanel: "#newInklingInvitedGroupsPanel",
            newInklingInvitedGroupsPanel: "panel[id=newInklingInvitedGroupsPanel]",
            inklingInvitationsPanel: "panel[id=inklingInvitationsPanel]",

            myInklingsViewToolbar: "#myInklingsViewToolbar",

            newInklingInvitedFriendsList: "#newInklingInvitedFriendsList",

            inklingInvitationsList: "#inklingInvitationsList",

            shareWithSelect: "#shareWithSelect",

            
            newInklingInvitedGroupsList: "#newInklingInvitedGroupsList",

            myInklingsList: "#myInklingsList",

            // Toolbar buttons
            inklingInvitationsButton: "#inklingInvitationsButton",
            newInklingButton: "#newInklingButton",
            inviteResponseBackButton: "myInklingsView #inviteResponseBackButton",
            myInklingsInklingBackButton: "myInklingsView #myInklingsInklingBackButton",
            inklingFeedBackButton: "myInklingsView #inklingFeedBackButton",
            inklingFeedButton: "myInklingsView #inklingFeedButton",
            saveInklingButton: "myInklingsView #saveInklingButton",
            newInklingCancelButton: "myInklingsView #newInklingCancelButton",
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
                myInklingsListRefreshed: "updateMyInklingsList",
                initialize: "updateMyInklingsList"
            },
            
            newInklingView: {
                newInklingInviteesTapped: "activateInklingInviteesView",
                selectedGroupsShareSettingTapped: "selectSelectedGroupsShareSetting",
                groupShareSettingTapped: "toggleGroupShareSetting",
                noOneShareSettingTapped: "selectNoOneShareSetting",
                forwardingShareSettingTapped: "toggleForwardingShareSetting"
            },
            
            newInklingInvitedFriendsView: {
                memberSelectionButtonTapped: "toggleSelectionButton"
            },
            
            inklingInvitationsPanel: {
                invitationButtonTapped: "respondToInklingInvitation",
                inklingInvitationTapped: "activateInklingView",
                inklingInvitationsListRefreshed: "updateInklingInvitationsList",
                initialize: "updateInklingInvitationsList"
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
	activateInklingView: function(inklingId, source) {
		// Show appropriate buttons
		this.getNewInklingButton().hide();
		this.getInklingInvitationsButton().hide();
		this.getMyInklingsInklingBackButton().show();
		this.getInklingFeedButton().show();
		
        // Update the back button text
        if (source == "myInklings") {
            this.getMyInklingsInklingBackButton().setText("My Inklings");
        }
        else if (source == "invitations") {
            this.getMyInklingsInklingBackButton().setText("Invitations");
        }

        // Get today's date
        var today = new Date();

        // Push the inkling view onto the all inklings view
        this.getMyInklingsView().push({
            xtype: "inklingView",
            data: {
                inklingId: inklingId,
                timezoneOffset: today.getTimezoneOffset(),
                source: source,
                isMemberAttending: "True"
            }
        });

        // Update the top toolbar's title
        this.getMyInklingsViewToolbar().setTitle("Inkling");
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
			url: "http://127.0.0.1:8000/createInkling/",
			success: function(response) {
				inklingId = response.responseText;
			},
			failure: function(response) {
			    console.log(response.responseText);
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
			url: "http://127.0.0.1:8000/numInvitedFriends/",
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
				url: "http://127.0.0.1:8000/updateInkling/",
				method: "POST",
				params: {
					inklingId : this.getNewInklingView().getData()["inklingId"]
				}
			});
		
		    this.updateMyInklingsList();
		
			this.activateMyInklingsView();
		}
    },
    
    // Toggles the state of the inputted selection button and (un)invites the appropriate friend(s)
	toggleSelectionButton: function(selectionButton, itemId, itemType) {	
		// Create a variable to hold a comma-separated string of selected groups
		var selectedGroupIds = "";
		
		// If the inputted selection button is selected, deselect it
		if (selectionButton.hasCls("selected")) {
			selectionButton.set({
				"src": "resources/images/deselected.png"
			});

			if (itemType == "Group") {
				var url = "http://127.0.0.1:8000/uninviteGroup/";
			
				// Create the comma-separated string of selected groups
				var groupSelectionButtons = Ext.query("#newInklingInvitedGroupsList .selectionButton");
				for (var i = 0; i < groupSelectionButtons.length; i++) {
					var groupSelectionButton = Ext.fly(groupSelectionButtons[i]);
					if (groupSelectionButton.hasCls("selected")) {
						selectedGroupIds = selectedGroupIds + groupSelectionButton.getAttribute("groupId") + ",";
					}
				}
			}
			else if (itemType == "Member") {
				var url = "http://127.0.0.1:8000/uninviteMember/";
			}

            selectionButton.removeCls("selected");
		}
		
		// Otherwise, select the inputted selection button
		else {
			selectionButton.set({
				"src": "resources/images/selected.png"
			});
			
			if (itemType == "Group") {
				var url = "http://127.0.0.1:8000/inviteGroup/";
			}
			else if (itemType == "Member") {
				var url = "http://127.0.0.1:8000/inviteMember/";
			}

            selectionButton.addCls("selected");
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
					autoSetGroupsAsSelected: "false",
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
            url: "http://127.0.0.1:8000/numInklingInvitations/",
            success: function(response) {
                numInklingInvites = response.responseText;
                if (numInklingInvites != 0) {
                    this.getInklingInvitationsButton().setBadgeText(numInklingInvites);
                    if (this.getMainTabView().getTabBar().getActiveTab() != this.getMainTabView().getTabBar().getAt(1)) {
                        this.getMainTabView().getTabBar().getAt(1).setBadgeText(numInklingInvites);
                    }
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
	
	/*Share Settings */
    selectSelectedGroupsShareSetting: function(selectedGroupsShareSetting) {
	    if (selectedGroupsShareSetting.getAttribute("src") == "resources/images/deselected.png") {
    	    selectedGroupsShareSetting.set({
    	       "src": "resources/images/selected.png" 
    	    });

    	    Ext.get('newInklingShareOptions').select('img.groupShareSetting').each(function() {
                if (this.getAttribute("src") == "resources/images/fadedselected.png") {
                    this.set({
                        "src": "resources/images/selected.png"
                    });
                }
            });

    	    var noOneShareSetting = Ext.get('newInklingShareOptions').select(".noOneShareSetting");
            noOneShareSetting.set({
    			"src": "resources/images/deselected.png"
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
    	var selectedGroupsShareSetting = Ext.get("newInklingShareOptions").select(".selectedGroupsShareSetting").elements[0];
	    if (selectedGroupsShareSetting.getAttribute("src") == "resources/images/selected.png") {
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
	    }
	},
	
	selectNoOneShareSetting: function(noOneShareSetting) {
	    //Only make ajax call if the item was not selected
	    if (noOneShareSetting.getAttribute("src") == "resources/images/deselected.png") {
    	    noOneShareSetting.set({
    	       "src": "resources/images/selected.png" 
    	    });

    	    Ext.get('newInklingShareOptions').select('img.groupShareSetting').each(function() {
                if (this.getAttribute("src") == "resources/images/selected.png") {
                    this.set({
                        "src": "resources/images/fadedselected.png"
                    });
                }
            });

    	    var selectedGroupsShareSetting = Ext.get("newInklingShareOptions").select(".selectedGroupsShareSetting");
            selectedGroupsShareSetting.set({
    			"src": "resources/images/deselected.png"
    		});
        }
	},
	
	toggleForwardingShareSetting: function(forwardingShareSetting) {	    
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
	
	respondToInklingInvitation: function(invitationId, invitationResponse) {
        console.log(invitationId);
        console.log(invitationResponse);
	    Ext.Ajax.request({
            url: "http://127.0.0.1:8000/respondToInklingInvitation/",
            params: {
				invitationId: invitationId,
				response: invitationResponse
			},
            success: function(response) {
                var numInklingInvitations = response.responseText;
                if (numInklingInvitations != 0) {
                    this.getInklingInvitationsButton().setBadgeText(numInklingInvitations);
                }
                else {
                    this.getInklingInvitationsButton().setBadgeText("");
                }
                
                this.getInklingInvitationsList().getStore().load();
                if (invitationResponse == "accepted") {
                    this.updateMyInklingsList();
                }
                
            },
            failure: function(response) {
                console.log(response.responseText);
            },
            scope: this
        });
	},
	
	updateMyInklingsList: function() {
        // Get today's date
        var today = new Date();

        // Update the my inklings list
        var myInklingsListStore = this.getMyInklingsList().getStore();
        myInklingsListStore.setProxy({
            extraParams: {
                timezoneOffset: today.getTimezoneOffset()
            }
        });
        myInklingsListStore.load();
	},

    updateInklingInvitationsList: function() {
        // Get today's date
        var today = new Date();
    
        // Update the my inklings list
        var inklingsInvitationsListStore = this.getInklingInvitationsList().getStore();
        inklingsInvitationsListStore.setProxy({
            extraParams: {
                timezoneOffset: today.getTimezoneOffset()
            }
        });
        inklingsInvitationsListStore.load();
    }
});
