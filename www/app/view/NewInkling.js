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
				margin: "-10px -10px 10px -10px",
				//title: "Basic Info",
				
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
						xtype: "textfield",
						name: "category",
						label: "Category",
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
				id: "newInklingViewInvitees",
				margin: "0px -10px 10px -10px",
				html: [
					"<p id='numInvitedFriends'>0 friends invited</p>",
					"<img class='disclosureArrow' src='resources/images/disclosureArrow.png' />"
				].join("")
			},
			
			// Privacy form fields
			{
				xtype: "fieldset",
				margin: "0px -10px 10px -10px",
				//title: "Privacy",
				
				// Form fields
				items: [
					{
						xtype: "checkboxfield",
						id: "isPrivateCheckbox",
						name: "isPrivate",
						label: "Private?",
						checked: false
					},
					{
						xtype: "selectfield",
						id: "shareWithSelect",
						name: "shareWith",
						label: "Share with",
						usePicker: true,
						store: {
							fields: ["text", "value"],
							proxy: {
								type: "ajax",
								actionMethods: {
									read: "POST"
								},
								url: "http://127.0.0.1:8000/sencha/groups/",
								extraParams: {
									view: "allInklings"
								},
								reader: {
									type: "json",
									rootProperty: "groups"
								}
							},
							autoLoad: true
						}
					}
				]
			}
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
    }
});