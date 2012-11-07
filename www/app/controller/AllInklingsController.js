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
            noDatedInklingsCheckbox: "#noDatedInklingsCheckbox",
            
            allInklingsTopToolbar: "#allInklingsTopToolbar",
            inklingTopToolbar: "#inklingTopToolbar",
            
            
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
                allInklingsGroupsPickerChanged: "changeGroup",
                
                deactivate: "hideAllInklingsPanels",
                activeitemchange: "hideAllInklingsPanels",
            },
            
            allInklingsDatePickerPanel: {
                noDatedInklingsCheckboxChecked: "toggleDatePickerEnabled",
                noDatedInklingsCheckboxUnchecked: "toggleDatePickerEnabled"
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
		this.getAllInklingsGroupsButton().hide();
		this.getAllInklingsDateButton().hide();
		this.getAllInklingsInklingBackButton().show();
		
		// Determine if the current member is attending the clicked inkling
		Ext.Ajax.request({
    		url: "http://127.0.0.1:8000/sencha/isMemberInkling/",
    		params: {
    			inklingId: inklingId
    		},
		    success: function(response) {
        		// If the current member is attending the clicked inkling, show the "Feed" button; otherwise, show the "Join" button
				if (response.responseText === "True") {
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
						source: "allInklings"
					}
				});
        	},
        	failure: function(response) {
        		console.log(response.responseText);
        		Ext.Msg.alert("Error", "Something went wrong.");
        	},
        	scope: this
		});
    },

    /**********************/
	/*  HELPER FUNCTIONS  */
	/**********************/
	
	/* Returns the day string associated with the inputted index */
	getDayString: function(index) {
		var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return days[index];
	},
	
	/* Returns the month string associated with the inputted index */
	getMonthString: function(index) {
		months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
		return months[index];
	},
	
	/* Updates the all inklings list according to the selected date and groups */
	updateAllInklingsList: function() {
		// Get the selected date
		var date = this.getAllInklingsDatePicker().getValue();
	    var dayOfWeek = date.getDay();
	    var day = date.getDate();
	    var month = date.getMonth();
	    var year = 2012;
	    
	    // Update the all inklings date button text
	    this.getAllInklingsDateButton().setText(this.getDayString(dayOfWeek) + ", " + this.getMonthString(month) + " " + day);
    
    	// Create the comma-separated string of selected groups
		var selectedGroupIds = "";
		var groupSelectionButtons = Ext.query("#allInklingsGroupsList .selectionButton");
		for (var i = 0; i < groupSelectionButtons.length; i++) {
			var groupSelectionButton = Ext.fly(groupSelectionButtons[i]);
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
    			year: year,
    			onlyIncludeNoDatedInklings: this.getNoDatedInklingsCheckbox().isChecked()
			}
		});
		allInklingsListStore.load();
	},

    /**************/
	/*  COMMANDS  */
	/**************/

	/* Hides the all inklings panels */
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

    /* Toggles the visibility of the date picker */
    toggleDatePickerVisibility: function() {
        // Hide the groups list
        this.getAllInklingsGroupsListPanel().hide();
        
	    // Toggle the visibility of the date picker
	    var allInklingsDatePickerPanel = this.getAllInklingsDatePickerPanel();
	    if (allInklingsDatePickerPanel.getHidden()) {
	    	allInklingsDatePickerPanel.showBy(this.getAllInklingsDateButton());
    	}
    	else {
    		allInklingsDatePickerPanel.hide();
    		
    		// Update the all inklings list
    		this.updateAllInklingsList();
    	}
    },
    
    /* Toggles whether the date picker is enabled or disabled */
    toggleDatePickerEnabled: function() {
        var allInklingsDatePicker = this.getAllInklingsDatePicker();
        if (allInklingsDatePicker.getMasked()) {
            allInklingsDatePicker.setMasked(false);
        }
        else {
            allInklingsDatePicker.setMasked(true);
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
    
	/* Toggles the state of the inputted group selection button and updates the all inklings list */
    toggleGroupSelectionButton: function(groupSelectionButton) {
		// Toggle the selection button's image source
		if (groupSelectionButton.getAttribute("src") == "resources/images/selected.png") {
			groupSelectionButton.set({
				"src": "resources/images/deselected.png"
			});
		}
		else {
			groupSelectionButton.set({
				"src": "resources/images/selected.png"
			});
		}
		
		// Update the all inklings list
		this.updateAllInklingsList();
	},
    
    /**************************/
	/*  BASE CLASS FUNCTIONS  */
	/**************************/
	/* Controller launch() function */
    launch: function() {    
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