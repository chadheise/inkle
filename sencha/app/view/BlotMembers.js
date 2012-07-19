Ext.define("inkle.view.BlotMembers", {
	extend: "Ext.Container",
	
	xtype: "blotMembersView",
	
	config: {
		layout: "vbox",
		scrollable: false,
		    	
    	items: [
    		// Top toolbar
    		{
    			xtype: "toolbar",
    			id: "blotMembersViewToolbar",
                docked: "top",
                title: "Blot Members",
                items: [
                	{
                		xtype: "button",
                		itemId: "blotMembersDoneButton",
                		ui: "action",
                		text: "Done"
                	}
                ]
    		},
    		
    		// Friends list
    		{
    			xtype: "list",
				id: "blotMembersList",
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
						url: "http://127.0.0.1:8000/sencha/blotMembers/",
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
            	delegate: "#blotMembersDoneButton",
            	event: "tap",
            	fn: "onBlotMembersDoneButtonTapped"
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
	onBlotMembersDoneButtonTapped: function() {
        this.fireEvent("blotMembersDoneButtonTapped");
    },
    
    onSelectionItemTap: function(event) {
    	var tappedId = event.getTarget(".selectionItem").getAttribute("memberId");
    	this.fireEvent("selectionItemTapped", tappedId);
    }
});