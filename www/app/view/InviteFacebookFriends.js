Ext.define("inkle.view.InviteFacebookFriends", {
	extend: "Ext.Container",

	xtype: "inviteFacebookFriendsView",

	requires: [
	    "Ext.dataview.List"
	],

	config: {
		layout: "card",
		scrollable: false,

    	items: [
    		//Facebook friends list
    	    {
				xtype: "list",
				id: "inviteFacebookFriendsList",
				loadingText: "Loading facebook friends...",
				emptyText: "<div class='emptyListText'>No facebook friends</div>",
				cls: "membersList",
				grouped: true,
				disableSelection: true,
				indexBar: true,
				itemTpl: [
					"{ html }"
				],
				store: {
					fields: [
						"last_name",
						"user_id",
                        "facebook_id",
                        "relationship",
                        "html"
					],
					proxy: {
						type: "ajax",
						url: inkle.app.baseUrl + "/inviteFacebookFriendsView/",
						actionMethods: {
							read: "POST"
						}
					},
					grouper: {
						groupFn: function(record) {
							return record.get("last_name").substr(0, 1);
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
				delegate: ".inviteFriendButton",
				fn: "onInviteFriendButtonTap"
        	},
        	{
                delegate: "#inviteFacebookFriendsList",
                event: "itemtap",
                fn: "onInviteFacebookFriendsListItemTap"
            },
        ]
    },

    // Event firings
    onInviteFriendButtonTap: function(event) {
    	var tappedId = event.getTarget(".inviteFriendButton").getAttribute("memberId");
        this.fireEvent("inviteFriendButtonTapped", tappedId);
    },
    
    onInviteFacebookFriendsListItemTap: function(requestsList, index, target, record, event, options) {
        this.fireEvent("inviteFacebookFriendsViewListItemTapped", record.getData());
    },
});
