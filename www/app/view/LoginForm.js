Ext.define("inkle.view.LoginForm", {
	extend: "Ext.form.Panel",
	
	xtype: "loginFormView",
   
    requires: [
		"Ext.form.FieldSet",
		"Ext.field.Email",
		"Ext.field.Password"
	],
   	
   	config: {
		scrollable: false,
		style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
		
		url: "http://127.0.0.1:8000/sencha/login/",
		
		items: [
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
				itemId: "inkleLoginSubmitButton",
				text: "Login",
				ui: "confirm"
			}
		],

		listeners: [
			{
            	delegate: "#inkleLoginSubmitButton",
            	event: "tap",
            	fn: "onInkleLoginSubmitButtonTap"
        	}
        ]
	},
	
	// Event firings
	onInkleLoginSubmitButtonTap: function () {
        this.fireEvent("inkleLoginSubmitButtonTapped");
    }
});