Ext.define("inkle.controller.MyInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
            myInklingsView: "myInklingsView",
            newInklingView: "newInklingView",
            
            myInklingsViewToolbar: "#myInklingsViewToolbar",
            
            // Toolbar buttons
            newInklingButton: "#newInklingButton",
            myInklingsInklingBackButton: "#myInklingsInklingBackButton",
            inklingFeedBackButton: "#inklingFeedBackButton",
            inklingFeedButton: "#inklingFeedButton",
            saveInklingButton: "#saveInklingButton",
            newInklingCancelButton: "#newInklingCancelButton",
            newInklingDoneButton: "#newInklingDoneButton"
        },
        control: {
            myInklingsView: {
            	inklingTapped: "activateInklingView",
            	newInklingButtonTapped: "activateNewInklingView",
            	newInklingCancelButtonTapped: "activateMyInklingsView",
            	newInklingDoneButtonTapped: "createInkling"
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
	activateNewInklingView: function(inklingId) {
		// Show appropriate buttons
		this.getNewInklingButton().hide();
		this.getNewInklingCancelButton().show();
		this.getNewInklingDoneButton().show();
		
		// Update the toolbar title
		this.getMyInklingsViewToolbar().setTitle("New Inkling");
		
    	this.getMyInklingsView().push({
        	xtype: "newInklingView"
        });
    },
    
    createInkling: function() {
    	this.getNewInklingView().submit({
    		async: false,
			url: "http://127.0.0.1:8000/sencha/createInkling/",
			method: "POST"
		});
		
		this.activateMyInklingsView();
    }
});