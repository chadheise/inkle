Ext.define("inkle.controller.InklingController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
        	allInklingsView: "allInklingsView",
        	myInklingsView: "myInklingsView",
            inklingView: "inklingView",
            inklingFeedView: "inklingFeedView",
            inklingInvitationsPanel: "panel[id=inklingInvitationsPanel]",
            
            inklingFeedList: "#inklingFeedList",
            addCommentPanel: "#addCommentPanel",
            
            // Toolbars
            allInklingsViewToolbar: "#allInklingsViewToolbar",
            myInklingsViewToolbar: "#myInklingsViewToolbar",

            // "All Inklings" view toolbar buttons
            allInklingsInklingBackButton: "#allInklingsInklingBackButton",
            allInklingsInklingFeedButton: "allInklingsView #inklingFeedButton",
            allInklingsBackToInklingButton: "allInklingsView #backToInklingButton",
            allInklingsJoinInklingButton: "allInklingsView #joinInklingButton",
            allInklingsSaveInklingButton: "allInklingsView #saveInklingButton",
            allInklingsCancelEditInklingButton: "allInklingsView #cancelEditInklingButton",
            allInklingsAddCommentButton: "allInklingsView #allInklingsAddCommentButton",
            allInklingsAddCommentPanel: "allInklingsView #addCommentPanel",

            // "My Inklings" view toolbar buttons
            myInklingsInklingBackButton: "#myInklingsInklingBackButton",
            myInklingsInklingFeedButton: "myInklingsView #inklingFeedButton",
            myInklingsBackToInklingButton: "myInklingsView #backToInklingButton",
            myInklingsSaveInklingButton: "myInklingsView #saveInklingButton",
            myInklingsCancelEditInklingButton: "myInklingsView #cancelEditInklingButton",
            myInklingsAddCommentButton: "myInklingsView #myInklingsAddCommentButton",
            myInklingsAddCommentPanel: "myInklingsView #addCommentPanel",

            // Elements
            allInklingsDateButton: "#allInklingsDateButton",
            allInklingsGroupsButton: "#allInklingsGroupsButton",
            inklingInvitationsButton: "#inklingInvitationsButton",
            
            newInklingButton: "#newInklingButton",
            
            inklingMembersAttendingList: "#inklingMembersAttendingList",
            inklingMembersAwaitingReplyList: "#inklingMembersAwaitingReplyList"
        },
        
        control: {
            allInklingsView: {
            	// View transitions
            	inklingFeedButtonTapped: "activateInklingFeedView",
            	allInklingsInklingBackButtonTapped: "activateAllInklingsView",
            	backToInklingButtonTapped: "backToInklingView",
            	
            	// Commands
            	joinInklingButtonTapped: "joinInkling",
            	saveInklingButtonTapped: "saveInkling",
            	cancelEditInklingButtonTapped: "cancelEditInkling",
            	allInklingsAddCommentButtonTapped: "toggleAddCommentPanelVisibility",
            },
            myInklingsView: {
            	// View transitions
                inklingFeedButtonTapped: "activateInklingFeedView",
            	myInklingsInklingBackButtonTapped: "activateMyInklingsView",
                backToInklingButtonTapped: "backToInklingView",
                
                //Commands
                myInklingsAddCommentButtonTapped: "toggleAddCommentPanelVisibility",
            },
            inklingView: {
            	// Commands
            	editInklingButtonTapped: "editInkling",
            	memberPictureTapped: "showMemberName",
            	membersAttendingDisclosureArrowTapped: "activateInklingMembersAttendingView",
            	membersAwaitingReplyDisclosureArrowTapped: "activateInklingMembersAwaitingReplyView"
            },
            inklingFeedView: {
                inklingFeedListRefreshed: "updateInklingFeedList",
            },
            addCommentPanel: {
            	// Commands
            	addCommentTextFieldKeyedUp: "toggleAddCommentPostButton",
            	addCommentPostButtonTapped: "addComment"
            }
        }
    },
	
	
	/**********************/
	/*  VIEW TRANSITIONS  */
	/**********************/
	
    /* Activates the inkling feed view from the inkling view */
    activateInklingFeedView: function() {
        // If we are in the "All Inklings" view
        if (!this.getAllInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getAllInklingsInklingBackButton().hide();
            this.getAllInklingsInklingFeedButton().hide();
            this.getAllInklingsBackToInklingButton().show();
            this.getAllInklingsAddCommentButton().show();
            // Push the inkling feed view onto the all inklings view
            this.getAllInklingsView().push({
                xtype: "inklingFeedView",
                data: {
                    inklingId: this.getInklingView().getData()["inklingId"]
                }
            });
            
            this.getAllInklingsViewToolbar().setTitle("Feed");

            // Update the inkling feed list
            this.updateInklingFeedList();
        }

        // If we are in the "My Inklings" view
        else if (!this.getMyInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getMyInklingsInklingBackButton().hide();
            this.getMyInklingsInklingFeedButton().hide();
            this.getMyInklingsBackToInklingButton().show();
            this.getMyInklingsAddCommentButton().show();

            // Push the inkling feed view onto the all inklings view
            this.getMyInklingsView().push({
                xtype: "inklingFeedView",
                data: {
                    inklingId: this.getInklingView().getData()["inklingId"]
                }
            });
            
            this.getMyInklingsViewToolbar().setTitle("Feed");

            // Update the inkling feed list
            this.updateInklingFeedList();
        }
	},
    
    /* Activates the all inklings view from the inkling view */
	activateAllInklingsView: function() {
		// Display the appropriate top toolbar buttons
		this.getAllInklingsInklingBackButton().hide();
		this.getAllInklingsInklingFeedButton().hide();
		this.getAllInklingsJoinInklingButton().hide();
        this.getAllInklingsDateButton().show();
        this.getAllInklingsGroupsButton().show();

    	// Pop the inkling view off of the all inklings view
        this.getAllInklingsView().pop();

        this.getAllInklingsViewToolbar().setTitle("Inklings");
    },
    
    /* Activates the my inklings view from the inkling view */
	activateMyInklingsView: function() {
		// Display the appropriate top toolbar buttons
    	this.getMyInklingsInklingBackButton().hide();
		this.getMyInklingsInklingFeedButton().hide();
        this.getNewInklingButton().show();
        this.getInklingInvitationsButton().show();
    	
    	// Pop the inkling view off of the all inklings view
    	var source = this.getMyInklingsView().getActiveItem().getData()["source"];
    	this.getMyInklingsView().pop();
        
        // Show the panel if the source is invitations
        if (source == "invitations") {
            this.getInklingInvitationsPanel().showBy(this.getInklingInvitationsButton());
        }
        
        // Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("My Inklings");
    },
	
	/* Activates the inkling view from the inkling feed view */
	backToInklingView: function() {
        // Pop off the inkling feed, members attening, or awaiting reply view
        
        if (!this.getAllInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getAllInklingsBackToInklingButton().hide();
            this.getAllInklingsAddCommentButton().hide();
            this.getAllInklingsAddCommentButton().removeCls("toolbarButtonPressed toolbarButtonPlusPressed");
            this.getAllInklingsAddCommentButton().setCls("toolbarButton toolbarButtonPlus");
            
            if (this.getInklingView().getData()["isMemberAttending"] === "True") {
                this.getAllInklingsInklingFeedButton().show();
            }
            else {
                this.getAllInklingsJoinInklingButton().show();
            }
            this.getAllInklingsInklingBackButton().show();

            this.getAllInklingsView().pop();
            this.getAllInklingsViewToolbar().setTitle("Inkling");
            
            this.getAllInklingsAddCommentPanel().destroy();
        }
        else if (!this.getMyInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getMyInklingsBackToInklingButton().hide();
            this.getMyInklingsAddCommentButton().hide();
            this.getMyInklingsAddCommentButton().removeCls("toolbarButtonPressed toolbarButtonPlusPressed");
            this.getMyInklingsAddCommentButton().setCls("toolbarButton toolbarButtonPlus");
            
            this.getMyInklingsInklingFeedButton().show();
            this.getMyInklingsInklingBackButton().show();
            
            this.getMyInklingsView().pop();
            this.getMyInklingsViewToolbar().setTitle("Inkling");
            
            this.getMyInklingsAddCommentPanel().destroy();
        }

    },
	
	activateInklingMembersAttendingView: function() {
        // Push the inkling members attending view onto the inkling view
        if (!this.getAllInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getAllInklingsInklingBackButton().hide();
            this.getAllInklingsInklingFeedButton().hide();
            this.getAllInklingsJoinInklingButton().hide();
            this.getAllInklingsBackToInklingButton().show();

			this.getAllInklingsView().push({
            	xtype: "inklingMembersAttending"
            });
            this.getAllInklingsViewToolbar().setTitle("Attending");
        }
        else if (!this.getMyInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getMyInklingsInklingBackButton().hide();
            this.getMyInklingsInklingFeedButton().hide();
            this.getMyInklingsBackToInklingButton().show();

            this.getMyInklingsView().push({
                xtype: "inklingMembersAttending"
            });

            this.getMyInklingsViewToolbar().setTitle("Attending");
        }

        // Update the inkling members attending list
        this.updateInklingMembersAttendingList();
	},
	
	activateInklingMembersAwaitingReplyView: function() {
        // Push the inkling members awaiting reply view onto the inkling view
        if (!this.getAllInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getAllInklingsInklingBackButton().hide();
            this.getAllInklingsInklingFeedButton().hide();
            this.getAllInklingsJoinInklingButton().hide();
            this.getAllInklingsBackToInklingButton().show();

            this.getAllInklingsView().push({
                xtype: "inklingMembersAwaitingReply"
            });

            this.getAllInklingsViewToolbar().setTitle("Awaiting");
        }
        else if (!this.getMyInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getMyInklingsInklingBackButton().hide();
            this.getMyInklingsInklingFeedButton().hide();
            this.getMyInklingsBackToInklingButton().show();

            this.getMyInklingsView().push({
                xtype: "inklingMembersAwaitingReply"
            });

            this.getMyInklingsViewToolbar().setTitle("Awaiting");
        }
        
        // Update the inkling members awaiting reply list
        this.updateInklingMembersAwaitingReplyList();
	},
	
    /**************/
	/*  COMMANDS  */
	/**************/
	/* Updates the inkling feed list */
	updateInklingFeedList: function() {
        // Get the inkling feed list's store
        var inklingFeedListStore = this.getInklingFeedList().getStore();

		// Update the inkling feed list's store
		inklingFeedListStore.setProxy({
			extraParams: {
				inklingId: this.getInklingView().getData()["inklingId"]
			}
		});
		
		// Re-load the inkling feed list
		inklingFeedListStore.load(function() {
            this.getInklingFeedList().getScrollable().getScroller().refresh().scrollToEnd(false);
        }, this);
	},
	
	/* Updates the inkling members attending list */
	updateInklingMembersAttendingList: function() {
        // Get the inkling members attending list's store
        var inklingMembersAttendingListStore = this.getInklingMembersAttendingList().getStore();
		
		// Update the inkling members attending list's store
		inklingMembersAttendingListStore.setProxy({
			extraParams: {
				inklingId: this.getInklingView().getData()["inklingId"]
			}
		});
		
		// Re-load the inkling members attending list
		inklingMembersAttendingListStore.load();
	},
	
	/* Updates the inkling members awaiting reply list */
	updateInklingMembersAwaitingReplyList: function() {
        // Get the inkling members awaiting reply list's store
        var inklingMembersAwaitingReplyListStore = this.getInklingMembersAwaitingReplyList().getStore();
		
		// Update the inkling members awaiting reply list's store
		inklingMembersAwaitingReplyListStore.setProxy({
			extraParams: {
				inklingId: this.getInklingView().getData()["inklingId"]
			}
		});
		
		// Re-load the inkling members awaiting reply list
		inklingMembersAwaitingReplyListStore.load();
	},
	
	/* Adds the current inkling to the current member's list of inklings */
    joinInkling: function() {
    	// Specify in the database that the current member is joining the current inkling
    	Ext.Ajax.request({
    		async: false,
    		url: inkle.app.baseUrl + "/joinInkling/",
    		params: {
    			inklingId: this.getInklingView().getData()["inklingId"]
    		},
		    success: function(response) {
		    	console.log("Success");
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.errors);
        	}
		});
		
		// Update the displayed top toolbar buttons
		this.getInklingFeedButton().show();
		this.getJoinInklingButton().hide();
    },
    
    /* Updates the inkling view to allow for editing */
    editInkling: function() {
		// Get the HTML for editing the inkling view
    	var html;   	
    	Ext.Ajax.request({
    		async: false,
    		url: inkle.app.baseUrl + "/editInkling/",
    		params: {
    			inklingId: this.getInklingView().getData()["inklingId"]
    		},
		    success: function(response) {
		    	console.log("Success");
		    	html = response.responseText;
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
		
		// Update the HTML for the inkling view
		this.getInklingView().setHtml(html);
		
		// Update the displayed top toolbar buttons
		this.getInklingFeedButton().hide();
		this.getAllInklingsInklingBackButton().hide();
		this.getSaveInklingButton().show();
		this.getCancelEditInklingButton().show();
    },
    
    /* Updates an inkling and returns to the normal HTML for the inkling view */
    saveInkling: function() {   	
    	// Update the current inkling in the database and get the HTML for the inkling view
    	var html;
    	Ext.Ajax.request({
    		async: false,
    		url: inkle.app.baseUrl + "/saveInkling/",
    		params: {
    			inklingId: this.getInklingView().getData()["inklingId"],
    			location: Ext.get("location").getValue(),
    			time: Ext.get("time").getValue(),
    			notes: Ext.get("notes").getValue()
    		},
		    success: function(response) {
		    	console.log("Success");
		    	html = response.responseText;
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.errors);
        	}
		});
		
		// Update the HTML for the inkling view
		this.getInklingView().setHtml(html);
		
		// Update the displayed top toolbar buttons
		this.getInklingFeedButton().show();
		this.getAllInklingsInklingBackButton().show();
		this.getSaveInklingButton().hide();
		this.getCancelEditInklingButton().hide();
    },
    
    /* Returns the normal HTML for the inkling view */
    cancelEditInkling: function() {   	
    	// Get the normal HTML for the inkling view
    	var html;
    	Ext.Ajax.request({
    		async: false,
    		url: inkle.app.baseUrl + "/inkling/",
    		params: {
    			inklingId: this.getInklingView().getData()["inklingId"]
    		},
		    success: function(response) {
		    	console.log("Success");
		    	html = response.responseText;
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.errors);
        	}
		});
		
		// Update the HTML for the inkling view
		this.getInklingView().setHtml(html);
		
		// Update the displayed top toolbar buttons
		this.getInklingFeedButton().show();
		this.getAllInklingsInklingBackButton().show();
		this.getSaveInklingButton().hide();
		this.getCancelEditInklingButton().hide();
    },
    
    showMemberName: function(memberName, target) {
        target = Ext.fly(target);
        var namePanel = Ext.create("Ext.Panel", {
             html: memberName,
             left: 0,
             padding: 10
        }).showBy(target);

        console.log("a");
        // Add a handler to remove the name panel when a touch event occurs in the inkling view
        var removeNamePanel = function() {
            /*Ext.Anim.run(deleteButton, "fade", {
                after: function() {*/
                    console.log("what");
                    namePanel.destroy();
                    console.log("doublewhat");
                /*},
                out: true
            });*/
        };
        console.log("b");

        this.getInklingView().on({
            single: true,
            buffer: 250,
            touchstart: removeNamePanel
        });
        console.log("c");
    },
    
    toggleAddCommentPanelVisibility: function() {
        var addCommentButton;
        var addCommentPanel;
        if (!this.getAllInklingsView().isHidden()) { //If we are on the all inklings tab
            addCommentButton = this.getAllInklingsAddCommentButton();
            addCommentPanel = this.getAllInklingsAddCommentPanel();
        }
        else {
            addCommentButton = this.getMyInklingsAddCommentButton();
            addCommentPanel = this.getMyInklingsAddCommentPanel();
        }
        
		if (addCommentPanel.isHidden()) {
			addCommentPanel.showBy(addCommentButton);
			addCommentButton.removeCls("toolbarButton toolbarButtonPlus");
            addCommentButton.setCls("toolbarButtonPressed toolbarButtonPlusPressed");
		}
		else {
		    addCommentPanel.hide();
		    addCommentButton.removeCls("toolbarButtonPressed toolbarButtonPlusPressed");
		    addCommentButton.setCls("toolbarButton toolbarButtonPlus");
		}
    },
    
    /* Toggles whether the new comment "Post button is enabled or disabled */
    toggleAddCommentPostButton: function() {
        var addCommentPanel;
        if (!this.getAllInklingsView().isHidden()) { //If we are on the all inklings tab
            addCommentPanel = this.getAllInklingsAddCommentPanel()
        }
        else {
            addCommentPanel = this.getMyInklingsAddCommentPanel()
        }
        var addCommentTextField = addCommentPanel.child("#addCommentTextField");
        var addCommentPostButton = addCommentPanel.child("#addCommentPostButton");
        
    	if (addCommentTextField.getValue() == "") {
    		addCommentPostButton.disable();
    	}
    	else {
    		addCommentPostButton.enable();
    	}
    },
    
    /* Adds a new comment to the inkling feed */
    addComment: function() {
        var addCommentPanel;
        var addCommentButton;
        if (!this.getAllInklingsView().isHidden()) { //If we are on the all inklings tab
            addCommentPanel = this.getAllInklingsAddCommentPanel();
            addCommentButton = this.getAllInklingsAddCommentButton();
        }
        else {
            addCommentPanel = this.getMyInklingsAddCommentPanel();
            addCommentButton = this.getMyInklingsAddCommentButton();
        }
        var addCommentTextField = addCommentPanel.child("#addCommentTextField");
        var addCommentPostButton = addCommentPanel.child("#addCommentPostButton");
        
  		// Add the new comment to the inkling feed
    	Ext.Ajax.request({
    		url: inkle.app.baseUrl + "/addFeedComment/",
    		params: {
    			inklingId: this.getInklingFeedView().getData()["inklingId"],
    			text: addCommentTextField.getValue()
    		},
		    success: function(response) {
		    	// Update the inkling feed list
		    	this.updateInklingFeedList();
		    	
		    	// Reset the new comment text field and disable the new comment "Send" button
				addCommentTextField.reset();
				addCommentPostButton.disable();
				addCommentPanel.hide();
				addCommentButton.removeCls("toolbarButtonPressed toolbarButtonPlusPressed");
    		    addCommentButton.setCls("toolbarButton toolbarButtonPlus");
        	},
        	failure: function(response) {
        		console.log(response.resposeText);
        		Ext.Msg.alert("Error", "Unable to post comment.");
        	},
        	scope: this
		});
    }
});
