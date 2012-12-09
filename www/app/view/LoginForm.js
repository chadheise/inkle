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
		
		url: "http://127.0.0.1:8000/sencha/login/",
		
		items: [
		    // Top toolbar
    		{
    			xtype: "toolbar",
    			id: "loginFormToolbar",
    			title: "Inkle Login",
                docked: "top",
                ui: "customToolbar",
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
				/*listeners: {
                    focus: function() {
                        alert("hey!");
                        window.scrollTo(0,0);
                    }
                },*/
				
				items: [
					{
						xtype: "emailfield",
						id: "loginFormEmail",
						name: "email",
						placeHolder: "Email",
					},
					{
						xtype: "passwordfield",
						id: "loginFormPassword",
						name: "password",
						placeHolder: "Password"
					}
				]
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
            }
        ]
	},
	
	// Event firings
	onLoginFormCancelButtonTap: function() {
	    this.fireEvent("loginFormCancelButtonTapped");
	},
	
	onLoginFormLoginButtonTap: function () {
        this.fireEvent("loginFormLoginButtonTapped");
    },
    
    onLoginFormTap: function() {
        //window.scrollTo(500,500);
        //alert(this.getLoginFormToolbar());
        //this.getLoginFormToolbar().scrollTo(0,0);
    }
});