Ext.define("inkle.view.Login", {
    extend: "Ext.Container",

    xtype: "loginView",

    config: {
        layout: "vbox",
        fullscreen: "true",
        scrollable: false,
        style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",

        /***********/
        /*  ITEMS  */
        /***********/
        items: [
            /* Walkthrough */
            {
                xtype: "walkthroughView",
                id: "walkthroughCarousel",
                flex: 1
            },

            /* Login buttons */
            {
                xtype: "container",
                id: "loginButtonsContainer",
                height: 122,
                html: [
                    // The div around the FB button gives it display: block while also keeping it centered
                    "<div><input id='facebookLoginButton' type='button' /></div>",
                    "<input id='emailLoginButton' type='button' />",
                    "<input id='signUpButton' type='button' />"
                ].join("")
            }
        ],

        /***************/
        /*  LISTENERS  */
        /***************/
        listeners: [
            {
                delegate: "#facebookLoginButton",
                element: "element",
                event: "tap",
                fn: "onFacebookLoginButtonTap"
            },
            {
                delegate: "#emailLoginButton",
                element: "element",
                event: "tap",
                fn: "onEmailLoginButtonTap"
            },
            {
                delegate: "#signUpButton",
                element: "element",
                event: "tap",
                fn: "onSignUpButtonTap"
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

    onSignUpButtonTap: function() {
        this.fireEvent("signUpButtonTapped");
    }
});