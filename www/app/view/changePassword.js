Ext.define("inkle.view.changePassword", {
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
		style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #EEEEEE 0%, #999999 100%)",
		
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
				flex: 1,
				
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
            {
                flex: 1 //Hack needed to get button to display properly
            },
            {
                xtype: "container",
                flex: 3,
                border: 1,
                items: [
			        {
                        xtype: "button",
                        id: "changePasswordButton",
                        centered: true,
                        cls: "changePasswordButton",
                        pressedCls: "changePasswordDarkButton",
                    	margin: 15,
                    	height: 50,
                    	width: 230,
                    },
                ]
            }
			
		],

		listeners: [
			{
				delegate: "#changePasswordButton",
            	event: "tap",
            	fn: "onChangePasswordButtonTap"
			},
        ]
	},
	
	// Event firings
	onChangePasswordButtonTap: function() {
	    this.fireEvent("changePasswordButtonTapped");
	},
});
    