Ext.define("inkle.view.MyInklings", {
	extend: "Ext.navigation.View",
	
	xtype: "myInklingsView",
	
	config: {        
		title: "My Inklings",
		iconCls: "myInklingsIcon",
    	
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
                        itemId: "inklingInvitationsButton",
                        ui: "action",
                		iconMask: true,
                		iconCls: "inklingInvitationsIcon"
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
                	{
                		xtype: "button",
                		ui: "back",
                		text: "New Inkling",
                		itemId: "newInklingInvitedFriendsBackButton",
                		hidden: true
                	},
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        ui: "action",
                        itemId: "newInklingButton",
                        iconMask: true,
                		iconCls: "plusIcon",
                		padding: 5
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
                	},
                	{
                		xtype: "button",
                		ui: "action",
                		text: "Groups",
                		itemId: "newInklingInvitedGroupsButton",
                		hidden: true
                	}
                ]
    		},
    		
    		// Main content
    		{
    			xtype: "htmlcontainer",
    			scrollable: true,
				url: "http://127.0.0.1:8000/sencha/myInklings/",
    		},
    		
    		// Inkling invitations
        	{
        		xtype: "panel",
        		id: "inklingInvitationsPanel",
        		hidden: true,
        		top: 0,
        		width: 300,
        		height: 275,
        		layout: "fit",
        		items: [
        			{
						xtype: "list",
						id: "inklingInvitationsList",
						loadingText: "Loading invitations...",
						emptyText: "<div class='emptyListText'>No invitations</div>",
						disableSelection: true,
						itemTpl: "{ html }",
						store: {
							fields: [
								"id",
								"html"
							],
							proxy: {
                                type: "ajax",
                                url: "http://127.0.0.1:8000/sencha/inklingInvitations/",
                                actionMethods: {
                                    read: "POST"
                                },
                                reader: {
                                    type: "json",
                                    rootProperty: "inklingInvitations"
                                }
                            },
							autoLoad: true
						}
					}
				],
				
				listeners: [
					{
						event: "tap",
						element: "element",
						delegate: ".acceptInvitationButton",
						fn: "onAcceptInvitationButtonTap"
					},
					{
						event: "tap",
						element: "element",
						delegate: ".ignoreInvitationButton",
						fn: "onIgnoreInvitationButtonTap"
					}
				],
				
				onAcceptInvitationButtonTap: function(event, target) {
					var tappedInvitationId = target.getAttribute("invitationId");
					this.fireEvent("invitationButtonTapped", tappedInvitationId, "accepted");
				},
				
				onIgnoreInvitationButtonTap: function(event, target) {
					var tappedInvitationId = target.getAttribute("invitationId");
					this.fireEvent("invitationButtonTapped", tappedInvitationId, "ignored");
				}
			}
    	],
    	
    	listeners: [
    		{
    			delegate: "#inklingInvitationsButton",
            	event: "tap",
            	fn: "onInklingInvitationsButtonTap"
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
            	delegate: "#newInklingInvitedFriendsBackButton",
            	event: "tap",
            	fn: "onNewInklingInvitedFriendsBackButtonTap"
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
        		delegate: "#newInklingInvitedGroupsButton",
            	event: "tap",
            	fn: "onNewInklingInvitedGroupsButtonTap"
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
	onInklingInvitationsButtonTap: function() {
		this.fireEvent("inklingInvitationsButtonTapped");
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
    
    onNewInklingInvitedFriendsBackButtonTap: function() {
    	this.fireEvent("newInklingInvitedFriendsBackButtonTapped");
    },
    
    onAllFriendsInviteesDoneButtonTap: function() {
    	this.fireEvent("allFriendsInviteesDoneButtonTapped");
    },
    
    onNewInklingInvitedGroupsButtonTap: function() {
    	this.fireEvent("newInklingInvitedGroupsButtonTapped");
    }
});