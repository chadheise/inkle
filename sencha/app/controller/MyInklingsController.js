Ext.define("inkle.controller.MyInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
            myInklingsView: "myInklingsView",
            newInklingView: "newInklingView",
            
            myInklingsViewToolbar: "#myInklingsViewToolbar",
            
            blotInviteesList: "#blotInviteesList",
        	allFriendsInviteesList: "#allFriendsInviteesList",
        
            // Toolbar buttons
            newInklingButton: "#newInklingButton",
            myInklingsInklingBackButton: "#myInklingsInklingBackButton",
            inklingFeedBackButton: "#inklingFeedBackButton",
            inklingFeedButton: "#inklingFeedButton",
            saveInklingButton: "#saveInklingButton",
            newInklingCancelButton: "#newInklingCancelButton",
            newInklingDoneButton: "#newInklingDoneButton",
            inklingInviteesDoneButton: "#inklingInviteesDoneButton",
            allFriendsInviteesDoneButton: "#allFriendsInviteesDoneButton"
        },
        control: {
            myInklingsView: {
            	inklingTapped: "activateInklingView",
            	newInklingButtonTapped: "activateNewInklingView",
            	newInklingCancelButtonTapped: "activateMyInklingsView",
            	newInklingDoneButtonTapped: "createInkling",
            	inklingInviteesDoneButtonTapped: "activateNewInklingViewPop",
            	allFriendsInviteesDoneButtonTapped: "activateInklingInviteesViewPop"
            },
            
            newInklingView: {
            	inviteesCountContainerTapped: "activateInklingInviteesView"
            },
            
            inklingInviteesView: {
            	allFriendsInviteesItemTapped: "activateAllFriendsInviteesView",
            	blotSelectionItemTapped: "toggleBlotSelectionItem"
            },
            
            allFriendsInviteesView: {
            	memberSelectionItemTapped: "toggleMemberSelectionItem"
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
		this.getNewInklingButton().show();
    	
    	// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("My Inklings");
		
        //this.getBlotsList().getStore().load();
    },
	
	// Activates the inkling view
	activateInklingView: function(inklingId) {
		// Show appropriate buttons
		this.getNewInklingButton().hide();
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
		this.getInklingInviteesDoneButton().hide();
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
			Ext.fly("inviteesCount").setText("1 invitee");	
		}
		else {
			Ext.fly("inviteesCount").setText(numInvitees + " invitees");
		}
		
    	this.getMyInklingsView().pop();
    },
    
    // Activates the inkling invitees view
	activateInklingInviteesView: function() {
		// Show appropriate buttons
		this.getNewInklingCancelButton().hide();
		this.getNewInklingDoneButton().hide();
		this.getInklingInviteesDoneButton().show();
		
		// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("New Inkling Invitees");
		
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
    	this.getNewInklingView().submit({
    		async: false,
			url: "http://127.0.0.1:8000/sencha/updateInkling/",
			method: "POST",
			params: {
				inklingId : this.getNewInklingView().getData()["inklingId"]
			}
		});
		
		this.activateMyInklingsView();
    },
    
    toggleBlotSelectionItem: function(blotId) {
		var selectionItem = Ext.fly("blot" + blotId + "SelectionItem");
		var selectionItemSrc = selectionItem.getAttribute("src");

		if (selectionItemSrc == "resources/images/selected.png") {
			selectionItem.set({
				"src" : "resources/images/deselected.png"
			});

			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/uninviteBlot/",
				params: {
					blotId: blotId,
					inklingId: this.getNewInklingView().getData()["inklingId"]
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
				url: "http://127.0.0.1:8000/sencha/inviteBlot/",
				params: {
					blotId: blotId,
					inklingId: this.getNewInklingView().getData()["inklingId"]
				},
				failure: function(response) {
					console.log(response.responseText);
					Ext.Msg.alert("Error", response.responseText);
	        	}
			});
		}
	},
	
	toggleMemberSelectionItem: function(memberId) {
		var selectionItem = Ext.fly("member" + memberId + "SelectionItem");
		var selectionItemSrc = selectionItem.getAttribute("src");

		if (selectionItemSrc == "resources/images/selected.png") {
			selectionItem.set({
				"src" : "resources/images/deselected.png"
			});
			
			Ext.Ajax.request({
				url: "http://127.0.0.1:8000/sencha/uninviteFriend/",
				params: {
					memberId: memberId,
					inklingId: this.getNewInklingView().getData()["inklingId"]
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
				url: "http://127.0.0.1:8000/sencha/inviteFriend/",
				params: {
					memberId: memberId,
					inklingId: this.getNewInklingView().getData()["inklingId"]
				},
				failure: function(response) {
					console.log(response.responseText);
					Ext.Msg.alert("Error", response.responseText);
	        	}
			});
		}
	}
});