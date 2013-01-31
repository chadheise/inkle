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
                		//iconMask: true,
                		//iconCls: "inklingInvitationsIcon"
                		cls: ["toolbarButton", "toolbarButtonEnvelope"],
                		pressedCls: ["toolbarButtonPressed", "toolbarButtonEnvelopePressed"],
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
                		itemId: "backToInklingButton",
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
                        cls: ["toolbarButton", "toolbarButtonPlus"],
                        pressedCls: ["toolbarButtonPressed", "toolbarButtonPlusPressed"],
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
                        cls: ["toolbarButton", "toolbarButtonFeed"],
                        pressedCls: ["toolbarButtonPressed", "toolbarButtonFeedPressed"],
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
                	},
                    {
                        xtype: "button",
                        ui: "action",
                        //iconMask: true,
                        //iconCls: "plusIcon",
                        cls: ["toolbarButton", "toolbarButtonPlus"],
                		pressedCls: ["toolbarButton", "toolbarButtonPlusPressed"],
                        itemId: "addCommentButton",
                        hidden: true
                    }
                ]
    		},
    		
    		// My inklings list
    		{
    			xtype: "list",
				id: "myInklingsList",
                cls: "inklingsList",
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
						url: "http://127.0.0.1:8000/myInklings/"
					},
					grouper: {
					    sortProperty: "groupIndex",
                        groupFn: function(record) {
                            return record.get("group");
                        }
                    },
					autoLoad: false
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
                cls: "inklingInvitationsList",
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
                                "invitationId",
								"inklingId",
								"html"
							],
							proxy: {
                                type: "ajax",
                                url: "http://127.0.0.1:8000/inklingInvitations/",
                                actionMethods: {
                                    read: "POST"
                                }
                            },
							autoLoad: false
						},
                        plugins: [
                            {
                                xclass: "Ext.plugin.PullRefresh",
                                refreshFn: function(plugin) {
                                    plugin.up().fireEvent("pullToRefresh");
                                }
                            }
                        ]
					}
				],
				
				listeners: [
					{
                        delegate: "#inklingInvitationsList",
                        event: "itemtap",
                        fn: "onInklingInvitationItemTap"
                    }
				],
				
                onInklingInvitationItemTap: function(inklingInvitationsList, index, target, record, event, options) {
                    var buttonTarget = Ext.fly(event.getTarget("input[type='button']"));
                    if (!buttonTarget) {
                        var tappedInklingId = record.getData()["inklingId"];
                        this.fireEvent("inklingInvitationTapped", tappedInklingId, /* source = */ "invitations");
                    }
                    else {
                        var tappedInvitationId = record.getData()["invitationId"];
                        if (buttonTarget.hasCls("acceptInklingInvitationButton")) {
                            this.fireEvent("invitationButtonTapped", tappedInvitationId, /* response = */ "accepted");
                        }
                        else if (buttonTarget.hasCls("ignoreInklingInvitationButton")) {
                            this.fireEvent("invitationButtonTapped", tappedInvitationId, /* response = */ "ignored");
                        }
                        else if (buttonTarget.hasCls("hideInklingInvitationButton")) {
                            this.fireEvent("invitationButtonTapped", tappedInvitationId, /* response = */ "hidden");
                        }
                    }
                }
			}
    	],
    	
    	listeners: [
    	    {
        	    delegate: "#myInklingsList",
        	    event: "pullToRefresh",
        	    fn: "onMyInklingsListRefresh"
        	},
            {
                delegate: "#inklingInvitationsList",
                event: "pullToRefresh",
                fn: "onInklingInvitationsListRefresh"
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
                delegate: "#myInklingsList",
                event: "itemtap",
                fn: "onMyInklingsInklingItemTap"
        	},
            {
                delegate: "#backToInklingButton",
                event: "tap",
                fn: "onBackToInklingButtonTap"
            },
            {
                delegate: "#inklingFeedButton",
                event: "tap",
                fn: "onInklingFeedButtonTap"
            }
        ]
	},
	
	// Event firings
	onMyInklingsListRefresh: function() {
        this.fireEvent("myInklingsListRefreshed");
    },

    onInklingInvitationsListRefresh: function() {
        this.fireEvent("inklingInvitationsListRefreshed");
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
    
    onMyInklingsInklingItemTap: function(myInklingsList, index, target, record, event, options) {
        var tappedInklingId = event.getTarget(".inklingListItem").getAttribute("data-inklingId");
        this.fireEvent("inklingTapped", tappedInklingId, /* source = */ "myInklings");
    },
    
    onBackToInklingButtonTap: function() {
        this.fireEvent("backToInklingButtonTapped");
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
    },

    onInklingFeedButtonTap: function() {
        this.fireEvent("inklingFeedButtonTapped");
    }
});
