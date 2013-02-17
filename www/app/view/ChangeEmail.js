Ext.define("inkle.view.ChangeEmail", {
	extend: "Ext.form.Panel",
	
	xtype: "changeEmailView",
	
	requires: [
		"Ext.form.FieldSet",
		"Ext.field.Email",
		"Ext.field.Password"
	],
   	
   	layout: 'vbox',
   	
   	config: {
		scrollable: false,
		
		url: inkle.app.baseUrl + "/changeEmail/",
		
		fullscreen: true,
        layout: 'vbox',
		
		items: [
		    // Email form
			{
				xtype: "fieldset",
				id: "changeEmailForm",
				top: 0,
				margin: 10,
				width: "94%",
				
				items: [
				    {
						xtype: "emailfield",
						id: "changeEmailCurrentEmail",
						name: "changeEmailCurrentEmail",
						placeHolder: "Current Email",
					},
				    {
						xtype: "passwordfield",
						id: "changeEmailPassword",
						name: "changeEmailPassword",
						placeHolder: "Password",
					},
					{
						xtype: "emailfield",
						id: "changeEmailNewEmail1",
						name: "changeEmailNewEmail1",
						placeHolder: "New Email",
					},
					{
						xtype: "emailfield",
						id: "changeEmailNewEmail2",
						name: "changeEmailNewEmail2",
						placeHolder: "Confirm New Email",
					},
				]
			},
		],

		listeners: [
        ]
	},
	
	// Event firings

});
