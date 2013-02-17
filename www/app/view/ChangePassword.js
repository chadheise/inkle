Ext.define("inkle.view.ChangePassword", {
	extend: "Ext.form.Panel",
	
	xtype: "changePasswordView",
	
	requires: [
		"Ext.form.FieldSet",
		"Ext.field.Email",
		"Ext.field.Password"
	],
   	
   	layout: 'vbox',
   	
   	config: {
		scrollable: false,
		
		url: inkle.app.baseUrl + "/changePassword/",
		
		fullscreen: true,
        layout: 'vbox',
		
		items: [
		    // Password form
			{
				xtype: "fieldset",
				//xtype: "container",
				id: "changePasswordForm",
				top: 0,
				margin: 10,
				width: "94%",
				
				items: [
				    {
						xtype: "passwordfield",
						id: "changePasswordCurrentPassword",
						name: "currentPassword",
						placeHolder: "Current Password",
					},
					{
						xtype: "passwordfield",
						id: "changePasswordNewPassword1",
						name: "newPassword1",
						placeHolder: "New Password",
					},
					{
						xtype: "passwordfield",
						id: "changePasswordNewPassword2",
						name: "newPassword2",
						placeHolder: "Confirm New Password",
					},
				]
			},			
		],

		listeners: [
        ]
	},
	
	// Event firings
});
    