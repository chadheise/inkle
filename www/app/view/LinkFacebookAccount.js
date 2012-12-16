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
		        html: [
    	            "<div>",
    	                "<span><p>To share inkle with facebook friends you need to link your inkle account to facebook.</p></span>",
    	                "<span><p>Once you do, you will need to login with your facebook account instead of your email.</p></span>",
    	            "</div>",
    	        ].join("")
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
            	fn: "onLinkFacebookAccountButtonTapped"
			},
        ]
    },
    
    // Event firings
    onLinkFacebookAccountButtonTapped: function() {
        alert("Link to fb account tapped");
    }
    
});