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
            allInklingsAddCommentTextField: "allInklingsView #addCommentTextField",
            allInklingsAddCommentSendButton: "allInklingsView #addCommentSendButton",
            allInklingsAddCommentButton: "allInklingsView #addCommentButton",
            allInklingsAddCommentPanel: "allInklingsView #addCommentPanel",

            // "My Inklings" view toolbar buttons
            myInklingsInklingBackButton: "#myInklingsInklingBackButton",
            myInklingsInklingFeedButton: "myInklingsView #inklingFeedButton",
            myInklingsBackToInklingButton: "myInklingsView #backToInklingButton",
            myInklingsSaveInklingButton: "myInklingsView #saveInklingButton",
            myInklingsCancelEditInklingButton: "myInklingsView #cancelEditInklingButton",
            myInklingsAddCommentTextField: "myInklingsView #addCommentTextField",
            myInklingsAddCommentSendButton: "myInklingsView #addCommentSendButton",
            myInklingsAddCommentButton: "myInklingsView #addCommentButton",
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
            	addCommentButtonTapped: "toggleAddCommentPanelVisibility",
            },
            myInklingsView: {
            	// View transitions
                inklingFeedButtonTapped: "activateInklingFeedView",
            	myInklingsInklingBackButtonTapped: "activateMyInklingsView",
                backToInklingButtonTapped: "backToInklingView"
            },
            inklingView: {
            	// Commands
            	editInklingButtonTapped: "editInkling",
            	memberPictureTapped: "showMemberName",
            	membersAttendingDisclosureArrowTapped: "activateInklingMembersAttendingView",
            	membersAwaitingReplyDisclosureArrowTapped: "activateInklingMembersAwaitingReplyView"
            },
            addCommentPanel: {
            	// Commands
            	addCommentTextFieldKeyedUp: "toggleAddCommentSendButton",
            	addCommentSendButtonTapped: "addComment"
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
            this.getAllInklingsAddCommentButton().hide();
            this.getAllInklingsBackToInklingButton().hide();
            if (this.getInklingView().getData()["isMemberAttending"] === "True") {
                this.getAllInklingsInklingFeedButton().show();
            }
            else {
                this.getAllInklingsJoinInklingButton().show();
            }
            this.getAllInklingsInklingBackButton().show();

            this.getAllInklingsView().pop();
            this.getAllInklingsViewToolbar().setTitle("Inkling");
        }
        else if (!this.getMyInklingsView().isHidden()) {
            // Display the appropriate top toolbar buttons
            this.getMyInklingsAddCommentButton().hide();
            this.getMyInklingsBackToInklingButton().hide();
            this.getMyInklingsInklingFeedButton().show();
            this.getMyInklingsInklingBackButton().show();
            
            this.getMyInklingsView().pop();
            this.getMyInklingsViewToolbar().setTitle("Inkling");
        }
        
        this.getAddCommentPanel().destroy();
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
		inklingFeedListStore.load();
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
        var addCommentPanel = this.getAddCommentPanel();
		if (addCommentPanel.isHidden()) {
			addCommentPanel.showBy(this.getAddCommentButton());
		}
		else {
		    addCommentPanel.hide();
		}
    },
    
    /* Toggles whether the new comment "Send" button is enabled or disabled */
    toggleAddCommentSendButton: function() {
    	if (this.getAddCommentTextField().getValue() == "") {
    		this.getAddCommentSendButton().disable();
    	}
    	else {
    		this.getAddCommentSendButton().enable();
    	}
    },
    
    /* Adds a new comment to the inkling feed */
    addComment: function() {
  		// Add the new comment to the inkling feed
    	Ext.Ajax.request({
    		url: inkle.app.baseUrl + "/addFeedComment/",
    		params: {
    			inklingId: this.getInklingFeedView().getData()["inklingId"],
    			text: this.getAddCommentTextField().getValue()
    		},
		    success: function(response) {
		    	// Update the inkling feed list
		    	this.updateInklingFeedList();
		    	
		    	// Reset the new comment text field and disable the new comment "Send" button
				this.getAddCommentTextField().reset();
				this.getAddCommentSendButton().disable();
				this.getAddCommentPanel().hide();
        	},
        	failure: function(response) {
        		console.log(response.resposeText);
        		Ext.Msg.alert("Error", "Unable to post comment.");
        	},
        	scope: this
		});
    }
});
