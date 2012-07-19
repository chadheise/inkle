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
                    }
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
				event: "tap",
				element: "element",
				delegate: ".inkling",
				fn: "onInklingTap"
        	}
        ]
	},
	
	// Event firings
    onNewInklingButtonTap: function () {
        console.log("newInklingButtonTapped");
        this.fireEvent("newInklingButtonTapped");
    },
    
    onMyInklingsInklingBackButtonTap: function() {
        this.fireEvent("myInklingsInklingBackButtonTapped");
    },
    
    onInklingTap: function (event, target) {
		console.log("inklingTapped");
        
        var tappedInklingId = event.getTarget(".inkling").getAttribute("inklingId");
        
        this.fireEvent("inklingTapped", tappedInklingId);
    }
});