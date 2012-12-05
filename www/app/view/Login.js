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
                    	width: 230,
                    },
                    {
                        xtype: "button",
                        id: "emailLoginButton",
                        cls: "emailLoginButton",
                        pressedCls: "emailLoginDarkButton",
                        margin: 15,
                    	height: 50,
                    	width: 230,
                    },
                ]
            },
            {
		        xtype: "container",
		        html: [
		            "<div style='position: absolute; top: 200px; left: 75px; color:#fff;'>",
		            "   <span id='registrationLink'>Sign Up</span>  |  Take a Tour",
		            "</div>",
		        ].join("")
		    },
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
            	delegate: "#registrationLink",
            	event: "tap",
            	fn: "onRegistrationLinkTap"
        	}
        ]
	},
	
	// Event firings
	onFacebookLoginButtonTap: function () {
        this.fireEvent("facebookLoginButtonTapped");
    },
    onEmailLoginButtonTap: function () {
        this.fireEvent("emailLoginButtonTapped");
    },
    onRegistrationLinkTap: function() {
        this.fireEvent("registrationLinkTapped");
    }

});