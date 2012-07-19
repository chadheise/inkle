Ext.define("inkle.controller.AllInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
        	mainTabView: "mainTabView",
            allInklingsView: "allInklingsView",
            inklingView: "inklingView",
            inklingFeedView: "inklingFeedView",
            
            // Elements
            datePicker: "#allInklingsDatePicker",
            blotsPicker: "#allInklingsBlotsPicker",
            allInklingsDateButton: "#allInklingsDateButton",
            allInklingsBlotsButton: "#allInklingsBlotsButton",
            allInklingsInklingBackButton: "#allInklingsInklingBackButton",
            inklingFeedBackButton: "#inklingFeedBackButton",
            inklingFeedButton: "#inklingFeedButton",
            joinInklingButton: "#joinInklingButton",
            saveInklingButton: "#saveInklingButton",
            newCommentTextField: "#newCommentTextField",
            newCommentSendButton: "#newCommentSendButton",
            allInklingsHtmlContainer: "#allInklingsHtmlContainer"
        },
        
        control: {
            allInklingsView: {
            	// View transitions
            	inklingTapped: "activateInklingView",
            	
            	// Commands
                allInklingsDateButtonTapped: "showDatePicker",
                allInklingsBlotsButtonTapped: "showBlotsPicker",
                allInklingsDatePickerChanged: "changeDate",
                allInklingsBlotsPickerChanged: "changeBlot"
            }
        }
    },
	
	
	/**********************/
	/*  VIEW TRANSITIONS  */
	/**********************/
	
	/* Activates the inkling view from the all inklings view */
	activateInklingView: function (inklingId) {
		// Display the appropriate top toolbar buttons
		this.getAllInklingsDateButton().hide();
		this.getAllInklingsBlotsButton().hide();
		this.getAllInklingsInklingBackButton().show();
		
		// Determine if the current member is attending the clicked inkling
		var isMemberInkling;
		Ext.Ajax.request({
    		async: false,
    		url: "http://127.0.0.1:8000/sencha/isMemberInkling/",
    		params: {
    			inklingId: inklingId
    		},
		    success: function(response) {
        		isMemberInkling = response.responseText;
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
		
		// If the current member is attending the clicked inkling, show the "Feed" button; otherwise, show the "Join" button
		if (isMemberInkling === "True") {
			this.getInklingFeedButton().show();
		}
		else {
			this.getJoinInklingButton().show();
    	}
    	
    	// Push the inkling view onto the all inklings view	
    	this.getAllInklingsView().push({
        	xtype: "inklingView",
        	data: {
        		inklingId: inklingId,
        	}
        });
    },


    /**********************/
	/*  HELPER FUNCTIONS  */
	/**********************/
	
	/* Returns the day string associated with the inputted index */
	getDayString: function(index) {
		var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		return days[index];
	},
	
	/* Returns the month string associated with the inputted index */
	getMonthString: function(index) {
		months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
		return months[index];
	},
    	
    	
    /**************/
	/*  COMMANDS  */
	/**************/

    /* Un-hides the date picker */
    showDatePicker: function() {
        // Hide the blots picker
        this.getBlotsPicker().hide();
        
        // Un-hide the date picker
	    this.getDatePicker().show();
    },
    
    /* Un-hides the blots picker */
    showBlotsPicker: function() {
        // Hide the date picker
        this.getDatePicker().hide();
        
        // Un-hide the blots picker
	    this.getBlotsPicker().show();
    },
    
    /* Changes the date on the date picker and updates the HTML for the all inklings view */
    changeDate: function(datePicker, datePickerDate) {
	    // Update the date picker
	    datePicker.setValue(datePickerDate);
	    
	    // Get the selected date into usable variables
	    var dayOfWeek = datePickerDate.getDay();
	    var day = datePickerDate.getDate();
	    var month = datePickerDate.getMonth();
	    
	    // Update the all inklings date button text
	    this.getAllInklingsDateButton().setText(this.getDayString(dayOfWeek) + ", " + this.getMonthString(month) + " " + day);
    
    	// Get the new HTML for the all inklings view
    	var html;
    	Ext.Ajax.request({
    		async: false,
    		url: "http://127.0.0.1:8000/sencha/allInklings/",
    		params: {
    			day: day,
    			month: month + 1,
    			year: 2012,
    			blotId: this.getAllInklingsBlotsButton().getData()["blotId"]
    		},
		    success: function(response) {
		    	html = response.responseText;
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
		
		// Update the HTML for the all inklings view
		this.getAllInklingsHtmlContainer().setHtml(html);
    },
    
    /* Changes the selected blot on the date picker and updates the HTML for the all inklings view */
    changeBlot: function(blotsPicker, blotsPickerValue) {
		// Update the blots picker and picker button text if the value has changed
		var allInklingsBlotsButton = this.getAllInklingsBlotsButton();
		if (allInklingsBlotsButton.getData()["blotId"] != blotsPickerValue) {
			// Update the blots picker
	    	blotsPicker.setValue(blotsPickerValue);

	    	// Update the all inklings blots button text and data
	    	blotsPickerText = blotsPicker.getActiveItem()["selectedNode"]["innerText"];
	    	allInklingsBlotsButton.setText(blotsPickerText);
	    	allInklingsBlotsButton.setData({
	    		"blotId" : blotsPickerValue
	    	});
    	}
    	
    	// Get the selected date into usable variables
	    var datePickerDate = this.getDatePicker().getValue();
	    var dayOfWeek = datePickerDate.getDay();
	    var day = datePickerDate.getDate();
	    var month = datePickerDate.getMonth();
	    
    	// Get the new HTML for the all inklings view
    	var html;
    	Ext.Ajax.request({
    		async: false,
    		url: "http://127.0.0.1:8000/sencha/allInklings/",
    		params: {
    			day: day,
    			month: month + 1,
    			year: 2012,
    			blotId: blotsPickerValue
    		},
		    success: function(response) {
		    	html = response.responseText;
        	},
        	failure: function(response) {
        		Ext.Msg.alert("Error", response.responseText);
        	}
		});
		
		// Update the HTML for the all inklings view
		this.getAllInklingsHtmlContainer().setHtml(html);
    },
    
    
    /**************************/
	/*  BASE CLASS FUNCTIONS  */
	/**************************/
    launch: function () {    
        this.callParent(arguments);
        
        // If the main tab view is created, set the date and blots picker
        if (this.getMainTabView()) {
			// Set the value of the date picker
			var datePicker = this.getDatePicker();
			today = new Date();
			datePicker.setValue(today);
			
			// Set the date of the date picker button
			var allInklingsDateButton = this.getAllInklingsDateButton();
			var day = this.getDayString(today.getDay());
			var date = today.getDate();
			var month = this.getMonthString(today.getMonth());
			allInklingsDateButton.setText(day + ", " + month + " " + date);
		
			// Set the blots picker to "All Blots"
			var blotsPicker = this.getBlotsPicker();
			blotsPicker.setValue({
				blot: -1
			});
		}
    },
    
    init: function () {
        this.callParent(arguments);
    }
});