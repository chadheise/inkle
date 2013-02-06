Ext.define("inkle.view.NewInkling", {
	extend: "Ext.form.Panel",
	
	xtype: "newInklingView",
	
	requires: [
		"Ext.field.DatePicker",
		"Ext.field.Select"
	],
	
	config: {
		scrollable: true,
		
		items: [
			// Basic info form field
			{
				xtype: "fieldset",
				margin: "-30px -10px 10px -10px",
				title: "What are the details?",
				
				items: [
					{
						xtype: "textfield",
						name: "location",
						label: "Location",
						placeHolder: "Optional",
						maxLength: 50
					},
					{
						xtype: "datepickerfield",
						name: "date",
						label: "Date",
						placeHolder: "Optional",
						minValue: new Date()
					},
					{
						xtype: "textfield",
						name: "time",
						label: "Time",
						placeHolder: "Optional",
						maxLength: 50
					},
					{
						xtype: "textareafield",
						name: "notes",
						label: "Notes",
						placeHolder: "Optional",
						maxLength: 150
					}
				]
			},
			
			// Invited friends
			{
				xtype: "container",
				title: "Who is invited?",
				margin: "0px -10px 10px -10px",
				html: [
				    "<p>Who is invited?</p>",
				    "<div id='newInklingViewInvitees'>",
                        "<p id='numInvitedFriends'>0 friends invited</p>",
                        "<img class='disclosureArrow' src='resources/images/disclosureArrow.png' />",
				    "</div>"
				].join("")
			},
			{
    	        xtype: "container",
    	        html: [
    	            "<div>",
    	                "<p id='newInklingPrivacyFormHeader'>Who else is this shared with?</p>",
    	            "</div>",
    	        ].join("")
    	    },
			{
			    xtype: "htmlcontainer",
			    id: "newInklingShareOptions",
			    url: inkle.app.getBaseUrl() + "/shareSettingsForm/"
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
        	/*Share Settings*/
        	{
				event: "tap",
				element: "element",
            	delegate: "#newInklingShareOptions .forwardingShareSetting",
            	fn: "onForwardingShareSettingTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: "#newInklingShareOptions .selectedGroupsShareSetting",
            	fn: "onSelectedGroupsShareSettingTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: "#newInklingShareOptions .groupShareSetting",
            	fn: "onGroupShareSettingTap"
        	},
        	{
				event: "tap",
				element: "element",
            	delegate: "#newInklingShareOptions .noOneShareSetting",
            	fn: "onNoOneShareSettingTap"
        	}
        ]
    },
	
	// Event firings
    onNewInklingViewInviteesTap: function() {
        this.fireEvent("newInklingInviteesTapped");
    },
    
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
