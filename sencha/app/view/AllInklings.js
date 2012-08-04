Ext.define("inkle.view.AllInklings", {
	extend: "Ext.navigation.View",
	
	xtype: "allInklingsView",
	
    requires: [
    	"Ext.picker.Date"
    ],
	
	config: {
		// Tab title and icon
		title: "All Inklings",
		iconCls: "home",
    	
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
    			{
                    xtype: "button",
                    ui: "action",
                    text: "All Blots",
                    align: "right",
                    itemId: "allInklingsBlotsButton",
                    data: {
                       	"blotId": -1
                	}
                },
    		]
    	},*/
    	
    	items: [
			// Top toolbar
    		{
    			xtype: "toolbar",
                docked: "top",
                itemId: "allInklingsTopToolbar",
                items: [
                	{
                		xtype: "button",
                		ui: "action",
                		itemId: "allInklingsDateButton"
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
                		ui: "back",
                		text: "All Inklings",
                		itemId: "allInklingsInklingBackButton",
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
                    	html: "<img style='padding-top:2px; height: 35px;' src='resources/images/calendar.png' />",
                    	centered: true
                    },
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "All Blots",
                        itemId: "allInklingsBlotsButton",
                        data: {
                        	"blotId": -1
                        }
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
                        text: "Save",
                        itemId: "saveInklingButton",
                        hidden: true
                    },
                    {
                        xtype: "button",
                        ui: "action",
                        text: "Feed",
                        itemId: "inklingFeedButton",
                        hidden: true
                    }
                ]
    		},
    		
    		// Main content
    		{
    			xtype: "htmlcontainer",
    			itemId: "allInklingsHtmlContainer",
    			title: "<img style='height: 40px; padding-top: 5px;' src='resources/images/calendar.png' />",
    			scrollable: true,
				url: "http://127.0.0.1:8000/sencha/allInklings/"
    		},
        	
        	// Date picker
        	{
        		xtype: "datepicker",
        		itemId: "allInklingsDatePicker",
        		hidden: true,
        		enter: "top",
        		exit: "top",
        		top: 0,
        		yearFrom: 2012,
        		yearTo: 2012
        	},
        	
        	// Blots picker
        	{
        		xtype: "picker",
        		itemId: "allInklingsBlotsPicker",
        		hidden: true,
        		enter: "top",
        		exit: "top",
        		top: 0,
        		slots: [
        			{
        				name: "blot",
        				store: {
        					fields: ["text", "value"],
        					proxy: {
        						type: "ajax",
        						//url: "http://127.0.0.1:8000/sencha/blotNames/",
        						actionMethods: {
        							read: "POST"
        						},
        						url: "http://127.0.0.1:8000/sencha/blots/",
        						extraParams: {
                    				includeAllBlotsBlot: "true",
                    				inviteesMode: "true"
								},
        						reader: {
        							type: "json",
        							rootProperty: "blots"
        						}
        					},
        					autoLoad: true
        				}
        			}
        		]
        	}
    	],
    	
    	listeners: [
			{
            	delegate: "#allInklingsDateButton",
            	event: "tap",
            	fn: "onAllInklingsDateButtonTap"
        	},
			{
            	delegate: "#allInklingsBlotsButton",
            	event: "tap",
            	fn: "onAllInklingsBlotsButtonTap"
        	},
        	{
            	delegate: "#allInklingsDatePicker",
            	event: "change",
            	fn: "onAllInklingsDatePickerChange"
        	},
        	{
            	delegate: "#allInklingsBlotsPicker",
            	event: "change",
            	fn: "onAllInklingsBlotsPickerChange"
        	},
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
				event: "tap",
				element: "element",
				delegate: ".inkling",
				fn: "onInklingTap"
        	}
        ]
	},
	
	// Event firings
    onAllInklingsDateButtonTap: function() {
        this.fireEvent("allInklingsDateButtonTapped");
    },
    
    onAllInklingsBlotsButtonTap: function() {
        this.fireEvent("allInklingsBlotsButtonTapped");
    },
    
    onAllInklingsDatePickerChange: function(picker, value, options) {
        this.fireEvent("allInklingsDatePickerChanged", picker, value);
    },
    
    onAllInklingsBlotsPickerChange: function(picker, value, options) {
        this.fireEvent("allInklingsBlotsPickerChanged", picker, value["blot"]);
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
    
    onInklingTap: function(event) {
        var tappedInklingId = event.getTarget(".inkling").getAttribute("inklingId");
        this.fireEvent("inklingTapped", tappedInklingId);
    }
});