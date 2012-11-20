Ext.define("inkle.view.Login", {
	extend: "Ext.Panel",
	
	xtype: "loginView",
   	
   	config: {
		scrollable: false,
		style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
		
		url: "http://127.0.0.1:8000/sencha/login/",
		
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
		        //centered: true,
		        html: [
		            //"<center>",
		            "   <div style='position: absolute; top: 200px; left: 75px; color:#fff;'>Sign Up  |  Take a Tour</div>",
		            //"</center>"
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