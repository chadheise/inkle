Ext.define("inkle.view.Settings", {
	extend: "Ext.navigation.View",
	
	xtype: "settingsView",
	
    requires: [
    	"Ext.dataview.List"
    ],
	
	config: {
		// Tab information
		title: "Settings",
		iconCls: "settingsIcon",
    	
    	// Layout information
    	layout: "card",
    	navigationBar: false,
    	//scrollable: true,
    	
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
                	},
                	{
                		xtype: "button",
                		itemId: "inviteFacebookFriendsBackButton",
                		ui: "back",
                		text: "Settings",
                		hidden: true,
                	},
                	{
                		xtype: "button",
                		itemId: "shareSettingsBackButton",
                		ui: "back",
                		text: "Settings",
                		hidden: true,
                	},
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
						{ text: "Update email" },
						{ text: "Update password" },
						{ text: "Update picture" },
						{ text: "Notifications" },
						{ text: "Sharing" },
						{ text: "Invite Facebook Friends" },
						{ text : "Link to Facebook account" }
					],
					autoLoad: true
				}
    		},
    	],
    	
    	listeners: [
			{
            	delegate: "#settingsLogoutButton",
            	event: "tap",
            	fn: "onSettingsLogoutButtonTap"
        	},
        	{
            	delegate: "#settingsViewList",
            	event: "itemtap",
            	fn: "onSettingsViewListItemTap"
        	},
        	{
            	delegate: "#inviteFacebookFriendsBackButton",
            	event: "tap",
            	fn: "onInviteFacebookFriendsBackButtonTap"
        	},
        	{
            	delegate: "#shareSettingsBackButton",
            	event: "tap",
            	fn: "onShareSettingsBackButtonTap"
        	},
        	
        ]
	},
	
	// Event firings
	onSettingsLogoutButtonTap: function() {
        this.fireEvent("settingsLogoutButtonTapped");
    },
    onSettingsViewListItemTap: function(settingsList, index) {
        if (index < 3) {
            alert("Clicked " + index);
        }
        else if (index == 4) {
            this.fireEvent("shareSettingsTapped");
        }
        else if (index == 5 || index == 6) {
            this.fireEvent("inviteFacebookFriendsTapped");
        }
    },
    onInviteFacebookFriendsBackButtonTap: function() {
        this.fireEvent("inviteFacebookFriendsBackButtonTapped");
    },
    onShareSettingsBackButtonTap: function() {
        this.fireEvent("shareSettingsBackButtonTapped");
    }
});