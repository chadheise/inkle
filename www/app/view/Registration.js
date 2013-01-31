Ext.define("inkle.view.Registration", {
	extend: "Ext.form.Panel",
	
	xtype: "registrationView",
   
    requires: [
		"Ext.form.FieldSet",
		"Ext.field.Email",
		"Ext.field.Password"
	],
   	
   	config: {
		scrollable: false,
		style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #EEEEEE 0%, #999999 100%)",
		
		url: "http://127.0.0.1:8000/registration/",
		
		items: [
		    // Top toolbar
    		{
    			xtype: "toolbar",
    			id: "registrationFormToolbar",
    			title: "Inkle Sign Up",
                docked: "top",
                items: [
                	{
                		xtype: "button",
                		id: "registrationFormCancelButton",
   		    			text: "Cancel",
                		ui: "action"
                	},
                	{ xtype: "spacer" },
                    {
                		xtype: "button",
                		id: "registrationFormRegisterButton",
   		    			text: "Register",
                		ui: "action"
                	}
                ]
            },
            
		    // Registration form
			{
				xtype: "fieldset",
				id: "registrationForm",
				top: 0,
				margin: 10,
				width: "94%",
				
				items: [
					{
						xtype: "textfield",
						id: "registrationFormFirstName",
						name: "firstName",
						placeHolder: "First Name"
					},
					{
						xtype: "textfield",
						id: "registrationFormLastName",
						name: "lastName",
						placeHolder: "Last Name"
					},
					{
						xtype: "selectfield",
						id: "registrationFormGender",
						name: "gender",
						placeHolder: "Gender",
						options: [
                            {text: "Gender",  value: ""},
                            {text: "Female",  value: "Female"},
                            {text: "Male",  value: "Male"}
                        ]
					},
					{
                        xtype: "datepickerfield",
                        id: "registrationFormBirthday",
                        name: "birthday",
                        placeHolder: "Birthday",
                        picker: {
                            yearFrom: 1900
                        }
					},
					{
						xtype: "emailfield",
						id: "registrationFormEmail",
						name: "email",
						placeHolder: "Email"
					},
					{
						xtype: "passwordfield",
						id: "registrationFormPassword",
						name: "password",
						placeHolder: "Password"
					},
					{
						xtype: "passwordfield",
						id: "registrationFormConfirmPassword",
						name: "confirmPassword",
						placeHolder: "Confirm Password"
					}
				]
			}
		],

		listeners: [
			{
            	delegate: "#registrationFormCancelButton",
            	event: "tap",
            	fn: "onRegistrationFormCancelButtonTap"
        	},
        	
			{
            	delegate: "#registrationFormRegisterButton",
            	event: "tap",
            	fn: "onRegistrationFormRegisterButtonTap"
        	}
        ]
	},
	
	// Event firings
	onRegistrationFormCancelButtonTap: function() {
	    this.fireEvent("registrationFormCancelButtonTapped");
	},
	
	onRegistrationFormRegisterButtonTap: function () {
        this.fireEvent("registrationFormRegisterButtonTapped");
    }
});
