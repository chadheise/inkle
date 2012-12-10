Ext.define("inkle.view.LinkFacebookAccount", {
	extend: "Ext.Container",
	
	xtype: "linkFacebookAccountView",
	
	requires: [
	    "Ext.dataview.List"
	],
	
	config: {
		layout: "card",
		scrollable: false,
		    	
    	items: [
    	    {
		        xtype: "container",
		        id: "linkFacebookAccountMessage",
		        html: "" //Message is set dynamically in settingsController depending on how/if the user has connected with facebook
		    },
    		{
		        xtype: "container",
		        centered: true,
		        items: [
		            {
                        xtype: "button",
                        id: "linkFacebookAccountButton",
                        cls: "facebookLoginButton",
                        pressedCls: "facebookLoginDarkButton",
                    	margin: 15,
                    	height: 50,
                    	width: 230,
                    },
                ]
            },
    	],
    	
    	listeners: [
        	{
				delegate: "#linkFacebookAccountButton",
            	event: "tap",
            	fn: "onLinkFacebookAccountButtonTap"
			},
        ]
    },
    
    // Event firings
    onLinkFacebookAccountButtonTapped: function() {
        alert("Link to fb account tapped");
    }
    
});