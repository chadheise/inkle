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

        url: inkle.app.baseUrl + "/forgottenPassword/",

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
                        id: "forgottenPasswordBackButton",
                        text: "Back",
                        ui: "back"
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
                    "<p id='forgottenPasswordExplanation'>Enter the email address associated with your Inkle account and we will send you an email with a secret PIN. Type in that PIN below to create your new password.</p>"
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
                    },
                    {
                        xtype: "textfield",
                        id: "forgottenPasswordPin",
                        name: "pin",
                        placeHolder: "PIN (blank if you do not have one)"
                    }
                ]
            }
        ],

        listeners: [
            {
                delegate: "#forgottenPasswordBackButton",
                event: "tap",
                fn: "onForgottenPasswordBackButtonTap"
            },
            {
                delegate: "#forgottenPasswordSubmitButton",
                event: "tap",
                fn: "onForgottenPasswordSubmitButtonTap"
            }
        ]
    },

    // Event firings
    onForgottenPasswordBackButtonTap: function() {
        this.fireEvent("forgottenPasswordBackButtonTapped");
    },

    onForgottenPasswordSubmitButtonTap: function() {
        this.fireEvent("forgottenPasswordSubmitButtonTapped");
    }
});
