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
		style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%);",
		
		items: [
			// Inkle logo
		    {
		        xtype: "panel",
		        html: "<center><img src='resources/images/logoWhite.png' style='padding-top: 50px; padding-bottom: 60px; width: 90%;'/></center>"
		    },
		    { 
		        xtype: "panel",
		        html: "<center><img src='resources/images/fbLogin.png' id='facebookLoginSubmitButton' style='border-radius: 3px';/></center>"
		    }, 
		    
		    // Login form
			/*{
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
			},*/
			
			{ 
		        xtype: "panel",
		        html: "<center><img src='resources/images/line.png' style='width: 100%;'/></center>"
		    },
		    
		    { 
		        xtype: "panel",
		        html: "<center><img src='resources/images/inkleLogin.png' style='border-radius: 3px';/></center>"
		    },
			{ 
		        xtype: "panel",
		        html: "<center><div style='color:#fff; padding-top: 50px;'><div>Sign Up  |  Take a Tour</div></div></center>"
		    },
			/*{
			    xtype: "panel",
			    html: "<center style='padding-top: 20px;'>OR</center>"
			},*/
			
			/*{
				xtype: "button",
				itemId: "facebookLoginSubmitButton",
				text: "Login with Facebook",
				ui: "confirm"
			}*/
		
			/*{
			    xtype: "panel",
			    html: "<center style='padding-top: 20px; color: blue;'>Login with Facebook</center>"
			}*/
		],

		listeners: [
			{
            	delegate: "#loginSubmitButton",
            	event: "tap",
            	fn: "onLoginSubmitButtonTap"
        	},
			{
				delegate: "#facebookLoginSubmitButton",
            	event: "tap",
            	element: "element",
            	fn: "onFacebookLoginSubmitButtonTap"
			}
        ]
	},
	
	// Event firings
	onLoginSubmitButtonTap: function () {
        console.log("loginSubmitButtonTapped");
        this.fireEvent("loginSubmitButtonTapped");
    },
	onFacebookLoginSubmitButtonTap: function () {
        console.log("facebookLoginSubmitButtonTapped");
        this.fireEvent("facebookLoginSubmitButtonTapped");
    }

});