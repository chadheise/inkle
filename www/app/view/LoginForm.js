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
		style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #EEEEEE 0%, #999999 100%)",
		
		url: "http://127.0.0.1:8000/emailLogin/",
        headers : { "cache-control": "no-cache" },
		
		items: [
            // Top toolbar
            {
                xtype: "toolbar",
                id: "loginFormToolbar",
                title: "Login",
                docked: "top",
                items: [
                    {
                        xtype: "button",
                        id: "loginFormCancelButton",
                        text: "Cancel",
                        ui: "action"
                    },
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        id: "loginFormLoginButton",
                        text: "Login",
                        ui: "action"
                    }
                ]
            },
            
            // Login form
			{
				xtype: "fieldset",
				id: "loginForm",
				top: 0,
				margin: 10,
				width: "94%",
				
				items: [
					{
						xtype: "emailfield",
						id: "loginFormEmail",
						name: "email",
						placeHolder: "Email"
					},
					{
						xtype: "passwordfield",
						id: "loginFormPassword",
						name: "password",
						placeHolder: "Password"
					}
				]
			},

            // Forgotten password
            {
                xtype: "container",
                html: [
                    "<p id='forgottenPassword'>Forgot your password?</p>"
                ].join("")
            }
		],

		listeners: [
			{
                delegate: "#loginFormCancelButton",
                event: "tap",
                fn: "onLoginFormCancelButtonTap"
            },
            {
                delegate: "#loginFormLoginButton",
                event: "tap",
                fn: "onLoginFormLoginButtonTap"
            },
            {
                delegate: "#loginFormPassword",
                event: "focus",
                fn: "onLoginFormTap"
            },
            {
                delegate: "#forgottenPassword",
                element: "element",
                event: "tap",
                fn: "onForgottenPasswordTap"
            }
        ]
	},
	
	// Event firings
	onLoginFormCancelButtonTap: function() {
        this.fireEvent("loginFormCancelButtonTapped");
	},
	
	onLoginFormLoginButtonTap: function() {
        this.fireEvent("loginFormLoginButtonTapped");
    },
    
    onLoginFormTap: function() {
        //window.scrollTo(500,500);
        //alert(this.getLoginFormToolbar());
        //this.getLoginFormToolbar().scrollTo(0,0);
    },

    onForgottenPasswordTap: function() {
        this.fireEvent("forgottenPasswordTapped");
    }
});
