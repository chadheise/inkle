Ext.define("inkle.view.GroupMembers", {
	extend: "Ext.Container",
	
	xtype: "groupMembersView",
	
	config: {
		layout: "vbox",
		scrollable: false,
		    	
    	items: [
    		// Top toolbar
    		{
    			xtype: "toolbar",
    			id: "groupMembersViewToolbar",
                docked: "top",
                title: "Group Members",
                items: [
                	{
                		xtype: "button",
                		itemId: "groupMembersDoneButton",
                		ui: "action",
                		text: "Done"
                	}
                ]
    		},
    		
    		// Friends list
    		{
    			xtype: "list",
				id: "groupMembersList",
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
						url: "http://127.0.0.1:8000/sencha/groupMembers/",
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
            	delegate: "#groupMembersDoneButton",
            	event: "tap",
            	fn: "onGroupMembersDoneButtonTapped"
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
	onGroupMembersDoneButtonTapped: function() {
        this.fireEvent("groupMembersDoneButtonTapped");
    },
    
    onSelectionItemTap: function(event) {
    	var tappedId = event.getTarget(".selectionItem").getAttribute("memberId");
    	this.fireEvent("selectionItemTapped", tappedId);
    }
});