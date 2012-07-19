Ext.define("inkle.view.MyInklings", {
	extend: "Ext.navigation.View",
	
	xtype: "myInklingsView",
	
	config: {        
		title: "My Inklings",
		iconCls: "user",
    	
    	navigationBar: false,
    	
    	items: [
    		// Top toolbar
    		{
    			xtype: "toolbar",
    			id: "myInklingsViewToolbar",
                docked: "top",
                title: "My Inklings",
                items: [
                	{
                		xtype: "button",
                		ui: "back",
                		text: "Inkling",
                		itemId: "inklingFeedBackButton",
                		hidden: true
                	},
                	{
                		xtype: "button",
                		ui: "back",
                		text: "My Inklings",
                		itemId: "myInklingsInklingBackButton",
                		hidden: true
                	},
                	{
                		xtype: "button",
                		ui: "action",
                		text: "Cancel",
                		itemId: "newInklingCancelButton",
                		hidden: true
                	},
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "New Inkling",
                        itemId: "newInklingButton"
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Save",
                        itemId: "saveInklingButton",
                        hidden: true
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Feed",
                        itemId: "inklingFeedButton",
                        hidden: true
                    },
                    {
                		xtype: "button",
                		ui: "action",
                		text: "Done",
                		itemId: "newInklingDoneButton",
                		hidden: true
                	},
                ]
    		},
    		
    		// Main content
    		{
    			xtype: "htmlcontainer",
    			scrollable: true,
				url: "http://127.0.0.1:8000/sencha/myInklings/",
    		}        	
    	],
    	
    	listeners: [
			{
            	delegate: "#newInklingButton",
            	event: "tap",
            	fn: "onNewInklingButtonTap"
        	},
        	{
            	delegate: "#myInklingsInklingBackButton",
            	event: "tap",
            	fn: "onMyInklingsInklingBackButtonTap"
        	},
        	{
            	delegate: "#newInklingCancelButton",
            	event: "tap",
            	fn: "onNewInklingCancelButtonTap"
        	},
        	{
            	delegate: "#newInklingDoneButton",
            	event: "tap",
            	fn: "onNewInklingDoneButtonTap"
        	},
        	{
				event: "tap",
				element: "element",
				delegate: ".inkling",
				fn: "onInklingTap"
        	}
        ]
	},
	
	// Event firings
    onNewInklingButtonTap: function () {
        this.fireEvent("newInklingButtonTapped");
    },
    
    onMyInklingsInklingBackButtonTap: function() {
        this.fireEvent("myInklingsInklingBackButtonTapped");
    },
    
    onInklingTap: function (event, target) {
        var tappedInklingId = event.getTarget(".inkling").getAttribute("inklingId");
        
        this.fireEvent("inklingTapped", tappedInklingId);
    },
    
    onNewInklingCancelButtonTap: function() {
        this.fireEvent("newInklingCancelButtonTapped");
    },
    
    onNewInklingDoneButtonTap: function() {
        this.fireEvent("newInklingDoneButtonTapped");
    }
});