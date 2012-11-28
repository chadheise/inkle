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
                ui: "customToolbar",
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
    		
    		// My inklings list
    		{
    			xtype: "list",
				id: "myInklingsList",
				loadingText: "Loading inklings...",
				emptyText: "<div class='emptyListText'>No inklings</div>",
				disableSelection: true,
				grouped: true,
				itemTpl: [
					"{ html }"
				],
				store: {
					fields: [
						"id",
						"html",
						"group",
						"groupIndex"
					],
					proxy: {
						type: "ajax",
						actionMethods: {
							read: "POST"
						},
						url: "http://127.0.0.1:8000/sencha/myInklings/"
					},
					grouper: {
					    sortProperty: "groupIndex",
                        groupFn: function(record) {
                            return record.get("group");
                        }
                    },
					autoLoad: true
				},				
                plugins: [
                    {
                        xclass: "Ext.plugin.PullRefresh",
                        refreshFn: function(plugin) {
                            plugin.up().fireEvent("pullToRefresh");
                        }
                    }
                ]
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
					},
					{
						event: "tap",
						element: "element",
						delegate: ".hideInvitationButton",
						fn: "onHideInvitationButtonTap"
					},
					{
                        event: "tap",
                        element: "element",
                        delegate: ".inklingInvitation",
                        fn: "onInklingInvitationTap"
                    }
				],
				
				onAcceptInvitationButtonTap: function(event, target) {
					var tappedInvitationId = target.getAttribute("invitationId");
					this.fireEvent("invitationButtonTapped", tappedInvitationId, "accepted");
				},
				
				onIgnoreInvitationButtonTap: function(event, target) {
					var tappedInvitationId = target.getAttribute("invitationId");
					this.fireEvent("invitationButtonTapped", tappedInvitationId, "ignored");
				},
				
				onHideInvitationButtonTap: function(event, target) {
					var tappedInvitationId = target.getAttribute("invitationId");
					this.fireEvent("invitationButtonTapped", tappedInvitationId, "hidden");
				},
				
				onInklingInvitationTap: function(event, target) {
                    if (!event.getTarget("input")) {
                        var tappedInklingId = event.getTarget(".inklingInvitation").getAttribute("inklingId");
                        this.fireEvent("inklingInvitationTapped", tappedInklingId, "invitations");
                    }
                },
			}
    	],
    	
    	listeners: [
    	    {
        	    delegate: "#myInklingsList",
        	    event: "pullToRefresh",
        	    fn: "onMyInklingsListRefresh"
        	},
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
	onMyInklingsListRefresh: function() {
        this.fireEvent("myInklingsListRefreshed");
    },
	
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
        
        this.fireEvent("inklingTapped", tappedInklingId, "myInklings");
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