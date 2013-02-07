Ext.define("inkle.view.GroupMembers", {
	extend: "Ext.Container",
	
	xtype: "groupMembersView",
	
	config: {
		layout: "vbox",
		scrollable: false,

        items: [
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
						url: inkle.app.baseUrl + "/groupMembers/",
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
    onSelectionItemTap: function(event, target) {
        this.fireEvent("selectionItemTapped", Ext.fly(target));
    }
});
