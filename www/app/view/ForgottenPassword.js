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
                title: "Password",
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
                        id: "forgottenPasswordSendButton",
                        text: "Send",
                        ui: "action"
                    }
                ]
            },

            // Forgotten password explanation
            {
                xtype: "container",
                html: [
                    "<p id='forgottenPasswordExplanation'>Give us the email address associate with your inkle account and we will send you an email with a PIN that you can use to create a new password.</p>"
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
            }
        ],

        listeners: [
            {
                delegate: "#forgottenPasswordCancelButton",
                event: "tap",
                fn: "onForgottenPasswordCancelButtonTap"
            },
            {
                delegate: "#forgottenPasswordSendButton",
                event: "tap",
                fn: "onForgottenPasswordSendButtonTap"
            }
        ]
    },
    
    // Event firings
    onForgottenPasswordCancelButtonTap: function() {
        this.fireEvent("forgottenPasswordCancelButtonTapped");
    },
    
    onForgottenPasswordSendButtonTap: function() {
        this.fireEvent("forgottenPasswordSendButtonTapped");
    }
});
