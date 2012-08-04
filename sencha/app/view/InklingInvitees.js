Ext.define("inkle.view.InklingInvitees", {
	extend: "Ext.Container",
	
	xtype: "inklingInviteesView",
	
	config: {
		layout: "vbox",
		scrollable: false,
		
		items: [
			{
				xtype: "list",
				id: "blotInviteesList",
				flex: 1,
				loadingText: "Loading blots...",
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
						url: "http://127.0.0.1:8000/sencha/blotInvitees/",
		
						reader: {
							type: "json",
							rootProperty: "blots"
						}
					},
					autoLoad: false
				}
			}
		],
		
    	listeners: [
        	{
        		delegate: "#blotInviteesList",
        		event: "itemsingletap",
        		fn: "onBlotInviteesListItemTap"
        	},
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
    	var blotId = event.getTarget(".selectionItem").getAttribute("blotId");
    	this.fireEvent("blotSelectionItemTapped", blotId);
    },
    
    onBlotInviteesListItemTap: function(blotsList, index, target, record, event, options) {
    	if (index == 0) {
    		this.fireEvent("allFriendsInviteesItemTapped");
    	}
    }
});