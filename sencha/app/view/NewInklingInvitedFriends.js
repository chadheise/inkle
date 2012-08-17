Ext.define("inkle.view.NewInklingInvitedFriends", {
	extend: "Ext.Container",
	
	xtype: "newInklingInvitedFriendsView",
	
	config: {
		layout: "fit",
		scrollable: false,
		
    	items: [
    		{
    			xtype: "list",
				id: "newInklingInvitedFriendsList",
				flex: 1,
				loadingText: "Loading friends...",
				emptyText: "<div class='emptyListText'>No friends to invite</div>",
				grouped: true,
				disableSelection: true,
				indexBar: true,
				itemTpl: "{ html }",
				store: {
					fields: [
						"id",
						"lastName",
						"html"
					],
					proxy: {
						type: "ajax",
						url: "http://127.0.0.1:8000/sencha/inklingInvitedFriends/",
						actionMethods: {
							read: "POST"
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
					autoLoad: false
				}
    		},
        	
        	// Groups list
        	{
        		xtype: "panel",
        		id: "newInklingInvitedGroupsPanel",
        		hidden: true,
        		width: 250,
        		height: 300,
        		layout: "fit",
        		items: [
        			{
						xtype: "list",
						id: "newInklingInvitedGroupsList",
						loadingText: "Loading groups...",
						emptyText: "<div class='emptyListText'>No groups to invite</div>",
						disableSelection: true,
						itemTpl: "{ html }",
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
								url: "http://127.0.0.1:8000/sencha/inklingInvitedGroups/",
								reader: {
									type: "json",
									rootProperty: "groups"
								}
							},
							autoLoad: false
						}
					}
				],
				
				listeners: [
					{
						event: "tap",
						element: "element",
						delegate: ".group .selectionButton",
						fn: "onGroupSelectionButtonTap"
					},
				],
				
				// Event firings
				onGroupSelectionButtonTap: function(event) {
					var groupId = event.getTarget(".selectionButton").getAttribute("groupId");
					this.fireEvent("groupSelectionButtonTapped", groupId, "Group");
				}
        	}
    	],
    	
		listeners: [
        	{
				event: "tap",
				element: "element",
				delegate: ".member .selectionButton",
				fn: "onMemberSelectionItemTap"
        	}
        ]
    },
    
    // Event firings
    onMemberSelectionItemTap: function(event) {
    	var memberId = event.getTarget(".selectionButton").getAttribute("memberId");
    	this.fireEvent("memberSelectionButtonTapped", memberId, "Member");
    }
});