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
                cls: "settingsList",
				disableSelection: true,
				scrollable: true,
				//height: 236,
				itemTpl: [
					"<p class='settingName'>{ text }</p>",
					"<img class='disclosureArrow' src='resources/images/disclosureArrow.png' />"
				],
				store: {
					fields: [
						"text",
						"key"
					],
					// data loaded via initializer in SettingsController
					autoLoad: false //Set to false once updating the data
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
    onSettingsViewListItemTap: function(settingsList, index, target, record, event, options) {
        var selectedSetting = record.getData()["key"]
        if (selectedSetting == "linkFacebookAccount") {
            this.fireEvent("inviteFacebookFriendsTapped");
        }
        else if (selectedSetting == "sharing") {
            this.fireEvent("shareSettingsTapped");
        }
        else {
            alert(selectedSetting);
        }
    },
    onInviteFacebookFriendsBackButtonTap: function() {
        this.fireEvent("inviteFacebookFriendsBackButtonTapped");
    },
    onShareSettingsBackButtonTap: function() {
        this.fireEvent("shareSettingsBackButtonTapped");
    }
});