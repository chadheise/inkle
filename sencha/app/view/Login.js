Ext.define("inkle.view.Login", {
	extend: "Ext.form.Panel",
	
	xtype: "loginView",
   
    requires: [
		"Ext.form.FieldSet",
		"Ext.field.Email",
		"Ext.field.Password"
	],
   	
   	config: {
		scrollable: false,
		padding: "10px",
		url: "http://127.0.0.1:8000/sencha/login/",
		
		items: [
			// Inkle logo
		    {
		        xtype: "panel",
		        html: "<center><img src='resources/images/logo.png' style='padding-bottom: 20px;'/></center>"
		    },
		    
		    // Login form
			{
				xtype: "fieldset",
				
				items: [
					{
						xtype: "emailfield",
						name: "email",
						itemId: "loginEmail",
						placeHolder: "Email"
					},
					{
						xtype: "passwordfield",
						name: "password",
						itemId: "loginPassword",
						placeHolder: "Password"
					}
				]
			},
			
			// Submit button
			{
				xtype: "button",
				itemId: "loginSubmitButton",
				text: "Login",
				ui: "confirm"
			},
			
			{
			    xtype: "panel",
			    html: "<center style='padding-top: 20px;'>OR</center>"
			},
			
			{
			    xtype: "panel",
			    html: "<center style='padding-top: 20px; color: blue;'>Login with Facebook</center>"
			}
		],

		listeners: [
			{
            	delegate: "#loginSubmitButton",
            	event: "tap",
            	fn: "onLoginSubmitButtonTap"
        	}
        ]
	},
	
	// Event firings
	onLoginSubmitButtonTap: function () {
        console.log("loginSubmitButtonTapped");
        this.fireEvent("loginSubmitButtonTapped");
    }
});