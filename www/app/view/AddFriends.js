Ext.define("inkle.view.AddFriends", {
	extend: "Ext.Container",
	
	xtype: "addFriendsView",
	
	requires: [
		"Ext.field.Search"
	],
	
	config: {
		layout: "vbox",
		scrollable: false,
		    	
    	items: [
    		// Top toolbar
    		{
    			xtype: "toolbar",
    			id: "addFriendsViewToolbar",
                docked: "top",
                title: "Add Friends",
                items: [
                	{
                		xtype: "button",
                		itemId: "addFriendsDoneButton",
                		ui: "action",
                		text: "Done"
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
    			id: "addFriendsSuggestions",
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
						"html"
					],
					proxy: {
						type: "ajax",
						url: "http://127.0.0.1:8000/peopleSearch/",
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
            	delegate: "#addFriendsDoneButton",
            	event: "tap",
            	fn: "onAddFriendsDoneButtonTapped"
        	},
    		{
            	delegate: "#addFriendsSearchField",
            	event: "keyup",
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
        	}
        ]
    },
    
    // Event firings
	onAddFriendsDoneButtonTapped: function() {
        this.fireEvent("addFriendsDoneButtonTapped");
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
    }
    
});
