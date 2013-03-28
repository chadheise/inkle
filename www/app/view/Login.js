Ext.define("inkle.view.Login", {
    extend: "Ext.Panel",

    xtype: "loginView",

    config: {
        scrollable: false,
        style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",

        items: [

            {
                xtype: "container",
                html: [
                    "<center>",
                    "   <img src='resources/images/logoWhite.png' style='padding-top: 50px; padding-bottom: 60px; width: 80%;' />",
                    "</center>"
                ].join("")
            },
            {
                xtype: "container",
                centered: true,
                items: [
                    {
                        xtype: "button",
                        id: "facebookLoginButton",
                        cls: "facebookLoginButton",
                        pressedCls: "facebookLoginDarkButton",
                        margin: 15,
                        height: 50,
                        width: 230
                    },
                    {
                        xtype: "button",
                        id: "emailLoginButton",
                        cls: "emailLoginButton",
                        pressedCls: "emailLoginDarkButton",
                        margin: 15,
                        height: 50,
                        width: 230
                    }
                ]
            },

            /* Footer */
            {
                xtype: "container",
                html: [
                    "<div id='loginFooter'>",
                    "   <span id='registration'>Sign Up</span>  |  <span id='tour'>Take a Tour</span>",
                    "<div>"
                ].join("")
            }
        ],

        listeners: [
            {
                delegate: "#facebookLoginButton",
                event: "tap",
                fn: "onFacebookLoginButtonTap"
            },
            {
                delegate: "#emailLoginButton",
                event: "tap",
                fn: "onEmailLoginButtonTap"
            },
            {
                element: "element",
                delegate: "#registration",
                event: "tap",
                fn: "onRegistrationTap"
            },
            {
                element: "element",
                delegate: "#tour",
                event: "tap",
                fn: "onTourTap"
            }
        ]
    },

    // Event firings
    onFacebookLoginButtonTap: function() {
        this.fireEvent("facebookLoginButtonTapped");
    },
    onEmailLoginButtonTap: function() {
        this.fireEvent("emailLoginButtonTapped");
    },
    onRegistrationTap: function() {
        this.fireEvent("registrationTapped");
    },
    onTourTap: function() {
        this.fireEvent("tourTapped");
    }
});