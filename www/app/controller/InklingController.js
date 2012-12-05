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
            
            // Elements
            allInklingsDateButton: "#allInklingsDateButton",
            allInklingsGroupsButton: "#allInklingsGroupsButton",
            allInklingsInklingBackButton: "#allInklingsInklingBackButton",
            myInklingsInklingBackButton: "#myInklingsInklingBackButton",
            inklingInvitationsButton: "#inklingInvitationsButton",
            inklingFeedBackButton: "#inklingFeedBackButton",
            inklingFeedButton: "#inklingFeedButton",
            joinInklingButton: "#joinInklingButton",
            saveInklingButton: "#saveInklingButton",
            cancelEditInklingButton: "#cancelEditInklingButton",
            addCommentTextField: "#addCommentTextField",
            addCommentSendButton: "#addCommentSendButton",
            newInklingButton: "#newInklingButton",
            
            addCommentButton: "#addCommentButton",
            
            addCommentPanel: "#addCommentPanel",
            
            
            inklingMembersAttendingList: "#inklingMembersAttendingList",
            inklingMembersAwaitingReplyList: "#inklingMembersAwaitingReplyList"
        },
        
        control: {
            allInklingsView: {
            	// View transitions
            	inklingFeedButtonTapped: "activateInklingFeedView",
            	allInklingsInklingBackButtonTapped: "activateAllInklingsView",

            	inklingFeedBackButtonTapped: "backToInklingView",
            	
            	// Commands
            	joinInklingButtonTapped: "joinInkling",
            	saveInklingButtonTapped: "saveInkling",
            	cancelEditInklingButtonTapped: "cancelEditInkling",
            	addCommentButtonTapped: "toggleAddCommentPanelVisibility",
            },
            myInklingsView: {
            	// View transitions
            	myInklingsInklingBackButtonTapped: "activateMyInklingsView"
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
		// Display the appropriate top toolbar buttons
		this.getAllInklingsDateButton().hide();
		this.getAllInklingsGroupsButton().hide();
		this.getAllInklingsInklingBackButton().hide();
		this.getInklingFeedBackButton().show();
		this.getInklingFeedButton().hide();
		this.getAddCommentButton().show();
		
		// Push the inkling feed view onto the all inklings view
    	this.getAllInklingsView().push({
        	xtype: "inklingFeedView",
        	data: {
        		inklingId: this.getInklingView().getData()["inklingId"]
        	}
        });
        
        // Update the inkling feed list
        this.updateInklingFeedList();
	},
    
    /* Activates the all inklings view from the inkling view */
	activateAllInklingsView: function() {
		// Display the appropriate top toolbar buttons
    	this.getAllInklingsDateButton().show();
		this.getAllInklingsGroupsButton().show();
		this.getAllInklingsInklingBackButton().hide();
		this.getInklingFeedButton().hide();
		this.getJoinInklingButton().hide();
    	
    	// Pop the inkling view off of the all inklings view
        this.getAllInklingsView().pop();
    },
    
    /* Activates the my inklings view from the inkling view */
	activateMyInklingsView: function() {
		// Display the appropriate top toolbar buttons
		this.getNewInklingButton().show();
		this.getInklingInvitationsButton().show();
    	this.getMyInklingsInklingBackButton().hide();
		this.getInklingFeedButton().hide();
		this.getJoinInklingButton().hide();
    	
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
		// Display the appropriate top toolbar buttons
    	this.getAllInklingsDateButton().hide();
		this.getAllInklingsGroupsButton().hide();
		this.getAllInklingsInklingBackButton().show();
		this.getInklingFeedBackButton().hide();
		this.getInklingFeedButton().show();
		this.getAddCommentButton().hide();
    	
    	// Pop the inkling feed view off of the all inklings view
        this.getAllInklingsView().pop();
        
        this.getAddCommentPanel().destroy();
    },
	
	activateInklingMembersAttendingView: function() {
	    // Display the appropriate top toolbar buttons
		this.getAllInklingsDateButton().hide();
		this.getAllInklingsGroupsButton().hide();
		this.getAllInklingsInklingBackButton().hide();
		this.getInklingFeedBackButton().show();
		this.getInklingFeedButton().hide();
		
		// Push the inkling members attending view onto the inkling view
    	this.getAllInklingsView().push({
        	xtype: "inklingMembersAttending"
        });
        
        // Update the inkling members attending list
        this.updateInklingMembersAttendingList();
	},
	
	activateInklingMembersAwaitingReplyView: function() {
	    // Display the appropriate top toolbar buttons
		this.getAllInklingsDateButton().hide();
		this.getAllInklingsGroupsButton().hide();
		this.getAllInklingsInklingBackButton().hide();
		this.getInklingFeedBackButton().show();
		this.getInklingFeedButton().hide();

		// Push the inkling members attending view onto the inkling view
    	this.getAllInklingsView().push({
        	xtype: "inklingMembersAwaitingReply"
        });

        // Update the inkling members awaiting reply list
        this.updateInklingMembersAwaitingRelpyList();
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
    		url: "http://127.0.0.1:8000/sencha/joinInkling/",
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
    		url: "http://127.0.0.1:8000/sencha/editInkling/",
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
    		url: "http://127.0.0.1:8000/sencha/saveInkling/",
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
    		url: "http://127.0.0.1:8000/sencha/inkling/",
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
        var panel = Ext.create("Ext.Panel", {
             html: memberName,
             left: 0,
             padding: 10
        }).showBy(target);
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
    		url: "http://127.0.0.1:8000/sencha/addFeedComment/",
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