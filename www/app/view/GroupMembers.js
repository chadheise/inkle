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
                		itemId: "groupMembersBackButton",
                		ui: "back",
                		text: "Groups"
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
            	delegate: "#groupMembersBackButton",
            	event: "tap",
            	fn: "onGroupMembersBackButtonTapped"
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
	onGroupMembersBackButtonTapped: function() {
        this.fireEvent("groupMembersBackButtonTapped");
    },
    
    onSelectionItemTap: function(event) {
    	var tappedId = event.getTarget(".selectionItem").getAttribute("memberId");
    	this.fireEvent("selectionItemTapped", tappedId);
    }
});