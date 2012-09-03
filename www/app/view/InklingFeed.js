Ext.define("inkle.view.InklingFeed", {
	extend: "Ext.Container",
	
	xtype: "inklingFeedView",
	
	config: {
		layout: "card",
		
    	items: [
    		// Inkling feed list
			{
				xtype: "list",
				id: "inklingFeedList",
				loadingText: "Loading inkling feed...",
				emptyText: "<div class='emptyListText'>No feed items</div>",
				disableSelection: true,
				scrollable: {
					initialOffset: { x: 0, y: 10000000 }
				},
				itemTpl: [
					"{ html }"
				],
				store: {
					fields: [
						"html"
					],
					proxy: {
						type: "ajax",
						url: "http://127.0.0.1:8000/sencha/inklingFeed/",
						actionMethods: {
							read: "POST"
						}
					},
					autoLoad: false
				}
			},
			
			// New comment toolbar
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