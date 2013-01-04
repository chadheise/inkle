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
                cls: "membersList",
				flex: 1,
				loadingText: "Loading group members...",
				emptyText: "<div class='emptyListText'>No group members</div>",
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
						url: "http://127.0.0.1:8000/groupMembers/",
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
    
    onSelectionItemTap: function(event, target) {
    	this.fireEvent("selectionItemTapped", Ext.fly(target));
    }
});
