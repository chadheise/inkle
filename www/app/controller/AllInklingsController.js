Ext.define("inkle.controller.AllInklingsController", {
    extend: "Ext.app.Controller",

    config: {
        refs: {
            // Views
            mainTabView: "mainTabView",
            allInklingsView: "allInklingsView",
            allInklingsGroupsListPanel: "panel[id=allInklingsGroupsListPanel]",
            allInklingsDatePickerPanel: "panel[id=allInklingsDatePickerPanel]",
            allInklingsFeedCommentPanel: "panel[id=addCommentPanel]",
            inklingView: "inklingView",
            inklingFeedView: "inklingFeedView",

            // Toolbar buttons
            allInklingsDateButton: "#allInklingsDateButton",
            allInklingsGroupsButton: "#allInklingsGroupsButton",
            allInklingsAddCommentButton: "#allInklingsAddCommentButton",
            inklingInvitationsButton: "#inklingInvitationsButton",
            friendRequestsButton: "#friendsViewRequestsButton",

            // Elements
            allInklingsList: "#allInklingsList",
            allInklingsDatePicker: "#allInklingsDatePicker",

            allInklingsViewToolbar: "#allInklingsViewToolbar",
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
                inklingTapped: "transitionToInklingView",

                // Commands
                allInklingsDateButtonTapped: "toggleDatePickerVisibility",
                allInklingsGroupsButtonTapped: "toggleGroupsListVisibility",
                //allInklingsGroupsPickerChanged: "changeGroup",
                allInklingsListRefreshed: "reloadAllInklingsList",

                // Tab events
                deactivate: "deactivateAllInklingsView",
                activeitemchange: "activeItemChangeAllInklingsView",
                initialize: "initializeAllInklingsView",
            },

            allInklingsDatePickerPanel: {
                allInklingsDatePickerSelectionChanged: "updateDate",
                undatedInklingsCheckboxTapped: "toggleDatePickerEnabled"
            },

            allInklingsGroupsListPanel: {
                groupSelectionButtonTapped: "toggleGroupSelectionButton"
            }
        }
    },

    /**********************/
    /*  VIEW TRANSITIONS  */
    /**********************/
    /* Transitions to the inkling view */
    transitionToInklingView: function (inklingId, isMemberAttending) {
        // Display the appropriate top toolbar buttons
        this.getAllInklingsGroupsButton().hide();
        this.getAllInklingsDateButton().hide();
        this.getAllInklingsInklingBackButton().show();

        // If the current member is attending the tapped inkling, show the "Feed" button; otherwise, show the "Join" button
        if (isMemberAttending === "True") {
            this.getInklingFeedButton().show();
        }
        else {
            this.getJoinInklingButton().show();
        }

        // Get todays' date
        var today = new Date();

        // Push the inkling view onto the all inklings view
        this.getAllInklingsView().push({
            xtype: "inklingView",
            data: {
                inklingId: inklingId,
                timezoneOffset: today.getTimezoneOffset(),
                source: "allInklings",
                isMemberAttending: isMemberAttending
            }
        });

        // Update the top toolbar's title
        this.getAllInklingsViewToolbar().setTitle("Inkling");
    },


    /**********************/
    /*  HELPER FUNCTIONS  */
    /**********************/
    /* Returns the day string associated with the inputted index */
    getDayOfWeekString: function(index) {
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[index];
    },


    /* Returns the month string associated with the inputted index */
    getMonthString: function(index) {
        months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
        return months[index];
    },


    updateDate: function(date) {
        this.getAllInklingsDatePicker().setValue(date);
    },


    /*******************/
    /*  LIST UPDATING  */
    /*******************/
    /* Updates the all inklings list according to the selected date and groups */
    reloadAllInklingsList: function() {
        // Get the selected date
        var datePickerDate = this.getAllInklingsDatePicker().getValue();
        var dayOfWeek = datePickerDate.getDay();
        var date = datePickerDate.getDate();
        var month = datePickerDate.getMonth();
        var year = datePickerDate.getFullYear();

        // Update the all inklings date button text
        this.getAllInklingsDateButton().setText(this.getDayOfWeekString(dayOfWeek) + ", " + this.getMonthString(month) + " " + date);

        // Create the comma-separated string of selected groups
        var selectedGroupIds = "";
        var groupSelectionButtons = Ext.query("#allInklingsGroupsList .selectionButton");
        for (var i = 0; i < groupSelectionButtons.length; i++) {
            var groupSelectionButton = Ext.fly(groupSelectionButtons[i]);
            if (groupSelectionButton.hasCls("selected")) {
                selectedGroupIds = selectedGroupIds + groupSelectionButton.parent(".group").getAttribute("data-groupId") + ",";
            }
        }

        // Update the all inklings list
        var allInklingsListStore = this.getAllInklingsList().getStore();
        allInklingsListStore.clearFilter();
        allInklingsListStore.setProxy({
            extraParams: {
                selectedGroupIds: selectedGroupIds,
                day: date,
                month: month + 1,
                year: year,
                onlyIncludeUndatedInklings: Ext.fly(Ext.query("#undatedInklingsCheckbox")[0]).hasCls("selected")
            }
        });
        allInklingsListStore.load();
    },


    /* Filters the all inklings list to only show inklings being attended by the currently selected groups */
    filterAllInklingsList: function() {
        // Get the IDs of the selected groups in the groups panel
        var selectedGroupIds = new Array();
        Ext.get("allInklingsGroupsList").select(".selectionButton").each(function() {
            if (this.hasCls("selected")) {
                selectedGroupIds.push(this.parent(".group").getAttribute("data-groupId"));
            }
        });

        // Add in an entry to get the logged-in member's inklings
        selectedGroupIds.push("self");

        // Clear the all inklings list's filter
        var allInklingsListStore = this.getAllInklingsList().getStore();
        allInklingsListStore.clearFilter();

        // Create the new filter by finding the inklings being attended by at least one of the currently selected groups
        var selectedGroupsFilter = new Ext.util.Filter({
            filterFn: function(item) {
                var hideInkling = true;

                var attendingGroupIds = item.data.attendingGroupIds.split(",");
                for (var i = 0; i < selectedGroupIds.length; i++) {
                    if (attendingGroupIds.indexOf(selectedGroupIds[i]) != -1) {
                        hideInkling = false;
                        break;
                    }
                }
                return !hideInkling;
           }
        });

        // Apply the new filter
        allInklingsListStore.filter(selectedGroupsFilter);
    },


    /****************/
    /*  TAB EVENTS  */
    /****************/
    /* Initializes the all inklings view */
    initializeAllInklingsView: function() {
        var today = new Date();
        var dayOfWeek = this.getDayOfWeekString(today.getDay());
        var date = today.getDate();
        var month = this.getMonthString(today.getMonth());
        var year = today.getFullYear();

        // Set the date of the date picker button
        this.getAllInklingsDateButton().setText(dayOfWeek + ", " + month + " " + date);

        // Update the all inklings list
        var allInklingsListStore = this.getAllInklingsList().getStore();
        allInklingsListStore.setProxy({
            extraParams: {
                day: date,
                month: today.getMonth() + 1,
                year: year,
                onlyIncludeUndatedInklings: "false"
            }
        });
        allInklingsListStore.load();
    },


    /* Deactivates the all inklings view */
    deactivateAllInklingsView: function() {
        this.hideAllInklingsPanels();
    },


    /* Cleans up the all inklings view when it's active item is changed */
    activeItemChangeAllInklingsView: function() {
        this.hideAllInklingsPanels();
    },


    /**************/
    /*  COMMANDS  */
    /**************/
    /* Hides the all inklings panels */
    hideAllInklingsPanels: function() {
        var allInklingsDatePickerPanel = this.getAllInklingsDatePickerPanel();
        if (allInklingsDatePickerPanel) {
            allInklingsDatePickerPanel.hide();
            this.getAllInklingsDateButton().removeCls("x-button-pressed");
        }

        var allInklingsGroupsListPanel = this.getAllInklingsGroupsListPanel();
        if (allInklingsGroupsListPanel) {
            allInklingsGroupsListPanel.hide();
            this.getAllInklingsGroupsButton().removeCls("x-button-pressed");
        }

        var allInklingsFeedCommentPanel = this.getAllInklingsFeedCommentPanel();
        if (allInklingsFeedCommentPanel) {
            allInklingsFeedCommentPanel.hide();
            this.getAllInklingsAddCommentButton().removeCls("toolbarButtonPressed toolbarButtonPlusPressed");
            this.getAllInklingsAddCommentButton().setCls("toolbarButton toolbarButtonPlus");
        }
    },

    /* Toggles the visibility of the date picker */
    toggleDatePickerVisibility: function() {
        // Hide the groups list
        this.getAllInklingsGroupsListPanel().hide();
        this.getAllInklingsGroupsButton().removeCls("x-button-pressed");

        // Toggle the visibility of the date picker
        var allInklingsDatePickerPanel = this.getAllInklingsDatePickerPanel();
        if (allInklingsDatePickerPanel.getHidden()) {
            allInklingsDatePickerPanel.showBy(this.getAllInklingsDateButton());
            this.getAllInklingsDateButton().addCls("x-button-pressed");
        }
        else {
            allInklingsDatePickerPanel.hide();
            this.getAllInklingsDateButton().removeCls("x-button-pressed");

            // Update the all inklings list
            this.reloadAllInklingsList();
        }
    },

    /* Toggles whether the date picker is enabled or disabled */
    toggleDatePickerEnabled: function() {
        var undatedInklingsCheckbox = Ext.fly(Ext.query("#undatedInklingsCheckbox")[0]);
        if (undatedInklingsCheckbox.hasCls("selected")) {
            this.getAllInklingsDatePicker().setMasked(false);
            undatedInklingsCheckbox.set({
                "src" : "resources/images/deselected.png"
            });
        }
        else {
            this.getAllInklingsDatePicker().setMasked(true);
            undatedInklingsCheckbox.set({
                "src" : "resources/images/selected.png"
            });
        }

        undatedInklingsCheckbox.toggleCls("selected");
    },


    /* Toggles the visibility of the groups list */
    toggleGroupsListVisibility: function() {
        // Hide the date picker
        this.getAllInklingsDatePickerPanel().hide();
        this.getAllInklingsDateButton().removeCls("x-button-pressed");

        // Toggle the visibility of the groups panel
        var allInklingsGroupsListPanel = this.getAllInklingsGroupsListPanel();
        if (allInklingsGroupsListPanel.getHidden()) {
            allInklingsGroupsListPanel.showBy(this.getAllInklingsGroupsButton());
            this.getAllInklingsGroupsButton().addCls("x-button-pressed");
        }
        else {
            allInklingsGroupsListPanel.hide();
            this.getAllInklingsGroupsButton().removeCls("x-button-pressed");
        }
    },


    /* Toggles the state of the inputted group selection button and updates the all inklings list */
    toggleGroupSelectionButton: function(groupSelectionButton) {
        // Toggle the selection button's image source
        if (groupSelectionButton.hasCls("selected")) {
            groupSelectionButton.set({
                "src": "resources/images/deselected.png"
            });
            groupSelectionButton.removeCls("selected");
        }
        else {
            groupSelectionButton.set({
                "src": "resources/images/selected.png"
            });
            groupSelectionButton.addCls("selected");
        }

        // Update the all inklings list
        this.filterAllInklingsList();
    }
});
