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
    	                "<p>To share inkle with facebook friends you need to link your inkle account to facebook.</p>",
    	                "<p>Once you do, you will need to login with your facebook account instead of your email.</p>",
    	            "</div>",
    	        ].join("")
		    },
            {
                xtype: "button",
                centered: true,
                id: "linkFacebookAccountButton",
                cls: "facebookLoginButton",
                pressedCls: "facebookLoginDarkButton",
            	margin: '40 0 0 0',
            	height: 50,
            	width: 230,
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
        this.fireEvent("linkFacebookAccountTapped");
    }
    
});