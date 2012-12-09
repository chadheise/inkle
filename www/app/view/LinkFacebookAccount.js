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
		        html: [
		            "<div>",
		            "   <span>To find facebook friends you need to register your inkle account through facebook. ",
		            "Once you do so, you will no longer log in to inkle with your email and password and will use your facebook account instead.</span>",
		            "</div>",
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
                ]
            },
    	],
    	
    	listeners: [
    		{
            	delegate: "#inviteFacebookFriendsBackButton",
            	event: "tap",
            	fn: "onInviteFacebookFriendsBackButtonTapped"
        	},
        ]
    },
    
    // Event firings
	onInviteFacebookFriendsBackButtonTapped: function() {
        alert("Invite Facebook Friends Back");
    },
    
});