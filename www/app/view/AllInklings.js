Ext.define("inkle.view.AllInklings", {
	extend: "Ext.navigation.View",
	
	xtype: "allInklingsView",
	
    requires: [
    	"Ext.TouchCalendar",
    	"Ext.plugin.PullRefresh"
    ],
	
	config: {
		// Tab title and icon
		title: "All Inklings",
		iconCls: "allInklingsIcon",
    	
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
                ui: "customToolbar",
                items: [
                	{
                		xtype: "button",
                		ui: "action",
                		itemId: "allInklingsDateButton"
                	},
                	{
                		xtype: "button",
                		ui: "back",
                		//ui: "customPressedCls",
                		text: "All Inklings",
                		itemId: "allInklingsInklingBackButton",
                		hidden: true
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
                    	html: "<img style='padding-top:2px; height: 46px;' src='resources/images/icons/inkleIcon.png' />",
                    	centered: true
                    },
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        ui: "action",
                        //pressedCls: 'customPressedCls',
                        text: "Groups",
                        itemId: "allInklingsGroupsButton"
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Join",
                        itemId: "joinInklingButton",
                        hidden: true
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        iconMask: true,
                		iconCls: "feedIcon",
                        itemId: "inklingFeedButton",
                        hidden: true
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Save",
                        itemId: "saveInklingButton",
                        hidden: true
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        iconMask: true,
                        iconCls: "plusIcon",
                        itemId: "addCommentButton",
                        hidden: true
                    }
                ]
    		},

    		// All inklings list
    		{
    			xtype: "list",
				id: "allInklingsList",
                cls: "inklingList",
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
						extraParams: {
                            onlyIncludeNoDatedInklings: "false"
                        },
						url: "http://127.0.0.1:8000/sencha/allInklings/"
					},
					autoLoad: true
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

        	// Date picker
        	{
        		xtype: "panel",
        		id: "allInklingsDatePickerPanel",
        		hidden: true,
        		top: 0,
        		width: 300,
        		height: 275,
        		layout: "fit",
        		items: [
        			/*{
						xtype: "datepicker",
						itemId: "allInklingsDatePicker",
						showAnimation: "fadeIn",
						hideAnimation: "fadeOut",
						yearFrom: 2012,
						yearTo: 2012,
						toolbar: false,
						doneButton: false,
						cancelButton: false,
						value: new Date(),
						top: 0,
						height: 220
					},*/
					{
					    xtype: "calendar",
					    itemId: "allInklingsDatePicker",
                        height: 220,
                        viewConfig: {
                            viewMode: "month",
                            weekStart: 0,
                            value: new Date()
                        } 
                    },
					{
					    xtype: "checkboxfield",
					    id: "noDatedInklingsCheckbox",
                        label: "Include inklings with no date",
                        top: 221,
                        width: 300,
                        labelWidth: 250,
                        checked: false
					}
            	],
				
				listeners: [
                    {
                        delegate: "#noDatedInklingsCheckbox",
                        event: "check",
                        fn: "onNoDatedInklingsCheckboxCheck"
                    },
                    {
                        delegate: "#noDatedInklingsCheckbox",
                        event: "uncheck",
                        fn: "onNoDatedInklingsCheckboxUncheck"
                    },
                    {
                        delegate: "#allInklingsDatePicker",
                        event: "selectionchange",
                        fn: "onAllInklingsDatePickerSelectionChange"
                    }
				],
    
                onNoDatedInklingsCheckboxCheck: function() {
                    this.fireEvent("noDatedInklingsCheckboxChecked");
                },
                
                onNoDatedInklingsCheckboxUncheck: function() {
                    this.fireEvent("noDatedInklingsCheckboxUnchecked");
                },
                
                onAllInklingsDatePickerSelectionChange: function(calendar, selectedDate, options) {
                    this.fireEvent("allInklingsDatePickerSelectionChanged", selectedDate);
                }
			},
        	
        	// Groups list
        	{
        		xtype: "panel",
        		id: "allInklingsGroupsListPanel",
                cls: "groupListPanel",
        		hidden: true,
        		top: 0,
        		width: 310,
        		height: 275,
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
								"html"
							],
							proxy: {
								type: "ajax",
								actionMethods: {
									read: "POST"
								},
								url: "http://127.0.0.1:8000/sencha/groupsPanel/",
								extraParams: {
									autoSetGroupsAsSelected: "true"
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
						delegate: ".selectionButton",
						fn: "onGroupSelectionButtonTap"
					},
				],
				
				onGroupSelectionButtonTap: function(event, target) {
					this.fireEvent("groupSelectionButtonTapped", Ext.fly(target));
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
        	    delegate: "#allInklingsList",
        	    event: "pullToRefresh",
        	    fn: "onAllInklingsListRefresh"
        	},
        	{
				event: "tap",
				element: "element",
				delegate: ".inklingListItem",
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
        	},
        	{
                delegate: "#addCommentButton",
                event: "tap",
                fn: "onAddCommentButtonTapped"
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
    
    onAllInklingsListRefresh: function() {
        this.fireEvent("allInklingsListRefreshed");
    },
    
    onInklingTap: function(event) {
        var tappedInklingId = event.getTarget(".inklingListItem").getAttribute("inklingId");
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
    },
    
    onAddCommentButtonTapped: function() {
        this.fireEvent("addCommentButtonTapped");
    }
});