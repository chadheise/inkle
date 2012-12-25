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
                		iconMask: true,
                		iconCls: "minusFriendIcon",
                		padding: 5
                	},
                	{
                		xtype: "button",
                		itemId: "friendsViewEditGroupsButton",
                		ui: "action",
                        iconMask: true,
                        iconCls: "editIcon",
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
                    /*{
                        xtype: "button",
                        id: "testButton",
                        cls: "buttonTest",
                        pressedCls: "buttonTest",
                        margin: 0,
                    	height: 40,
                    	width: 40,
                    },*/
                    {
                		xtype: "button",
                		ui: "action",
                		iconMask: true,
                		iconCls: "plusFriendIcon",
                		//cls: "buttonTest",
                		itemId: "friendsViewAddFriendsButton",
                		padding: 5,
                	},
                	{
                		xtype: "button",
                		itemId: "friendsViewCreateGroupButton",
                		ui: "action",
                		iconMask: true,
                		iconCls: "plusIcon",
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
                        cls: "memberList",
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
        						url: "http://127.0.0.1:8000/sencha/friends/",
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
                        cls: "groupListMainContent",
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
        						url: "http://127.0.0.1:8000/sencha/groupsMainContent/"
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
        						url: "http://127.0.0.1:8000/sencha/friendRequests/",
        	
        						reader: {
        							type: "json",
        							rootProperty: "friendRequests"
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
                delegate: "#friendsViewGroupsList",
                event: "itemswipe",
                fn: "onFriendsViewGroupsListItemSwipe"
            },
        	{
				event: "tap",
				element: "element",
				delegate: ".deleteLock",
				fn: "onDeleteLockTap"
        	},
            {
                event: "tap",
                element: "element",
                delegate: "#friendsViewFriendsList .deleteButton",
                fn: "onFriendDeleteButtonTap"
            },
        	{
				event: "tap",
				element: "element",
				delegate: "#friendsViewGroupsList .deleteButton",
				fn: "onGroupDeleteButtonTap"
        	},
        	{
				event: "blur",
				element: "element",
				delegate: ".groupNameInput",
				fn: "onGroupNameInputBlurred"
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
    
    onFriendsViewGroupsListItemSwipe: function(groupsList, index, target, record, event, options) {
        console.log("in");
        if (event.direction == "left") {
            console.log("left_in");
            var del = Ext.create("Ext.Button", {
                ui: "decline",
                text: "Delete",
                style: "position:absolute;right:0.125in;",
                handler: function() {
                    record.stores[0].remove(record);
                    record.stores[0].sync();
                }
            });

            var removeDeleteButton = function() {
                Ext.Anim.run(del, "fade", {
                    after: function() {
                        del.destroy();
                    },
                    out: true
                });
            };
            del.renderTo(Ext.DomQuery.selectNode(".deleteplaceholder", target.dom));
            groupsList.on({
                single: true,
                buffer: 250,
                itemtouchstart: removeDeleteButton
            });
            groupsList.element.on({
                single: true,
                buffer: 250,
                touchstart: removeDeleteButton
            });
            console.log("left_out")
        }
        console.log("out");
    },

    onDeleteLockTap: function(event, target) {
        this.fireEvent("deleteLockTapped", Ext.fly(target));
    },
    
    onFriendDeleteButtonTap: function(event, target) {
		this.fireEvent("friendDeleteButtonTapped", Ext.fly(target));
    },

    onGroupDeleteButtonTap: function(event, target) {
        this.fireEvent("groupDeleteButtonTapped", Ext.fly(target));
    },
    
    onFriendsViewGroupsListItemTap: function(groupsList, index, target, record, event, options) {
    	if ((!event.getTarget(".deleteLock")) && (!event.getTarget(".deleteButton"))) {
    		var groupId = record.internalId;
    		this.fireEvent("friendsViewGroupsListItemTapped", groupId);
    	}
    },
    
    onGroupNameInputBlurred: function(event, target) {
    	var groupId = Ext.fly(target).parent(".group").getAttribute("data-groupId");
    	this.fireEvent("groupNameInputBlurred", groupId);
    },
    
    onAcceptRequestButtonTap: function(event) {
		var memberId = event.getTarget(".acceptRequestButton").getAttribute("memberId");
        this.fireEvent("acceptRequestButtonTapped", memberId, "accept");
    },
    
    onIgnoreRequestButtonTap: function(event) {
		var memberId = event.getTarget(".ignoreRequestButton").getAttribute("memberId");
        this.fireEvent("ignoreRequestButtonTapped", memberId, "ignore");
    }
});