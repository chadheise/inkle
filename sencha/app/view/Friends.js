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
		iconCls: "friends",
    	
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
                		itemId: "friendsViewRemoveFriendsButton",
                		ui: "action",
                		iconMask: true,
                		iconCls: "removeFriend"
                	},
                	{
                		xtype: "button",
                		itemId: "friendsViewEditBlotsButton",
                		ui: "action",
                		text: "Edit",
                		hidden: true
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
								width: 80,
								pressed: true
							},
							{
								text: "Blots",
								id: "friendsViewBlotsButton",
								width: 80
							},
							{
								text: "Requests",
								id: "friendsViewRequestsButton",
								width: 80
							}
						]
                    },
                    { xtype: "spacer" },
                    {
                		xtype: "button",
                		ui: "action",
                		iconMask: true,
                		iconCls: "addFriend",
                		itemId: "friendsViewAddFriendsButton"
                	},
                	{
                		xtype: "button",
                		itemId: "friendsViewCreateBlotButton",
                		ui: "action",
                		text: "+",
                		hidden: true
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
								},
        						
        						reader: {
        							type: "json",
        							rootProperty: "friends"
        						}
        					},
        					grouper: {
								groupFn: function(record) {
									return record.get("lastName").substr(0, 1);
								}
							},
        					autoLoad: true
        				}
					},
					
					// Blots list
					{
						xtype: "list",
						id: "friendsViewBlotsList",
						loadingText: "Loading blots...",
						emptyText: "<div class='emptyListText'>No blots</div>",
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
        						method: "POST",
        						actionMethods: {
        							read: "POST"
        						},
        						url: "http://127.0.0.1:8000/sencha/blots/",
        						extraParams: {
                    				includeAllBlotsBlot: "false",
                    				inviteesMode: "false"
								},
        	
        						reader: {
        							type: "json",
        							rootProperty: "blots"
        						}
        					},
        					autoLoad: true
        				}
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
        						method: "POST",
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
        				}
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
            	delegate: "#friendsViewEditBlotsButton",
            	event: "tap",
            	fn: "onFriendsViewEditBlotsButtonTap"
        	},
        	{
            	delegate: "#friendsViewCreateBlotButton",
            	event: "tap",
            	fn: "onFriendsViewCreateBlotButtonTap"
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
				delegate: ".deleteButton",
				fn: "onDeleteButtonTap"
        	},
        	{
				event: "blur",
				element: "element",
				delegate: ".blotNameInput",
				fn: "onBlotNameInputBlurred"
        	},
        	{
            	delegate: "#friendsViewBlotsList",
            	event: "itemtap",
            	fn: "onFriendsViewBlotsListItemTap"
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
		this.fireEvent("friendsViewRemoveFriendsButtonTapped", "friendsViewFriendsList", "removeFriend");
    },
    
    onFriendsViewAddFriendsButtonTap: function() {
		this.fireEvent("friendsViewAddFriendsButtonTapped");
    },
    
    onFriendsViewEditBlotsButtonTap: function() {
		this.fireEvent("friendsViewEditBlotsButtonTapped", "friendsViewBlotsList", "Edit");
    },
    
    onFriendsViewCreateBlotButtonTap: function() {
		this.fireEvent("friendsViewCreateBlotButtonTapped");
    },
    
    onDeleteLockTap: function(event) {
		var tappedId = event.getTarget(".deleteLock").getAttribute("blotId");
        if (tappedId) {
        	tappedId = "blot" + tappedId;
        }
        else {
        	tappedId = event.getTarget(".deleteLock").getAttribute("memberId");
        	tappedId = "member" + tappedId;
        }
        this.fireEvent("deleteLockTapped", tappedId);
    },
    
    onDeleteButtonTap: function(event) {
		var tappedId = event.getTarget(".deleteButton").getAttribute("blotId");
		var idType = "blot";
		if (tappedId == null) {
        	tappedId = event.getTarget(".deleteButton").getAttribute("memberId");
        	idType = "member"
        }
        this.fireEvent("deleteButtonTapped", tappedId, idType);
    },
    
    onFriendsViewBlotsListItemTap: function(blotsList, index, target, record, event, options) {
    	if ((!event.getTarget(".deleteLock")) && (!event.getTarget(".deleteButton"))) {
    		var blotId = record.internalId;
    		this.fireEvent("friendsViewBlotsListItemTapped", blotId);
    	}
    },
    
    onBlotNameInputBlurred: function(event) {
    	var blotId = event.getTarget(".blotNameInput").getAttribute("blotId");
    	this.fireEvent("blotNameInputBlurred", blotId);
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