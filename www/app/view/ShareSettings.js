Ext.define("inkle.view.ShareSettings", {
	extend: "Ext.form.Panel",
	
	xtype: "shareSettingsView",
	
	requires: [
		"Ext.field.DatePicker",
		"Ext.field.Select"
	],
	
	config: {
		scrollable: true,
		
		items: [
		    {
    	        xtype: "container",
    	        id: "shareSettingsHeader",
    	        html: [
    	            "<div>",
    	                "<span><p>Select who you would like to share your inklings with by default.</p></span>",
    	                "<span><p>You can always adjust who a specific inkling is visible to when you create the inkling.</p></span>",
    	            "</div>",
    	        ].join("")
    	    },
			{
			    xtype: "htmlcontainer",
			    url: "http://127.0.0.1:8000/shareSettingsForm/"
			},
		],
    	
    	// Listeners
    	listeners: [
			{
				event: "tap",
				element: "element",
            	delegate: "#newInklingViewInvitees",
            	fn: "onNewInklingViewInviteesTap"
        	},
        	{
        		event: "check",
        		delegate: "#isPrivateCheckbox",
        		fn: "onIsPrivateCheckboxCheck"
        	},
        	{
        		event: "uncheck",
        		delegate: "#isPrivateCheckbox",
        		fn: "onIsPrivateCheckboxUncheck"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: "#forwardingSelectionItem",
            	fn: "onForwardingSelectionItemTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: "#selectedGroupsSelectionItem",
            	fn: "onSelectedGroupsSelectionItemTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: "#noOneSelectionItem",
            	fn: "onNoOneSelectionItemTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: ".selectedGroupSelectionItem",
            	fn: "onSelectedGroupsGroupSelectionItemTap"
        	},
        	/*Share Settings*/
        	{
				event: "tap",
				element: "element",
            	delegate: "#forwardingShareSetting",
            	fn: "onForwardingShareSettingTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: "#selectedGroupsShareSetting",
            	fn: "onSelectedGroupsShareSettingTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: ".groupShareSetting",
            	fn: "onGroupShareSettingTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: "#noOneShareSetting",
            	fn: "onNoOneShareSettingTap"
        	}
        ]
    },
	
	// Event firings
    onNewInklingViewInviteesTap: function() {
        this.fireEvent("newInklingInviteesTapped");
    },
    
    /*Share Settings Event Firings*/
    onSelectedGroupsShareSettingTap: function(event, target) {
    	var selectionButton = Ext.fly(target);
    	this.fireEvent("selectedGroupsShareSettingTapped", selectionButton);
    },
    
    onGroupShareSettingTap: function(event, target) {
    	var selectionButton = Ext.fly(target);
    	this.fireEvent("groupShareSettingTapped", selectionButton);
    },
    
    onNoOneShareSettingTap: function(event, target) {
    	var selectionButton = Ext.fly(target);
    	this.fireEvent("noOneShareSettingTapped", selectionButton);
    },
    
    onForwardingShareSettingTap: function(event, target) {
    	var selectionButton = Ext.fly(target);
    	this.fireEvent("forwardingShareSettingTapped", selectionButton);
    },
});
