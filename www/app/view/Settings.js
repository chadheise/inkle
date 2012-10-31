Ext.define("inkle.view.Settings", {
	extend: "Ext.Container",
	
	xtype: "settingsView",
	
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
                title: "Settings",
                items: [
                	{
                		xtype: "button",
                		ui: "action",
                		text: "Logout",
                		itemId: "settingsLogoutButton"
                	}
                ]
    		},
    		
    		// Main content list
    		{
    			xtype: "list",
    			id: "settingsViewList",
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
            	delegate: "#settingsLogoutButton",
            	event: "tap",
            	fn: "onSettingsLogoutButtonTap"
        	}
        ]
	},
	
	// Event firings
	onSettingsLogoutButtonTap: function() {
        this.fireEvent("settingsLogoutButtonTapped");
    }
});