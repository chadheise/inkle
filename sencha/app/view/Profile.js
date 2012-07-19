Ext.define("inkle.view.Profile", {
	extend: "Ext.Container",
	
	xtype: "profileView",
	
    requires: [
    ],
	
	config: {        
		title: "Profile",
		iconCls: "settings",
    	
    	scrollable: true,
    	layout: "vbox",
    	
    	items: [
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
                	},
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Edit",
                        itemId: "profileEditButton"
                    }
                ]
    		},
    		
    		{
    			xtype: "htmlcontainer",
    			scrollable: true,
				url: "http://127.0.0.1:8000/sencha/profile/",
    		},
    		
    		{
    			xtype: "container",
    			style: {
    				"padding": "10px"
    			},
    			html: "ADSFASDF"
    		},
    		{
    			xtype: "button",
    			id: "profileViewNotificationsButton",
    			text: "Notifications"
    		},
    		{
    			xtype: "button",
    			id: "profileViewSettingsButton",
    			text: "Settings"
    		},
    		{
    			xtype: "button",
    			id: "profileViewPrivacyButton",
    			text: "Privacy"
    		}
    	],
    	
    	listeners: [
			{
            	delegate: "#profileLogoutButton",
            	event: "tap",
            	fn: "onProfileLogoutButtonTap"
        	},
			{
            	delegate: "#profileEditButton",
            	event: "tap",
            	fn: "onProfileEditButtonTap"
        	}
        ]
	},
	
	// Event firings
	onProfileLogoutButtonTap: function () {
        console.log("profileLogoutButtonTapped");
        this.fireEvent("profileLogoutButtonTapped");
    },
    
    onProfileEditButtonTap: function () {
        console.log("profileEditButtonTapped");
        this.fireEvent("profileEditButtonTapped");
    }
});