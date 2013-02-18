Ext.define("inkle.view.ResetPassword", {
    extend: "Ext.form.Panel",
    
    xtype: "resetPasswordView",
    
    requires: [
        "Ext.form.FieldSet",
        "Ext.field.Password"
    ],
    
    layout: "vbox",
    
    config: {        
        scrollable: false,
        style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #EEEEEE 0%, #999999 100%)",
        
        url: inkle.app.baseUrl + "/resetPassword/",
        headers : { "cache-control": "no-cache" },
        
        items: [
            // Top toolbar
            {
                xtype: "toolbar",
                id: "resetPasswordToolbar",
                title: "New Password",
                docked: "top",
                items: [
                    {
                        xtype: "button",
                        id: "resetPasswordBackButton",
                        text: "Back",
                        ui: "back"
                    },
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        id: "resetPasswordSubmitButton",
                        text: "Submit",
                        ui: "action"
                    }
                ]
            },

            // Reset password explanation
            {
                xtype: "container",
                html: [
                    "<p id='resetPasswordExplanation'>Type in and confirm a new password.</p>"
                ].join("")
            },

            // Password form
            {
                xtype: "fieldset",
                //xtype: "container",
                id: "resetPasswordForm",
                //top: 0,
                margin: 10,
                width: "94%",
                
                items: [
                    {
                        xtype: "passwordfield",
                        id: "resetPasswordNewPassword1",
                        name: "newPassword1",
                        placeHolder: "New Password"
                    },
                    {
                        xtype: "passwordfield",
                        id: "resetPasswordNewPassword2",
                        name: "newPassword2",
                        placeHolder: "Confirm New Password"
                    }
                ]
            }
        ],

        listeners: [
            {
                delegate: "#resetPasswordBackButton",
                event: "tap",
                fn: "onResetPasswordBackButtonTap"
            },
            {
                delegate: "#resetPasswordSubmitButton",
                event: "tap",
                fn: "onResetPasswordSubmitButtonTap"
            }
        ]
    },
    
    // Event firings
    onResetPasswordBackButtonTap: function() {
        this.fireEvent("resetPasswordBackButtonTapped");
    },
    
    onResetPasswordSubmitButtonTap: function() {
        this.fireEvent("resetPasswordSubmitButtonTapped");
    }
});
