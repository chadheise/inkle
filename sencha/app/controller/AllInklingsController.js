Ext.define("inkle.controller.AllInklingsController", {
    extend: "Ext.app.Controller",
    
    config: {
        refs: {
        	// Views
        	mainTabView: "mainTabView",
            allInklingsView: "allInklingsView",
            allInklingsGroupsListPanel: "panel[id=allInklingsGroupsListPanel]",
            allInklingsDatePickerPanel: "panel[id=allInklingsDatePickerPanel]",
            inklingView: "inklingView",
            inklingFeedView: "inklingFeedView",
            
            // Toolbar buttons
            allInklingsDateButton: "#allInklingsDateButton",
            allInklingsGroupsButton: "#allInklingsGroupsButton",
            
            // Elements
            allInklingsList: "#allInklingsList",
            allInklingsDatePicker: "#allInklingsDatePicker",
            
            
            
            
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
                allInklingsDateButtonTapped: "toggleDatePickerVisibility",
                allInklingsGroupsButtonTapped: "toggleGroupsListVisibility",
                allInklingsDatePickerChanged: "changeDate",
                allInklingsGroupsPickerChanged: "changeGroup",
                deactivate: "hideAllInklingsPanels"
            },
            
            allInklingsGroupsListPanel: {
            	groupSelectionButtonTapped: "toggleGroupSelectionButton"
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
		this.getAllInklingsGroupsButton().hide();
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

	// Hides the all inklings panels
	hideAllInklingsPanels: function() {
		var allInklingsDatePickerPanel = this.getAllInklingsDatePickerPanel();
		if (allInklingsDatePickerPanel) {
			allInklingsDatePickerPanel.hide();
		}
		
		var allInklingsGroupsListPanel = this.getAllInklingsGroupsListPanel();
		if (allInklingsGroupsListPanel) {
			allInklingsGroupsListPanel.hide();
		}
	},

    /* Un-hides the date picker */
    toggleDatePickerVisibility: function() {
        // Hide the groups list
        this.getAllInklingsGroupsListPanel().hide();
        
	    // Toggle the visibility of the  date picker
	    var allInklingsDatePickerPanel = this.getAllInklingsDatePickerPanel();
	    if (allInklingsDatePickerPanel.getHidden()) {
	    	allInklingsDatePickerPanel.showBy(this.getAllInklingsDateButton());
    	}
    	else {
    		this.changeDate(this.getAllInklingsDatePicker().getValue());
    		allInklingsDatePickerPanel.hide();
    	}
    },
    
    /* Toggles the visibility of the groups list */
    toggleGroupsListVisibility: function() {
        // Hide the date picker
        this.getAllInklingsDatePickerPanel().hide();
        
        // Toggle the visibility of the groups panel
	    var allInklingsGroupsListPanel = this.getAllInklingsGroupsListPanel();
	    if (allInklingsGroupsListPanel.getHidden()) {
	    	allInklingsGroupsListPanel.showBy(this.getAllInklingsGroupsButton());
    	}
    	else {
    		allInklingsGroupsListPanel.hide();
    	}
    },
    
    // Toggles the state of the inputted group selection button and re-loads the all inklings list
    toggleGroupSelectionButton: function(groupId) {
		// Get the group selection button
		var groupSelectionButton = Ext.fly("allInklingsGroup" + groupId + "SelectionButton");
		
		// If the group selection button is selected, deselect it
		if (groupSelectionButton.getAttribute("src") == "resources/images/selected.png") {
			groupSelectionButton.set({
				"src": "resources/images/deselected.png"
			});
		}
		
		// Otherwise, select the group selection button
		else {
			groupSelectionButton.set({
				"src": "resources/images/selected.png"
			});
		}
		
		// Create the comma-separated string of selected groups
		var selectedGroupIds = "";
		var groupSelectionButtons = Ext.query(".group .selectionButton");
		for (var i = 0; i < groupSelectionButtons.length; i++) {
			var groupSelectionButton = Ext.fly(groupSelectionButtons[i].getAttribute("id"));
			if (groupSelectionButton.getAttribute("src") == "resources/images/selected.png") {
				selectedGroupIds = selectedGroupIds + groupSelectionButton.getAttribute("groupId") + ",";
			}
		}
		
		// Update the date picker
	    var date = this.getAllInklingsDatePicker().getValue();
	    
	    // Get the selected date into usable variables
	    var dayOfWeek = date.getDay();
	    var day = date.getDate();
	    var month = date.getMonth();
	    var year = 2012;
		
		// Update the all inklings list
		var allInklingsListStore = this.getAllInklingsList().getStore();
		allInklingsListStore.setProxy({
			extraParams: {
				selectedGroupIds: selectedGroupIds,
				day: day,
    			month: month + 1,
    			year: year
			}
		});
		
		allInklingsListStore.load();
	},
    
    /* Changes the date on the date picker and updates the HTML for the all inklings view */
    changeDate: function(date) {
	    // Update the date picker
	    this.getAllInklingsDatePicker().setValue(date);
	    
	    // Get the selected date into usable variables
	    var dayOfWeek = date.getDay();
	    var day = date.getDate();
	    var month = date.getMonth();
	    var year = 2012;
	    
	    // Update the all inklings date button text
	    this.getAllInklingsDateButton().setText(this.getDayString(dayOfWeek) + ", " + this.getMonthString(month) + " " + day);
    
    	// Create the comma-separated string of selected groups
		var selectedGroupIds = "";
		var groupSelectionButtons = Ext.query(".group .selectionButton");
		for (var i = 0; i < groupSelectionButtons.length; i++) {
			var groupSelectionButton = Ext.fly(groupSelectionButtons[i].getAttribute("id"));
			if (groupSelectionButton.getAttribute("src") == "resources/images/selected.png") {
				selectedGroupIds = selectedGroupIds + groupSelectionButton.getAttribute("groupId") + ",";
			}
		}
    
    	// Update the all inklings list
		var allInklingsListStore = this.getAllInklingsList().getStore();
		allInklingsListStore.setProxy({
			extraParams: {
				selectedGroupIds: selectedGroupIds,
				day: day,
    			month: month + 1,
    			year: year
			}
		});
		
		allInklingsListStore.load();
    	
    
    	// Get the new HTML for the all inklings view
    	/*
    	var html;
    	Ext.Ajax.request({
    		async: false,
    		url: "http://127.0.0.1:8000/sencha/allInklings/",
    		params: {
    			day: day,
    			month: month + 1,
    			year: 2012,
    			groupId: this.getAllInklingsGroupsButton().getData()["groupId"]
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
		*/
    },
    
    /* Changes the selected group on the date picker and updates the HTML for the all inklings view */
    /*changeGroup: function(groupsPicker, groupsPickerValue) {
		// Update the groups picker and picker button text if the value has changed
		var allInklingsGroupsButton = this.getAllInklingsGroupsButton();
		if (allInklingsGroupsButton.getData()["groupId"] != groupsPickerValue) {
			// Update the groups picker
	    	groupsPicker.setValue(groupsPickerValue);

	    	// Update the all inklings groups button text and data
	    	groupsPickerText = groupsPicker.getActiveItem()["selectedNode"]["innerText"];
	    	allInklingsGroupsButton.setText(groupsPickerText);
	    	allInklingsGroupsButton.setData({
	    		"groupId" : groupsPickerValue
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
    			groupId: groupsPickerValue
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
    */
    
    /**************************/
	/*  BASE CLASS FUNCTIONS  */
	/**************************/
    launch: function () {    
        this.callParent(arguments);
        
        // If the main tab view is created, set the date and groups picker
        if (this.getMainTabView()) {
			// Set the value of the date picker
			var allInklingsDatePicker = this.getAllInklingsDatePicker();
			today = new Date();
			allInklingsDatePicker.setValue(today);
			
			// Set the date of the date picker button
			var allInklingsDateButton = this.getAllInklingsDateButton();
			var day = this.getDayString(today.getDay());
			var date = today.getDate();
			var month = this.getMonthString(today.getMonth());
			allInklingsDateButton.setText(day + ", " + month + " " + date);
		}
    }
});