Ext.define("inkle.controller.MyInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            // Views
            mainTabView: "mainTabView",
            myInklingsView: "myInklingsView",
            newInklingView: "newInklingView",
            newInklingInvitedFriendsView: "newInklingInvitedFriendsView",
            //newInklingInvitedGroupsPanel: "#newInklingInvitedGroupsPanel",
            newInklingInvitedGroupsPanel: "panel[id=newInklingInvitedGroupsPanel]",
            inklingInvitationsPanel: "panel[id=inklingInvitationsPanel]",
            myInklingsFeedCommentPanel: "panel[id=addCommentPanel]",

            myInklingsViewToolbar: "#myInklingsViewToolbar",
            myInklingsAddCommentButton: "#myInklingsAddCommentButton",

            newInklingInvitedFriendsList: "#newInklingInvitedFriendsList",

            inklingInvitationsList: "#inklingInvitationsList",

            shareWithSelect: "#shareWithSelect",

            
            newInklingInvitedGroupsList: "#newInklingInvitedGroupsList",

            myInklingsList: "#myInklingsList",

            // Top toolbars
            myInklingsViewToolbar: "#myInklingsViewToolbar",
            newInklingViewToolbar: "#newInklingViewToolbar",

            // My inklings view toolbar buttons
            inklingInvitationsButton: "#inklingInvitationsButton",
            newInklingButton: "#newInklingButton",
            inviteResponseBackButton: "myInklingsView #inviteResponseBackButton",
            myInklingsInklingBackButton: "myInklingsView #myInklingsInklingBackButton",
            inklingFeedBackButton: "myInklingsView #inklingFeedBackButton",
            inklingFeedButton: "myInklingsView #inklingFeedButton",
            saveInklingButton: "myInklingsView #saveInklingButton",
            inklingInviteesDoneButton: "myInklingsView #inklingInviteesDoneButton",

            // New inkling view toolbar buttons
            newInklingDoneButton: "newInklingView #newInklingDoneButton",
            newInklingCancelButton: "newInklingView #newInklingCancelButton",
            newInklingInvitedFriendsBackButton: "newInklingView #newInklingInvitedFriendsBackButton",
            newInklingInvitedGroupsButton: "newInklingView #newInklingInvitedGroupsButton",
            
            // New inkling form
            newInklingLocationTextField: "#newInklingLocationTextField",
            newInklingDatePicker: "#newInklingDatePicker",
            newInklingTimeTextField: "#newInklingTimeTextField",
            newInklingNotesTextArea: "#newInklingNotesTextArea"
        },
        control: {
            myInklingsView: {
                inklingTapped: "activateInklingView",
                inklingInvitationsButtonTapped: "toggleInklingInvitationsVisibility",
                onInviteResponseBackButtonTapped: "activateMyInklingsView",
                newInklingButtonTapped: "activateNewInklingView",
                activate: "hideMyInklingsTabBadge",
                deactivate: "hideMyInklingsPanels",
                activeitemchange: "hideMyInklingsPanels",
                myInklingsListRefreshed: "updateMyInklingsList",
                initialize: "updateMyInklingsList"
            },

            newInklingView: {
                // Toolbar buttons
                newInklingCancelButtonTapped: "activateMyInklingsView",
                newInklingDoneButtonTapped: "createInkling",
                newInklingInvitedFriendsBackButtonTapped: "activateNewInklingView",
                newInklingInvitedGroupsButtonTapped: "toggleNewInklingInvitedGroupsPanel",

                // Invited friends
                newInklingInvitedFriendsTapped: "activateNewInklingInvitedFriendsView",

                // Share settings
                selectedGroupsShareSettingTapped: "selectSelectedGroupsShareSetting",
                groupShareSettingTapped: "toggleGroupShareSetting",
                noOneShareSettingTapped: "selectNoOneShareSetting",
                forwardingShareSettingTapped: "toggleForwardingShareSetting"
            },

            newInklingInvitedFriendsView: {
                memberSelectionButtonTapped: "toggleMemberSelectionButton"
            },

            inklingInvitationsPanel: {
                invitationButtonTapped: "respondToInklingInvitation",
                inklingInvitationTapped: "activateInklingView",
                inklingInvitationsListRefreshed: "updateInklingInvitationsList",
                initialize: "updateInklingInvitationsList"
            },

            newInklingInvitedGroupsPanel: {
                groupSelectionButtonTapped: "toggleGroupSelectionButton"
            }
        }
    },


    /**********************/
    /*  VIEW TRANSITIONS  */
    /**********************/
    /* Activates the my inklings view */
    activateMyInklingsView: function(source) {
        console.log("activateMyInklingsView()");

        if (source == "newInklingView") {
            Ext.Viewport.animateActiveItem(this.getMainTabView(), {
                type: "slide",
                direction: "down"
            });
        }
        else {
            // Pop the new inkling view from the my inklings view
            this.getMyInklingsView().pop();

            // Show appropriate buttons
    		this.getMyInklingsInklingBackButton().hide();
    		this.getInklingFeedButton().hide();
    		this.getInviteResponseBackButton().hide();
    		this.getInklingInvitationsButton().show();
    		this.getNewInklingButton().show();

            // Update the toolbar title
    		this.getMyInklingsViewToolbar().setTitle("My Inklings");
		
            //this.getGroupsList().getStore().load();
        }
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


    /* Activates the new inkling view */
    activateNewInklingView: function(source) {
        // Create the new inkling view if it does not exist yet
        if (source == "myInklingsView") {
            // Destroy the current new inkling view if it exists
            if (this.getNewInklingView()) {
                this.getNewInklingView().destroy();
            }
            
            // Activate the new inkling view
            var newInklingView = Ext.create("inkle.view.NewInkling");
            Ext.Viewport.animateActiveItem(newInklingView, {
                type: "slide",
                direction: "up"
            });
            
            // Set the data for the new inkling view
            newInklingView.setData({
                invitedMemberIds: "",
                invitedGroupIds: ""
            });
        }

        // Otherwise, pop off the new inkling invited friends view
        else if (source == "newInklingInvitedFriendsView") {
            // Show appropriate buttons
            this.getNewInklingInvitedFriendsBackButton().hide();
            this.getNewInklingInvitedGroupsButton().hide()
            this.getNewInklingCancelButton().show();
            this.getNewInklingDoneButton().show();

            // Get the list of members and groups invited in the invited friends view
            var invitedMemberIds = this.getInvitedMemberIds();
            var invitedGroupIds = this.getInvitedGroupIds();

            // Update the new inkling view's data so we can recreate the invited friends view
            var newInklingView = this.getNewInklingView();
            newInklingView.setData({
                invitedMemberIds: invitedMemberIds,
                invitedGroupsIds: invitedGroupIds
            });

            // Destroy the invited groups panel
            this.getNewInklingInvitedGroupsPanel().destroy();

            // Pop off the new inkling invited friends view
            newInklingView.pop();
            
            // Update the new inkling view toolbar's title
            this.getNewInklingViewToolbar().setTitle("New Inkling");
        }
    },


    /* Activates the new inkling invited friends view */
    activateNewInklingInvitedFriendsView: function() {
        // Show appropriate buttons
        this.getNewInklingCancelButton().hide();
        this.getNewInklingDoneButton().hide();
        this.getNewInklingInvitedFriendsBackButton().show();
        this.getNewInklingInvitedGroupsButton().show();

        // Update the toolbar title
        this.getNewInklingViewToolbar().setTitle("Invites");

        // Push the invited friends view
        this.getNewInklingView().push({
            xtype: "newInklingInvitedFriendsView"
        });
        
        // Load the invited friends list
        var newInklingInvitedFriendsStore = this.getNewInklingInvitedFriendsList().getStore();
        newInklingInvitedFriendsStore.setProxy({
            extraParams: {
                mode: "invite",
                selectedMemberIds: this.getNewInklingView().getData()["invitedMemberIds"]
            }
        });
        newInklingInvitedFriendsStore.load();
    },


    /**************/
    /*  Commands  */
    /**************/
    /* Toggles the visibility of the inkling invitations panel */
    toggleInklingInvitationsVisibility: function() {
        // Toggle the visibility of the inkling invitations panel
        var inklingInvitationsPanel = this.getInklingInvitationsPanel();
        if (inklingInvitationsPanel.getHidden()) {
            inklingInvitationsPanel.showBy(this.getInklingInvitationsButton());
            //this.getInklingInvitationsButton().removeCls("toolbarButton toolbarButtonEnvelope");
            //this.getInklingInvitationsButton().setCls("toolbarButtonPressed toolbarButtonEnvelopePressed");
        }
        else {
            inklingInvitationsPanel.hide();
            //this.getInklingInvitationsButton().removeCls("toolbarButtonPressed toolbarButtonEnvelopePressed");
            //this.getInklingInvitationsButton().setCls("toolbarButton toolbarButtonEnvelope");
        }
    },


    /* Creates a new inkling from the information entered by the logged-in user */
    createInkling: function() {
        // Get the inkling form data
        var location = this.getNewInklingLocationTextField().getValue();
        var date = this.getNewInklingDatePicker().getValue();
        var time = this.getNewInklingTimeTextField().getValue();
        var notes = this.getNewInklingNotesTextArea().getValue();
        var numInvitedFriends = Ext.fly("numInvitedFriends").getHtml();
        
        // Validate the new inkling form
        if ((location == "") && (date == null) && (time == "") && (notes == "") && (numInvitedFriends == "0"))
        {
            Ext.Msg.alert("Error", "No inkling information entered.");
        }

        // If the new inkling form is valid, create a new inkling
        else {
            var newInklingView = this.getNewInklingView();
            Ext.Ajax.request({
                url: inkle.app.baseUrl + "/createInkling/",
                headers: { "cache-control": "no-cache" },
                method: "POST",

                params: {
                    location: location,
                    date: date,
                    time: time,
                    notes: notes,
                    invitedMemberIds: newInklingView.getData()["invitedMemberIds"]
                },

                success: function(response) {
                    // Update and activate the my inklings list
                    // TODO: put the activate in the update's callback?
                    this.updateMyInklingsList();
                    this.activateMyInklingsView("newInklingView");
                },

                failure: function(response) {
                    Ext.Msg.alert("Error", "Cannot create a new inkling. Please try again later.");
                },

                scope: this
            });
        }
    },


    /* Toggles the state of the inputted member selection button and (un)invites the corresponding member */
    toggleMemberSelectionButton: function(tappedSelectionButton) {
        // Only do anything if the invited groups panel is hidden
        if (this.getNewInklingInvitedGroupsPanel().getHidden()) {
            // Determine whether to invite or uninvite the tapped member
            /*var url;
            if (tappedSelectionButton.hasCls("selected")) {
                url = inkle.app.baseUrl + "/uninviteMember/";
            }
            else {
                url = inkle.app.baseUrl + "/inviteMember/";
            }*/

            // (Un)invite the tapped member
            /*Ext.Ajax.request({
                url: url,
                headers : { "cache-control": "no-cache" },
                params: {
                    memberId: tappedSelectionButton.parent(".member").getAttribute("data-memberId"),
                    inklingId: this.getNewInklingView().getData()["inklingId"]
                },

                success: function(response) {*/
                    // Toggle the selection button's state
                    tappedSelectionButton.toggleCls("selected");
                    
                    // Update the selection button's image source and the number of invited friends
                    var numInvitedFriends;
                    if (tappedSelectionButton.hasCls("selected")) {
                        tappedSelectionButton.set({
                            "src": "resources/images/selected.png"
                        });
                        
                        numInvitedFriends = parseInt(Ext.fly("numInvitedFriends").getHtml()) + 1;
                    }
                    else {
                        tappedSelectionButton.set({
                            "src": "resources/images/deselected.png"
                        });
                        
                        numInvitedFriends = parseInt(Ext.fly("numInvitedFriends").getHtml()) - 1;
                    }

                    // Update the text displaying the number of invited friends on the "New Inkling" page
                    Ext.fly("numInvitedFriends").setText(numInvitedFriends);
                    if (numInvitedFriends == 1) {
                        Ext.fly("numInvitedFriendsPlural").setText("");
                    }
                    else {
                        Ext.fly("numInvitedFriendsPlural").setText("s");
                    }
                /*},

                failure: function(response) {
                    Ext.message("Error", response.responseText);
                }, 

                scope: this
            });*/
        }
    },


    /* Toggles the state of the inputted group selection button and (un)invites the corresponding group */
    toggleGroupSelectionButton: function(tappedSelectionButton) {
        // Determine whether to invite or uninvite the tapped group
        var url;
        var selectedGroupIds = "";
        if (tappedSelectionButton.hasCls("selected")) {
            url = inkle.app.baseUrl + "/uninviteGroup/";

            // Create a comma-separated string of the selected groups
            var groupSelectionButtons = Ext.query("#newInklingInvitedGroupsList .selectionButton");
            for (var i = 0; i < groupSelectionButtons.length; i++) {
                var groupSelectionButton = Ext.fly(groupSelectionButtons[i]);
                if ((groupSelectionButton.hasCls("selected")) && (tappedSelectionButton != groupSelectionButton)) {
                    selectedGroupIds = selectedGroupIds + groupSelectionButton.parent(".group").getAttribute("data-groupId") + ",";
                }
            }
        }
        else {
            url = inkle.app.baseUrl + "/inviteGroup/";
        }

        // (Un)invite the tapped group
        var newInklingInvitedFriendsList = this.getNewInklingInvitedFriendsList();
        Ext.Ajax.request({
            url: url,
            headers: { "cache-control": "no-cache" },
            params: {
                groupId: tappedSelectionButton.parent(".group").getAttribute("data-groupId"),
                inklingId: this.getNewInklingView().getData()["inklingId"],
                selectedGroupIds: selectedGroupIds
            },

            success: function(response) {
                // Update the selection button's image source
                if (tappedSelectionButton.hasCls("selected")) {
                    tappedSelectionButton.set({
                        "src": "resources/images/deselected.png"
                    });
                }
                else {
                    tappedSelectionButton.set({
                        "src": "resources/images/selected.png"
                    });
                }

                // Toggle the selection button's state
                tappedSelectionButton.toggleCls("selected");

                // Update the invited friends list
                this.getNewInklingInvitedFriendsList().getStore().load();
            },

            failure: function(response) {
                Ext.message("Error", response.responseText);
            },

            scope: this
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
                    selectedGroupIds: this.getNewInklingView().getData()["invitedGroupIds"]
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
		
		var myInklingsFeedCommentPanel = this.getMyInklingsFeedCommentPanel();
		if (myInklingsFeedCommentPanel) {
			myInklingsFeedCommentPanel.hide();
			this.getMyInklingsAddCommentButton().removeCls("toolbarButtonPressed toolbarButtonPlusPressed");
            this.getMyInklingsAddCommentButton().setCls("toolbarButton toolbarButtonPlus");
		}
		
		// If the logged in member has been invited to at least one inkling, unhide the inkling invites button and set its text
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/numInklingInvitations/",
            headers: { "cache-control": "no-cache" },
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
        //this.getInklingInvitationsButton().removeCls("toolbarButtonPressed toolbarButtonEnvelopePressed");
		//this.getInklingInvitationsButton().setCls("toolbarButton toolbarButtonEnvelope");
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
            url: inkle.app.baseUrl + "/respondToInklingInvitation/",
            headers: { "cache-control": "no-cache" },
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


    /* Returns a list of member IDs (as strings) of the members who are selected on the newInklingInvitedFriendsView */
    getInvitedMemberIds: function() {
        var invitedMemberIds = "";
        var first = true;

        var invitedMemberSelectionButtons = Ext.query("#newInklingInvitedFriendsList .selected");
        for (var i = 0; i < invitedMemberSelectionButtons.length; i++) {
            if (first) {
                invitedMemberIds += Ext.fly(invitedMemberSelectionButtons[i]).parent(".member").getAttribute("data-memberId");
                first = false;
            }
            else {
                invitedMemberIds += "," + Ext.fly(invitedMemberSelectionButtons[i]).parent(".member").getAttribute("data-memberId");
            }
        }

        return invitedMemberIds;
    },


    /* Returns a list of group IDs (as strings) of the groups who are selected on the newInklingInvitedFriendsView */
    getInvitedGroupIds: function() {
        var invitedGroupIds = "";
        var first = true;

        var invitedGroupSelectionButtons = Ext.query("#newInklingInvitedGroupsList .selected");
        for (var i = 0; i < invitedGroupSelectionButtons.length; i++) {
            if (first) {
                invitedGroupIds += Ext.fly(invitedGroupSelectionButtons[i]).parent(".member").getAttribute("data-groupId");
                first = false;
            }
            else {
                invitedGroupIds += "," + Ext.fly(invitedGroupSelectionButtons[i]).parent(".member").getAttribute("data-groupId");
            }
        }

        return invitedGroupIds;
    },


    /* Updates the my inklings list */
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


    /* Updates the inkling invitations list */
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
