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
		            //"   <img id='facebookLoginButton' src='resources/images/fbLogin.png' style='border-radius: 3px; padding-bottom: 10px;' />",
		            //"   <img id='inkleLoginButton' src='resources/images/emailLogin.png' style='border-radius: 3px; padding-top: 10px;' />",
		            "</center>"
		        ].join("")
		    },
		    {
                xtype: 'button',
                id: 'facebookLoginButton',
                cls: 'fbLoginButton',
                pressedCls: 'fbLoginDarkButton'
            },
            {
                xtype: 'button',
                id: 'inkleLoginButton',
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
            	delegate: "#inkleLoginButton",
            	event: "tap",
            	fn: "onInkleLoginButtonTap"
        	}
        ]
	},
	
	// Event firings
	onFacebookLoginButtonTap: function () {
        this.fireEvent("facebookLoginButtonTapped");
    },
    onInkleLoginButtonTap: function () {
        this.fireEvent("inkleLoginButtonTapped");
    },
    onInkleLoginButtonPress: function () {
        alert("pressed");
    }

});