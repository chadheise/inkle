Ext.define("inkle.view.AllFriendsInvitees", {
	extend: "Ext.Container",
	
	xtype: "allFriendsInviteesView",
	
	config: {
		layout: "vbox",
		scrollable: false,
		    	
    	items: [
    		{
    			xtype: "list",
				id: "allFriendsInviteesList",
				flex: 1,
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
						url: "http://127.0.0.1:8000/sencha/friendInvitees/",
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
    		}
    	],
    	
    	listeners: [
        	{
				event: "tap",
				element: "element",
				delegate: ".selectionItem",
				fn: "onSelectionItemTap"
        	}
        ]
    },
    
    // Event firings
    onSelectionItemTap: function(event) {
    	var memberId = event.getTarget(".selectionItem").getAttribute("memberId");
    	this.fireEvent("memberSelectionItemTapped", memberId);
    }
});