Ext.define("inkle.view.Profile", {
	extend: "Ext.Container",
	
	xtype: "profileView",
	
    requires: [
    	"Ext.dataview.List"
    ],
	
	config: {
		// Tab information    
		title: "Settings",
		iconCls: "settingsIcon",
    	
    	// Layout information
    	scrollable: true,
    	layout: "vbox",
    	
    	items: [
    		// Top toolbar
    		{
    			xtype: "toolbar",
                docked: "top",
                title: "Profile",
                items: [
                	{
                		xtype: "button",
                		ui: "action",
                		text: "Logout",
                		itemId: "profileLogoutButton"
                	}
                ]
    		},
    		
    		// Main content list
    		{
    			xtype: "list",
    			id: "profileViewList",
				disableSelection: true,
				scrollable: false,
				height: 236,
				itemTpl: [
					"<p>{ text }</p>",
					"<img class='disclosureArrow' src='resources/images/disclosureArrow.png' />"
				],
				store: {
					fields: [
						"text"
					],
					data: [
						{ text: "Notifications" },
						{ text: "Settings" },
						{ text: "Privacy" }
					],
					autoLoad: true
				}
    		}
    	],
    	
    	listeners: [
			{
            	delegate: "#profileLogoutButton",
            	event: "tap",
            	fn: "onProfileLogoutButtonTap"
        	}
        ]
	},
	
	// Event firings
	onProfileLogoutButtonTap: function() {
        this.fireEvent("profileLogoutButtonTapped");
    }
});