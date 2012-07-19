Ext.define("inkle.controller.MyInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
            myInklingsView: "myInklingsView",
            
            newInklingButton: "#newInklingButton",
            myInklingsInklingBackButton: "#myInklingsInklingBackButton",
            inklingFeedBackButton: "#inklingFeedBackButton",
            inklingFeedButton: "#inklingFeedButton",
            saveInklingButton: "#saveInklingButton"
        },
        control: {
            myInklingsView: {
            	inklingTapped: "activateInklingView"
            }
        }
    },
		
	/* Transitions*/
	// Activates the inkling view
	activateInklingView: function (inklingId) {
    	console.log("Activating inkling view");

		// Show appropriate buttons
		this.getNewInklingButton().hide();
		this.getMyInklingsInklingBackButton().show();
		this.getInklingFeedButton().show();
		
    	var myInklingsView = this.getMyInklingsView();
        myInklingsView.push({
        	xtype: "inklingView",
        	data: {
        		inklingId: inklingId
        	}
        });
    }
});