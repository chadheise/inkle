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
                        ui: "action",
                        text: "Invites",
                        itemId: "inklingInvitesButton",
                        hidden: true,
                    },
                    {
                		xtype: "button",
                		ui: "back",
                		text: "My Inklings",
                		itemId: "inviteResponseBackButton",
                		hidden: true
                	},
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
                	{
                		xtype: "button",
                		ui: "action",
                		text: "Done",
                		itemId: "inklingInviteesDoneButton",
                		hidden: true
                	},
                	{
                		xtype: "button",
                		ui: "action",
                		text: "Done",
                		itemId: "allFriendsInviteesDoneButton",
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
    			delegate: "#inklingInvitesButton",
            	event: "tap",
            	fn: "onInklingInvitesButtonTap"
    		},
			{
            	delegate: "#newInklingButton",
            	event: "tap",
            	fn: "onNewInklingButtonTap"
        	},
        	{
            	delegate: "#inviteResponseBackButton",
            	event: "tap",
            	fn: "onInviteResponseBackButtonTap"
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
            	delegate: "#inklingInviteesDoneButton",
            	event: "tap",
            	fn: "onInklingInviteesDoneButtonTap"
        	},
        	{
            	delegate: "#allFriendsInviteesDoneButton",
            	event: "tap",
            	fn: "onAllFriendsInviteesDoneButtonTap"
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
	onInklingInvitesButtonTap: function() {
		this.fireEvent("inklingInvitesButtonTapped");
	},
	
    onNewInklingButtonTap: function() {
        this.fireEvent("newInklingButtonTapped");
    },
    
    onInviteResponseBackButtonTap: function() {
    	this.fireEvent("onInviteResponseBackButtonTapped");
    },
    
    onMyInklingsInklingBackButtonTap: function() {
        this.fireEvent("myInklingsInklingBackButtonTapped");
    },
    
    onInklingTap: function(event, target) {
        var tappedInklingId = event.getTarget(".inkling").getAttribute("inklingId");
        
        this.fireEvent("inklingTapped", tappedInklingId);
    },
    
    onNewInklingCancelButtonTap: function() {
        this.fireEvent("newInklingCancelButtonTapped");
    },
    
    onNewInklingDoneButtonTap: function() {
        this.fireEvent("newInklingDoneButtonTapped");
    },
    
    onInklingInviteesDoneButtonTap: function() {
    	this.fireEvent("inklingInviteesDoneButtonTapped");
    },
    
    onAllFriendsInviteesDoneButtonTap: function() {
    	this.fireEvent("allFriendsInviteesDoneButtonTapped");
    }
});