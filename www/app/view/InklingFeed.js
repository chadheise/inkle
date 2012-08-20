Ext.define("inkle.view.InklingFeed", {
	extend: "Ext.HTMLContainer",
	
	xtype: "inklingFeedView",
	
	config: {
		scrollable: true,
		
    	url: "http://127.0.0.1:8000/sencha/inklingFeed/",
    	
    	items: [
			// Bottom toolbar
    		{
    			xtype: "toolbar",
                docked: "bottom",
                items: [
                	{
                		xtype: "textfield",
                		itemId: "newCommentTextField",
                		placeHolder: "Add a comment...",
                		maxLength: 150,
                		flex: 6
                	},	
                	{
                		xtype: "button",
                		itemId: "newCommentSendButton",
                		disabled: true,
                		text: "Send",
                		flex: 1
                	}
                ]
            }
        ],
        
        listeners: [
        	{
        		delegate: "#newCommentTextField",
        		event: "keyup",
        		fn: "onNewCommentTextFieldKeyup"
        	},
        	{
            	delegate: "#newCommentSendButton",
            	event: "tap",
            	fn: "onNewCommentSendButtonTap"
        	}
        ]
    },
    
    // Event firings
    onNewCommentTextFieldKeyup: function() {
        this.fireEvent("newCommentTextFieldKeyedUp");
    },
    
    onNewCommentSendButtonTap: function() {
        this.fireEvent("newCommentSendButtonTapped");
    }
});