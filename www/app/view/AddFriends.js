Ext.define("inkle.view.AddFriends", {
	extend: "Ext.Container",
	
	xtype: "addFriendsView",
	
	requires: [
		"Ext.field.Search"
	],
	
	config: {
        // Layout information
		layout: "vbox",
		scrollable: false,

        items: [
            // Top toolbar
            {
                xtype: "toolbar",
                id: "addFriendsViewToolbar",
                title: "Add Friends",
                docked: "top",
                items: [
                    {
                        xtype: "button",
                        ui: "action",
                        itemId: "addFriendsViewDoneButton",
                        text: "Done",
                    }
                ]
            },

            // Search bar
            {
                xtype: "searchfield",
                id: "addFriendsSearchField",
                name: "query",
                placeHolder: "Search for new friends",
                height: 20
            },

            // Suggestions list
            {
                xtype: "list",
                id: "addFriendsList",
                cls: "membersList",
                flex: 1,
                loadingText: "Loading suggestions...",
                emptyText: "<p class='emptyListText'>No matches</p>",
                disableSelection: true,
                itemTpl: [
					'{ html }'
				],
				store: {
					fields: [
						"id",
						"facebook_id",
						"relationship",
						"html"
					],
					proxy: {
						type: "rest",
						url: inkle.app.baseUrl + "/peopleSearch/",
						actionMethods: {
							read: "POST"
						},
						extraParams: {
							query: "",
							fbAccessToken: ""
						},
						
						reader: {
							type: "json",
							rootProperty: "people"
						}
					},
					
					autoLoad: true
				}
            }
        ],

        listeners: [
        {
            delegate: "#addFriendsViewDoneButton",
            event: "tap",
            fn: "onAddFriendsViewDoneButtonTapped"
        },
        {
            delegate: "#addFriendsSearchField",
            event: "keyup",
            fn: "onAddFriendsSearchFieldKeyUp"
        },
        {
            delegate: "#addFriendsSearchField",
            event: "change",
            fn: "onAddFriendsSearchFieldKeyUp"
        },
        {
            event: "tap",
            element: "element",
            delegate: ".addFriendButton",
            fn: "onAddFriendButtonTap"
        },
        {
            event: "tap",
            element: "element",
            delegate: ".inviteFriendButton",
            fn: "onInviteFriendButtonTap"
        },
        {
            delegate: "#addFriendsList",
            event: "itemtap",
            fn: "onAddFriendsListItemTap"
        },
        ]
    },
    
    // Event firings
	onAddFriendsViewDoneButtonTapped: function() {
        this.fireEvent("addFriendsViewDoneButtonTapped", /* source = */ "addFriendsView");
    },
	
	onAddFriendsSearchFieldKeyUp: function() {
        this.fireEvent("addFriendsSearchFieldKeyedUp");
    },
    
    onAddFriendButtonTap: function(event) {
        var tappedId = event.getTarget(".addFriendButton").getAttribute("memberId");
        this.fireEvent("addFriendButtonTapped", tappedId);
    },
    
    onInviteFriendButtonTap: function(event) {
        var tappedId = event.getTarget(".inviteFriendButton").getAttribute("memberId");
        this.fireEvent("inviteFriendButtonTapped", tappedId);
    },
    
    onAddFriendsListItemTap: function(requestsList, index, target, record, event, options) {
        this.fireEvent("addFriendsViewListItemTapped", record.getData());
    },
});
