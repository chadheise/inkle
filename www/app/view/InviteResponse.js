Ext.define("inkle.view.InviteResponse", {
	extend: "Ext.Container",
	
	xtype: "inviteResponseView",
	
	config: {
		layout: "vbox",
		scrollable: false,
		    	
    	items: [
    		// Inkling invites list
    		{
    			xtype: "list",
				id: "inklingInvitesList",
				flex: 1,
				loadingText: "Loading inkling invites...",
				emptyText: "<div class='emptyListText'>No inkling invites</div>",
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
						url: "http://127.0.0.1:8000/sencha/inklingInvitations/",
						actionMethods: {
							read: "POST"
						},

						reader: {
							type: "json",
							rootProperty: "inklingInvites"
						}
					},
					autoLoad: true
				}
    		}
    	],
    	
    	listeners: [
        ]
    },
    
    // Event firings
});