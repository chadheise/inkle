Ext.define("inkle.view.AllInklings", {
	extend: "Ext.navigation.View",
	
	xtype: "allInklingsView",
	
    requires: [
    	"Ext.picker.Date"
    ],
	
	config: {
		// Tab title and icon
		title: "All Inklings",
		iconCls: "allInklings",
    	
    	// Hide the navigation bar
    	navigationBar: false,
    	
    	// Navigation bar
    	/*navigationBar: {
    		items: [
    			{
                	xtype: "button",
                	ui: "action",
                	itemId: "allInklingsDateButton"
                },
			 	//{ xtype: "spacer" },
				{
					xtype: "container",
					html: "<img style='padding-top:2px; height: 45px;' src='resources/images/mainInkleIcon.png' />",
					//align: "center",
					centered: true
				},
				//{ xtype: "spacer" },
    			{
                    xtype: "button",
                    ui: "action",
                    text: "All Groups",
                    align: "right",
                    itemId: "allInklingsGroupsButton",
                    data: {
                       	"groupId": -1
                	}
                },
    		]
    	},*/
    	
    	items: [
			// Top toolbar
    		{
    			xtype: "toolbar",
    			id: "allInklingsTopToolbar",
                docked: "top",
                items: [
                	{
                		xtype: "button",
                		ui: "action",
                		itemId: "allInklingsDateButton",
                		showAnimation: {
                			type: "fadeIn",
                			direction: "right",
                			delay: 150
                		},
                		hideAnimation: {
                			type: "slideOut",
                			fade: true,
                			direction: "left"
                		}
                	},
                	{
                		xtype: "button",
                		ui: "back",
                		text: "All Inklings",
                		itemId: "allInklingsInklingBackButton",
                		hidden: true,
                		showAnimation: {
                			type: "fadeIn",
                			direction: "left",
                			delay: 150
                		},
                		hideAnimation: {
                			type: "slideOut",
                			direction: "right"
                		}
                	},
                	{
                		xtype: "button",
                		ui: "back",
                		text: "Inkling",
                		itemId: "inklingFeedBackButton",
                		hidden: true
                	},
                	{
                		xtype: "button",
                		ui: "action",
                		text: "Cancel",
                		itemId: "cancelEditInklingButton",
                		hidden: true
                	},
                    { xtype: "spacer" },
                    {
                    	xtype: "container",
                    	html: "<img style='padding-top:2px; height: 45px;' src='resources/images/mainInkleIcon.png' />",
                    	centered: true
                    },
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Groups",
                        itemId: "allInklingsGroupsButton",
                		showAnimation: {
                			type: "fadeIn",
                			direction: "right",
                			delay: 150
                		},
                		hideAnimation: {
                			type: "slideOut",
                			direction: "left"
                		}
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Join",
                        itemId: "joinInklingButton",
                        hidden: true,
                        showAnimation: {
                			type: "fadeIn",
                			direction: "left",
                			delay: 150
                		},
                		hideAnimation: {
                			type: "slideOut",
                			direction: "right"
                		}
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        iconMask: true,
                		iconCls: "feed",
                        //text: "Feed",
                        itemId: "inklingFeedButton",
                        hidden: true,
                        showAnimation: {
                			type: "fadeIn",
                			direction: "left",
                			delay: 150
                		},
                		hideAnimation: {
                			type: "slideOut",
                			direction: "right"
                		}
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Save",
                        itemId: "saveInklingButton",
                        hidden: true
                    }
                ]
    		},

    		// All inklings list
    		{
    			xtype: "list",
				id: "allInklingsList",
				loadingText: "Loading inklings...",
				emptyText: "<div class='emptyListText'>No inklings</div>",
				disableSelection: true,
				itemTpl: [
					"{ html }"
				],
				store: {
					fields: [
						"id",
						"html"
					],
					proxy: {
						type: "ajax",
						actionMethods: {
							read: "POST"
						},
						url: "http://127.0.0.1:8000/sencha/allInklings/"
					},
					autoLoad: true
				}
    		},

        	// Date picker
        	{
        		xtype: "panel",
        		id: "allInklingsDatePickerPanel",
        		hidden: true,
        		top: 0,
        		width: "100%",
        		height: 220,
        		layout: "fit",
        		items: [
        			{
						xtype: "datepicker",
						itemId: "allInklingsDatePicker",
						showAnimation: "fadeIn",
						hideAnimation: "fadeOut",
						yearFrom: 2012,
						yearTo: 2012,
						toolbar: false,
						doneButton: false,
						cancelButton: false
					}
				]
			},
        	
        	// Groups list
        	{
        		xtype: "panel",
        		id: "allInklingsGroupsListPanel",
        		hidden: true,
        		top: 0,
        		width: 250,
        		height: 300,
        		layout: "fit",
        		items: [
        			{
						xtype: "list",
						id: "allInklingsGroupsList",
						loadingText: "Loading groups...",
						emptyText: "<div class='emptyListText'>No groups to invite</div>",
						disableSelection: true,
						itemTpl: "{ html }",
						store: {
							fields: [
								"id",
								"html"
							],
							proxy: {
								type: "ajax",
								actionMethods: {
									read: "POST"
								},
								url: "http://127.0.0.1:8000/sencha/groups/",
								extraParams: {
									view: "allInklings"
								}
							},
							autoLoad: true
						}
					}
				],
				
				listeners: [
					{
						event: "tap",
						element: "element",
						delegate: "#allInklingsGroupsList .selectionButton",
						fn: "onGroupSelectionButtonTap"
					},
				],
				
				onGroupSelectionButtonTap: function(event, target) {
					var groupSelectionButton = Ext.fly(target);
					this.fireEvent("groupSelectionButtonTapped", groupSelectionButton);
				}
			}
    	],
    	
    	listeners: [
    		/* All inklings view */
			{
            	delegate: "#allInklingsDateButton",
            	event: "tap",
            	fn: "onAllInklingsDateButtonTap"
        	},
			{
            	delegate: "#allInklingsGroupsButton",
            	event: "tap",
            	fn: "onAllInklingsGroupsButtonTap"
        	},
        	{
				event: "tap",
				element: "element",
				delegate: ".inkling",
				fn: "onInklingTap"
        	},
        	
        	/* Not all inklings view */
        	{
            	delegate: "#allInklingsInklingBackButton",
            	event: "tap",
            	fn: "onAllInklingsInklingBackButtonTap"
        	},
        	{
            	delegate: "#inklingFeedBackButton",
            	event: "tap",
            	fn: "onInklingFeedBackButtonTap"
        	},
        	{
            	delegate: "#joinInklingButton",
            	event: "tap",
            	fn: "onJoinInklingButtonTap"
        	},
        	{
            	delegate: "#saveInklingButton",
            	event: "tap",
            	fn: "onSaveInklingButtonTap"
        	},
        	{
            	delegate: "#cancelEditInklingButton",
            	event: "tap",
            	fn: "onCancelEditInklingButtonTap"
        	},
        	{
            	delegate: "#inklingFeedButton",
            	event: "tap",
            	fn: "onInklingFeedButtonTap"
        	}
        ]
	},
	
	// Event firings
    onAllInklingsDateButtonTap: function() {
        this.fireEvent("allInklingsDateButtonTapped");
    },
    
    onAllInklingsGroupsButtonTap: function() {
        this.fireEvent("allInklingsGroupsButtonTapped");
    },
    
    onInklingTap: function(event) {
        var tappedInklingId = event.getTarget(".inkling").getAttribute("inklingId");
        this.fireEvent("inklingTapped", tappedInklingId);
    },
    
    
    
    
    onAllInklingsInklingBackButtonTap: function() {
        this.fireEvent("allInklingsInklingBackButtonTapped");
    },
    
    onInklingFeedBackButtonTap: function() {
        this.fireEvent("inklingFeedBackButtonTapped");
    },
    
    onInklingFeedButtonTap: function() {
        this.fireEvent("inklingFeedButtonTapped");
    },
    
    onJoinInklingButtonTap: function() {
        this.fireEvent("joinInklingButtonTapped");
    },
    
    onSaveInklingButtonTap: function() {
        this.fireEvent("saveInklingButtonTapped");
    },
    
    onCancelEditInklingButtonTap: function() {
        this.fireEvent("cancelEditInklingButtonTapped");
    }
});