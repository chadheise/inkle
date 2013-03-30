Ext.define("inkle.view.Temp", {
    extend: "Ext.Container",

    xtype: "tempView",

    config: {
        layout: "vbox",
        fullscreen: "true",
        scrollable: false,
        style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",

        items: [
            {
                xtype: "walkthroughView",
                id: "loginWalkthrough",
                flex: 5
            },
            {
                xtype: "panel",
                id: "loginButtonsPanel",
                flex: 2,
                html: [
                    //"<img id='facebookLoginButton' src='resources/images/facebookLogin.png' />",
                    "<a id='facebookLoginButton' href='#'>",
                        "<img src='resources/images/facebookLogin.png' />",
                    "</a>",
                    "<a id='emailLoginButton' href='#'>",
                        "<img src='resources/images/emailLogin.png' />",
                    "</a>",
                    "<a id='signUpButton' href='#'>",
                        "<img src='resources/images/emailLogin.png' />",
                    "</a>"
                ].join("")
            }
            /*
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

            {
                xtype: "container",
                html: [
                    "<div id='loginFooter'>",
                    "   <span id='registration'>Sign Up</span>  |  <span id='tour'>Take a Tour</span>",
                    "<div>"
                ].join("")
            }
            */
        ],

        /***************/
        /*  LISTENERS  */
        /***************/
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
            }
        ]
    },

    /*******************/
    /*  EVENT FIRINGS  */
    /*******************/
    onFacebookLoginButtonTap: function() {
        this.fireEvent("facebookLoginButtonTapped");
    },

    onEmailLoginButtonTap: function() {
        this.fireEvent("emailLoginButtonTapped");
    },

    onRegistrationTap: function() {
        this.fireEvent("registrationTapped");
    }
});