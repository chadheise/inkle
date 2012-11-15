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
			    xtype: "htmlcontainer",
			    url: "http://127.0.0.1:8000/sencha/newInklingPrivacyForm/"
			},
			
			// Privacy form fields
			/*{
				xtype: "container",
				margin: "-20px -10px 10px -10px",
				title: "Who else is this shared with?",
				layout: "vbox",
				height: 500,
				
				items: [
					{
					    flex: 1,
					    xtype: "list",
						//id: "shareWithSelect",
						loadingText: "Loading groups...",
						emptyText: "<div class='emptyListText'>No groups.</div>",
						disableSelection: true,
						itemTpl: "{ html }",
						scrollable: false,
						store: {
							fields: [
								"id",
								"html"
							],
							proxy: {
								type: "ajax",
								actionMethods: {
									read: "POST"
								},
								url: "http://127.0.0.1:8000/sencha/groups/",
								extraParams: {
									view: "allInklings"
								}
							},
							autoLoad: true
						}
					}
				]
			}*/
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
        	}
        ]
    },
	
	// Event firings
    onNewInklingViewInviteesTap: function() {
        this.fireEvent("newInklingInviteesTapped");
    },
    
    onIsPrivateCheckboxCheck: function() {
    	this.fireEvent("isPrivateCheckboxChecked");
    },
    
    onIsPrivateCheckboxUncheck: function() {
    	this.fireEvent("isPrivateCheckboxUnchecked");
    },
    
    onForwardingSelectionItemTap: function(event, target) {
    	var selectionButton = Ext.fly(target);
    	this.fireEvent("forwardingSelectionItemTapped", selectionButton);
    },
    
    onSelectedGroupsSelectionItemTap: function(event, target) {
    	var selectionButton = Ext.fly(target);
    	this.fireEvent("selectedGroupsSelectionItemTapped", selectionButton);
    },
    
    onNoOneSelectionItemTap: function(event, target) {
    	var selectionButton = Ext.fly(target);
    	this.fireEvent("noOneSelectionItemTapped", selectionButton);
    },
    
    onSelectedGroupsGroupSelectionItemTap: function(event, target) {
    	var selectionButton = Ext.fly(target);
    	this.fireEvent("selectedGroupsGroupSelectionItemTapped", selectionButton);
    }
});