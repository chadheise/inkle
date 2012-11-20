Ext.define("inkle.view.Login", {
	extend: "Ext.Panel",
	
	xtype: "loginView",
   	
   	config: {
		scrollable: false,
		style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
		
		url: "http://127.0.0.1:8000/sencha/login/",
		
		items: [
		    {
		        xtype: "panel",
		        html: [
		            "<center>",
		            "   <img src='resources/images/logoWhite.png' style='padding-top: 50px; padding-bottom: 60px; width: 90%;' />",
		            "</center>"
		        ].join("")
		    },
		    {
                xtype: 'button',
                id: 'facebookLoginButton',
                cls: 'facebookLoginButton',
                pressedCls: 'facebookLoginDarkButton',
            },
            {
                xtype: 'button',
                id: 'emailLoginButton',
                cls: 'emailLoginButton',
                pressedCls: 'emailLoginDarkButton'
            },
            {
		        xtype: "panel",
		        html: [
		            "<center>",
		            "   <div style='color:#fff; padding-top: 50px;'><div>Sign Up  |  Take a Tour</div></div>",
		            "</center>"
		        ].join("")
		    },
		],

		listeners: [
			{
			    //element: "element",
				delegate: "#facebookLoginButton",
            	event: "tap",
            	fn: "onFacebookLoginButtonTap"
			},
			{
    			//element: "element",
            	delegate: "#emailLoginButton",
            	event: "tap",
            	fn: "onEmailLoginButtonTap"
        	}
        ]
	},
	
	// Event firings
	onFacebookLoginButtonTap: function () {
        this.fireEvent("facebookLoginButtonTapped");
    },
    onEmailLoginButtonTap: function () {
        this.fireEvent("emailLoginButtonTapped");
    }

});