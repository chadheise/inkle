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
						url: "http://127.0.0.1:8000/sencha/inviteFacebookFriendsView/",
						actionMethods: {
							read: "POST"
						}
					},
					grouper: {
						groupFn: function(record) {
							return record.get("lastName").substr(0, 1);
						}
					},
					autoLoad: false
				}
			}
    	],
    	
    	listeners: [
    		{
            	delegate: "#inviteFacebookFriendsBackButton",
            	event: "tap",
            	fn: "onInviteFacebookFriendsBackButtonTapped"
        	},
        ]
    },
    
    // Event firings
	onInviteFacebookFriendsBackButtonTapped: function() {
        //this.fireEvent("addFriendsDoneButtonTapped");
        alert("Invite Facebook Friends Back");
    },
    
});