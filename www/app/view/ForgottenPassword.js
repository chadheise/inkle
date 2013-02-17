Ext.define("inkle.view.ForgottenPassword", {
    extend: "Ext.form.Panel",
    
    xtype: "forgottenPasswordView",
   
    requires: [
        "Ext.form.FieldSet",
        "Ext.field.Email"
    ],

    config: {
        scrollable: false,
        style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #EEEEEE 0%, #999999 100%)",
        
        url: "http://127.0.0.1:8000/forgottenPassword/",
        headers : { "cache-control": "no-cache" },
        
        items: [
            // Top toolbar
            {
                xtype: "toolbar",
                id: "forgottenPasswordToolbar",
                title: "New Password",
                docked: "top",
                items: [
                    {
                        xtype: "button",
                        id: "forgottenPasswordCancelButton",
                        text: "Cancel",
                        ui: "action"
                    },
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        id: "forgottenPasswordSubmitButton",
                        text: "Submit",
                        ui: "action"
                    }
                ]
            },

            // Forgotten password explanation
            {
                xtype: "container",
                html: [
                    "<p>Give us the email address associated with your inkle account and we will send you an email with a PIN that you can use to create a new password.</p>"
                ].join("")
            },
            
            // Forgotten password email form
            {
                xtype: "fieldset",
                id: "forgottenPasswordForm",
                margin: 10,
                width: "94%",
                
                items: [
                    {
                        xtype: "emailfield",
                        id: "forgottenPasswordEmail",
                        name: "email",
                        placeHolder: "Email"
                    }
                ]
            },

            // Forgotten password explanation
            {
                xtype: "container",
                html: [
                    "<p>If you've already received your six-digit PIN from us, enter it here and you'll be able to create a new password.</p>"
                ].join("")
            },
            
            // Forgotten password email form
            {
                xtype: "fieldset",
                id: "forgottenPasswordPinForm",
                margin: 10,
                width: "94%",
                
                items: [
                    {
                        xtype: "emailfield",
                        id: "forgottenPasswordEmail",
                        name: "email",
                        placeHolder: "Email"
                    }
                ]
            }
        ],

        listeners: [
            {
                delegate: "#forgottenPasswordCancelButton",
                event: "tap",
                fn: "onForgottenPasswordCancelButtonTap"
            },
            {
                delegate: "#forgottenPasswordSubmitButton",
                event: "tap",
                fn: "onForgottenPasswordSendButtonTap"
            }
        ]
    },
    
    // Event firings
    onForgottenPasswordCancelButtonTap: function() {
        this.fireEvent("forgottenPasswordCancelButtonTapped");
    },
    
    onForgottenPasswordSubmitButtonTap: function() {
        this.fireEvent("forgottenPasswordSubmitButtonTapped");
    }
});
