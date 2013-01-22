Ext.define("inkle.view.Friends", {
	extend: "Ext.navigation.View",
	
	xtype: "friendsView",
	
    requires: [
    	"Ext.SegmentedButton",
    	"Ext.dataview.List"
    ],
	
	config: {
	    // Tab information
		title: "Friends",
		iconCls: "friendsIcon",
    	
    	// Layout information
    	navigationBar: false,
    	
    	items: [
    		// Top toolbar
    		{
    			xtype: "toolbar",
    			id: "friendsViewToolbar",
                docked: "top",
                items: [
                	{
                		xtype: "button",
                		id: "friendsViewRemoveFriendsButton",
                		ui: "action",
                		//iconMask: true,
                		//iconCls: "minusFriendIcon",
                		cls: ["toolbarButton", "toolbarButtonMinusFriend"],
                		pressedCls: ["toolbarButtonPressed", "toolbarButtonMinusFriendPressed"],
                		padding: 5
                	},
                	{
                		xtype: "button",
                		itemId: "friendsViewEditGroupsButton",
                		ui: "action",
                        //iconMask: true,
                        //iconCls: "editIcon",
                        cls: ["toolbarButton", "toolbarButtonGear"],
                		pressedCls: ["toolbarButtonPressed", "toolbarButtonGearPressed"],
                		hidden: true,
                		padding: 5
                	},
                	{ xtype: "spacer" },
                    {
                    	xtype: "segmentedbutton",
                    	id: "friendsViewSegmentedButton",
                    	allowDepress: false,
                    	allowMultiple: false,
                    	centered: true,
                    	items: [
                    		{
								text: "Friends",
								id: "friendsViewFriendsButton",
								width: 70,
								pressed: true,
								padding: 0
							},
							{
								text: "Groups",
								id: "friendsViewGroupsButton",
								width: 70,
								padding: 0
							},
							{
								text: "Requests",
								id: "friendsViewRequestsButton",
								width: 70,
								padding: 0
							}
						]
                    },
                    { xtype: "spacer" },
                    {
                		xtype: "button",
                		ui: "action",
                		//iconMask: true,
                		//iconCls: "plusFriendIcon",
                		cls: ["toolbarButton", "toolbarButtonPlusFriend"],
                		pressedCls: ["toolbarButtonPressed", "toolbarButtonPlusFriendPressed"],
                		itemId: "friendsViewAddFriendsButton",
                		padding: 5,
                	},
                	{
                		xtype: "button",
                		itemId: "friendsViewCreateGroupButton",
                		ui: "action",
                		//iconMask: true,
                		//iconCls: "plusIcon",
                		cls: ["toolbarButton", "toolbarButtonPlus"],
                		pressedCls: ["toolbarButtonPressed", "toolbarButtonPlusPressed"],
                		hidden: true,
                		padding: 5
                	}
                ]
    		},
    		
    		// Main content
    		{
    			xtype: "container",
    			itemId: "friendsViewContainer",
    			layout: "card",
    			items: [
    				// Friends list
					{
						xtype: "list",
						id: "friendsViewFriendsList",
                        cls: "membersList",
						loadingText: "Loading friends...",
						emptyText: "<div class='emptyListText'>No friends</div>",
						grouped: true,
						disableSelection: true,
						indexBar: true,
						itemTpl: [
							"{ html }"
						],
						store: {
        					fields: [
        						"id",
        						"lastName",
        						"html"
        					],
        					proxy: {
        						type: "ajax",
        						url: "http://127.0.0.1:8000/friends/",
        						actionMethods: {
        							read: "POST"
        						},
								extraParams: {
									mode: "friends"
								}
        					},
        					grouper: {
								groupFn: function(record) {
									return record.get("lastName").substr(0, 1);
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
					
					// Groups list
					{
						xtype: "list",
						id: "friendsViewGroupsList",
                        cls: "groupsListMainContent",
						loadingText: "Loading groups...",
						emptyText: "<div class='emptyListText'>No groups</div>",
						disableSelection: true,
						itemTpl: [
							"{ html }"
						],
						store: {
        					fields: [
        						"id",
        						"html"
        					],
        					proxy: {
        						type: "ajax",
        						actionMethods: {
        							read: "POST"
        						},
        						url: "http://127.0.0.1:8000/groupsMainContent/"
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
					
					// Friend requests list
					{
						xtype: "list",
						id: "friendsViewRequestsList",
                        cls: "membersList membersListWithButtons",
						loadingText: "Loading friend requests...",
						emptyText: "<div class='emptyListText'>No friend requests</div>",
						disableSelection: true,
						itemTpl: [
							"{ html }"
						],
						store: {
        					fields: [
        						"id",
        						"html"
        					],
        					proxy: {
        						type: "ajax",
        						actionMethods: {
        							read: "POST"
        						},
        						url: "http://127.0.0.1:8000/friendRequests/"
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
					}
				]
    		}
    	],
    	
    	listeners: [
    		{
    			delegate: "#friendsViewSegmentedButton",
    			event: "toggle",
    			fn: "onFriendsViewSegmentedButtonToggle"
    		},
        	{
            	delegate: "#friendsViewRemoveFriendsButton",
            	event: "tap",
            	fn: "onFriendsViewRemoveFriendsButtonTap"
        	},
        	{
            	delegate: "#friendsViewAddFriendsButton",
            	event: "tap",
            	fn: "onFriendsViewAddFriendsButtonTap"
        	},
        	{
            	delegate: "#friendsViewEditGroupsButton",
            	event: "tap",
            	fn: "onFriendsViewEditGroupsButtonTap"
        	},
        	{
            	delegate: "#friendsViewCreateGroupButton",
            	event: "tap",
            	fn: "onFriendsViewCreateGroupButtonTap"
        	},
        	{
        	    delegate: "#friendsViewFriendsList",
        	    event: "pullToRefresh",
        	    fn: "onFriendsViewFriendsListRefresh"
        	},
        	{
        	    delegate: "#friendsViewGroupsList",
        	    event: "pullToRefresh",
        	    fn: "onFriendsViewGroupsListRefresh"
        	},
        	{
        	    delegate: "#friendsViewRequestsList",
        	    event: "pullToRefresh",
        	    fn: "onFriendsViewRequestsListRefresh"
        	},
        	{
				event: "blur",
				element: "element",
				delegate: ".groupNameInput",
				fn: "onGroupNameInputBlurred"
        	},
            {
                delegate: "#friendsViewFriendsList",
                event: "itemtap",
                fn: "onFriendsViewFriendsListItemTap"
            },
        	{
            	delegate: "#friendsViewGroupsList",
            	event: "itemtap",
            	fn: "onFriendsViewGroupsListItemTap"
        	},
        	{
				event: "tap",
				element: "element",
				delegate: ".acceptRequestButton",
				fn: "onAcceptRequestButtonTap"
        	},
        	{
				event: "tap",
				element: "element",
				delegate: ".ignoreRequestButton",
				fn: "onIgnoreRequestButtonTap"
        	}
        ]
	},
	
	// Event firings
	onFriendsViewSegmentedButtonToggle: function(segmentedButton, button, isPressed, options) {
		var tappedId = segmentedButton.getItems().indexOf(button);
		this.fireEvent("friendsViewSegmentedButtonToggled", tappedId);
	},
    
    onFriendsViewRemoveFriendsButtonTap: function() {
		this.fireEvent("friendsViewRemoveFriendsButtonTapped", "friendsViewFriendsList", "minusFriendIcon");
    },
    
    onFriendsViewAddFriendsButtonTap: function() {
		this.fireEvent("friendsViewAddFriendsButtonTapped");
    },
    
    onFriendsViewEditGroupsButtonTap: function() {
		this.fireEvent("friendsViewEditGroupsButtonTapped", "friendsViewGroupsList", "Edit");
    },
    
    onFriendsViewCreateGroupButtonTap: function() {
		this.fireEvent("friendsViewCreateGroupButtonTapped");
    },
    
    onFriendsViewFriendsListRefresh: function() {
        this.fireEvent("friendsViewFriendsListRefreshed");
    },
    
    onFriendsViewGroupsListRefresh: function() {
        this.fireEvent("friendsViewGroupsListRefreshed");
    },
    
    onFriendsViewRequestsListRefresh: function() {
        this.fireEvent("friendsViewRequestsListRefreshed");
    },
    
    onFriendsViewFriendsListItemTap: function(friendsList, index, target, record, event, options) {
        var deleteLock = Ext.fly(event.getTarget(".deleteLock"));
        if (deleteLock) {
            this.fireEvent("deleteLockTapped", friendsList, target, deleteLock, record);
        }
        else {
            this.fireEvent("friendsViewGroupsListItemTapped", record.getData()["id"]);
        }
    },

    onFriendsViewGroupsListItemTap: function(groupsList, index, target, record, event, options) {
        var deleteLock = Ext.fly(event.getTarget(".deleteLock"));
    	if (deleteLock) {
            this.fireEvent("deleteLockTapped", groupsList, target, deleteLock, record);
        }
        else {
    		this.fireEvent("friendsViewGroupsListItemTapped", record.getData()["id"]);
    	}
    },
    
    onGroupNameInputBlurred: function(event, target) {
    	var groupId = Ext.fly(target).parent(".group").getAttribute("data-groupId");
    	this.fireEvent("groupNameInputBlurred", groupId);
    },
    
    onAcceptRequestButtonTap: function(event, target) {
		var memberId = Ext.fly(target).parent(".member").getAttribute("data-memberId");
        this.fireEvent("acceptRequestButtonTapped", memberId, "accept");
    },
    
    onIgnoreRequestButtonTap: function(event, target) {
		var memberId = Ext.fly(target).parent(".member").getAttribute("data-memberId");
        this.fireEvent("ignoreRequestButtonTapped", memberId, "ignore");
    }
});
