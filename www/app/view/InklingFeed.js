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
				itemTpl: [
					"{ html }"
				],
				store: {
					fields: [
						"html"
					],
					proxy: {
						type: "ajax",
						url: inkle.app.baseUrl + "/inklingFeed/",
						actionMethods: {
							read: "POST"
						}
					},
					autoLoad: false
				},
                
                plugins: [
                    {
                        xclass: "Ext.plugin.PullRefresh",
                        refreshFn: function(plugin) {
                            plugin.up().fireEvent("pullToRefresh");
                        }
                    }
                ]
			},
            
            // Add comment panel
            {
                xtype: "panel",
                id: "addCommentPanel",
                hidden: true,
                top: 0,
                width: 300,
                height: 220,
                layout: "vbox",
                items: [
                    {
                        xtype: "textareafield",
                        //useClearIcon: false,
                        itemId: "addCommentTextField",
                        placeHolder: "Add a comment...",
                        width: "100%",
                        height: 175,
                        maxLength: 150
                    },
                    {
                        xtype: "button",
                        itemId: "addCommentPostButton",
                        disabled: true,
                        text: "Post",
                        width: 100,
                        align: "center"
                    }
				],
				
				listeners: [
                    {
                        delegate: "#addCommentTextField",
                        event: "change",
                        fn: "onAddCommentTextFieldKeyup"
                    },
                    {
                        delegate: "#addCommentPostButton",
                        event: "tap",
                        fn: "onAddCommentPostButtonTap"
                    },
                ],
    
                // Event firings
                onAddCommentTextFieldKeyup: function() {
                    this.fireEvent("addCommentTextFieldKeyedUp");
                },
                
                onAddCommentPostButtonTap: function() {
                    this.fireEvent("addCommentPostButtonTapped");
                }
			}
        ],

        listeners: [
            {
                delegate: "#inklingFeedList",
                event: "pullToRefresh",
                fn: "onInklingFeedListRefresh"
            }
        ]
    },

    /* Event firings */
    onInklingFeedListRefresh: function() {
        this.fireEvent("inklingFeedListRefreshed");
    }
});
