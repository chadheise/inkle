Ext.define("inkle.controller.MyInklingsController", {
    extend: "Ext.app.Controller",

    config: {
        refs: {
            // Views
            mainTabView: "mainTabView",
            myInklingsView: "myInklingsView",
            newInklingView: "newInklingView",
            newInklingInvitedFriendsView: "newInklingInvitedFriendsView",
            //newInklingInvitedGroupsPanel: "#newInklingInvitedGroupsPanel",
            newInklingInvitedGroupsPanel: "panel[id=newInklingInvitedGroupsPanel]",
            inklingInvitationsPanel: "panel[id=inklingInvitationsPanel]",
            myInklingsFeedCommentPanel: "panel[id=addCommentPanel]",

            myInklingsViewToolbar: "#myInklingsViewToolbar",
            myInklingsAddCommentButton: "#myInklingsAddCommentButton",

            newInklingInvitedFriendsList: "#newInklingInvitedFriendsList",

            inklingInvitationsList: "#inklingInvitationsList",

            shareWithSelect: "#shareWithSelect",


            newInklingInvitedGroupsList: "#newInklingInvitedGroupsList",

            myInklingsList: "#myInklingsList",

            // Top toolbars
            myInklingsViewToolbar: "#myInklingsViewToolbar",
            newInklingViewToolbar: "#newInklingViewToolbar",

            // My inklings view toolbar buttons
            inklingInvitationsButton: "#inklingInvitationsButton",
            newInklingButton: "#newInklingButton",
            inviteResponseBackButton: "myInklingsView #inviteResponseBackButton",
            myInklingsInklingBackButton: "myInklingsView #myInklingsInklingBackButton",
            inklingFeedBackButton: "myInklingsView #inklingFeedBackButton",
            inklingFeedButton: "myInklingsView #inklingFeedButton",
            saveInklingButton: "myInklingsView #saveInklingButton",
            inklingInviteesDoneButton: "myInklingsView #inklingInviteesDoneButton",

            // New inkling view toolbar buttons
            newInklingDoneButton: "newInklingView #newInklingDoneButton",
            newInklingCancelButton: "newInklingView #newInklingCancelButton",
            newInklingInvitedFriendsBackButton: "newInklingView #newInklingInvitedFriendsBackButton",
            newInklingInvitedGroupsButton: "newInklingView #newInklingInvitedGroupsButton",

            // New inkling form
            newInklingLocationTextField: "#newInklingLocationTextField",
            newInklingDatePicker: "#newInklingDatePicker",
            newInklingTimeTextField: "#newInklingTimeTextField",
            newInklingNotesTextArea: "#newInklingNotesTextArea"
        },
        control: {
            myInklingsView: {
                inklingTapped: "activateInklingView",
                inklingInvitationsButtonTapped: "toggleInklingInvitationsVisibility",
                onInviteResponseBackButtonTapped: "activateMyInklingsView",
                newInklingButtonTapped: "activateNewInklingView",
                activate: "hideMyInklingsTabBadge",
                deactivate: "hideMyInklingsPanels",
                activeitemchange: "hideMyInklingsPanels",
                myInklingsListRefreshed: "updateMyInklingsList",
                initialize: "updateMyInklingsList"
            },

            newInklingView: {
                // Toolbar buttons
                newInklingCancelButtonTapped: "activateMyInklingsView",
                newInklingDoneButtonTapped: "createInkling",
                newInklingInvitedFriendsBackButtonTapped: "activateNewInklingView",
                newInklingInvitedGroupsButtonTapped: "toggleNewInklingInvitedGroupsPanel",

                // Invited friends
                newInklingInvitedFriendsTapped: "activateNewInklingInvitedFriendsView",

                // Share settings
                selectedGroupsSelectionButtonTapped: "selectSelectedGroupsSelectionButton",
                groupSelectionButtonTapped: "toggleSelectedGroupsGroupSelectionButton",
                noOneSelectionButtonTapped: "selectNoOneSelectionButton",
                forwardingSelectionButtonTapped: "toggleForwardingSelectionButton"
            },

            newInklingInvitedFriendsView: {
                memberSelectionButtonTapped: "toggleMemberSelectionButton",
                newInklingInvitedFriendsListRefreshed: "updateNewInklingInvitedFriendsList"
            },

            newInklingInvitedGroupsPanel: {
                groupSelectionButtonTapped: "toggleGroupSelectionButton"
            },

            inklingInvitationsPanel: {
                invitationButtonTapped: "respondToInklingInvitation",
                inklingInvitationTapped: "activateInklingView",
                inklingInvitationsListRefreshed: "updateInklingInvitationsList",
                initialize: "updateInklingInvitationsList"
            }
        }
    },


    /**********************/
    /*  VIEW TRANSITIONS  */
    /**********************/
    /* Activates the my inklings view */
    activateMyInklingsView: function(source) {
        if (source == "newInklingView") {
            Ext.Viewport.animateActiveItem(this.getMainTabView(), {
                type: "slide",
                direction: "down"
            });
        }
        else {
            // Pop the new inkling view from the my inklings view
            this.getMyInklingsView().pop();

            // Show appropriate buttons
            this.getMyInklingsInklingBackButton().hide();
            this.getInklingFeedButton().hide();
            this.getInviteResponseBackButton().hide();
            this.getInklingInvitationsButton().show();
            this.getNewInklingButton().show();

            // Update the toolbar title
            this.getMyInklingsViewToolbar().setTitle("My Inklings");

            //this.getGroupsList().getStore().load();
        }
    },

    // Activates the inkling view
    activateInklingView: function(inklingId, source) {
        // Show appropriate buttons
        this.getNewInklingButton().hide();
        this.getInklingInvitationsButton().hide();
        this.getMyInklingsInklingBackButton().show();
        this.getInklingFeedButton().show();

        // Update the back button text
        if (source == "myInklings") {
            this.getMyInklingsInklingBackButton().setText("My Inklings");
        }
        else if (source == "invitations") {
            this.getMyInklingsInklingBackButton().setText("Invitations");
        }

        // Get today's date
        var today = new Date();

        // Push the inkling view onto the all inklings view
        this.getMyInklingsView().push({
            xtype: "inklingView",
            data: {
                inklingId: inklingId,
                timezoneOffset: today.getTimezoneOffset(),
                source: source,
                isMemberAttending: "True"
            }
        });

        // Update the top toolbar's title
        this.getMyInklingsViewToolbar().setTitle("Inkling");
    },


    /* Activates the new inkling view */
    activateNewInklingView: function(source) {
        // Create the new inkling view if it does not exist yet
        if (source == "myInklingsView") {
            // Destroy the current new inkling view if it exists
            if (this.getNewInklingView()) {
                this.getNewInklingView().destroy();
            }

            // Activate the new inkling view
            var newInklingView = Ext.create("inkle.view.NewInkling");
            Ext.Viewport.animateActiveItem(newInklingView, {
                type: "slide",
                direction: "up"
            });

            // Set the data for the new inkling view
            newInklingView.setData({
                invitedMemberIds: "",
                invitedGroupIds: ""
            });
        }

        // Otherwise, pop off the new inkling invited friends view
        else if (source == "newInklingInvitedFriendsView") {
            // Show appropriate buttons
            this.getNewInklingInvitedFriendsBackButton().hide();
            this.getNewInklingInvitedGroupsButton().hide()
            this.getNewInklingCancelButton().show();
            this.getNewInklingDoneButton().show();

            // Get the list of members and groups invited in the invited friends view
            var invitedMemberIds = this.getInvitedMemberIds();
            var invitedGroupIds = this.getInvitedGroupIds();

            // Update the new inkling view's data so we can recreate the invited friends view
            var newInklingView = this.getNewInklingView();
            newInklingView.setData({
                invitedMemberIds: invitedMemberIds,
                invitedGroupIds: invitedGroupIds
            });

            // Destroy the invited groups panel
            this.getNewInklingInvitedGroupsPanel().destroy();

            // Pop off the new inkling invited friends view
            newInklingView.pop();

            // Update the new inkling view toolbar's title
            this.getNewInklingViewToolbar().setTitle("New Inkling");
        }
    },


    /* Activates the new inkling invited friends view */
    activateNewInklingInvitedFriendsView: function() {
        // Show appropriate buttons
        this.getNewInklingCancelButton().hide();
        this.getNewInklingDoneButton().hide();
        this.getNewInklingInvitedFriendsBackButton().show();
        this.getNewInklingInvitedGroupsButton().show();

        // Update the toolbar title
        this.getNewInklingViewToolbar().setTitle("Invites");

        // Push the invited friends view
        this.getNewInklingView().push({
            xtype: "newInklingInvitedFriendsView"
        });

        // Load the invited friends list
        var newInklingInvitedFriendsStore = this.getNewInklingInvitedFriendsList().getStore();
        newInklingInvitedFriendsStore.setProxy({
            extraParams: {
                mode: "invite",
                selectedMemberIds: this.getNewInklingView().getData()["invitedMemberIds"]
            }
        });
        newInklingInvitedFriendsStore.load();
    },


    /**************/
    /*  Commands  */
    /**************/
    /* Toggles the visibility of the inkling invitations panel */
    toggleInklingInvitationsVisibility: function() {
        // Toggle the visibility of the inkling invitations panel
        var inklingInvitationsPanel = this.getInklingInvitationsPanel();
        if (inklingInvitationsPanel.getHidden()) {
            inklingInvitationsPanel.showBy(this.getInklingInvitationsButton());
            //this.getInklingInvitationsButton().removeCls("toolbarButton toolbarButtonEnvelope");
            //this.getInklingInvitationsButton().setCls("toolbarButtonPressed toolbarButtonEnvelopePressed");
        }
        else {
            inklingInvitationsPanel.hide();
            //this.getInklingInvitationsButton().removeCls("toolbarButtonPressed toolbarButtonEnvelopePressed");
            //this.getInklingInvitationsButton().setCls("toolbarButton toolbarButtonEnvelope");
        }
    },


    /* Creates a new inkling from the information entered by the logged-in user */
    createInkling: function() {
        // Get the inkling form data
        var location = this.getNewInklingLocationTextField().getValue();
        var date = this.getNewInklingDatePicker().getValue();
        var time = this.getNewInklingTimeTextField().getValue();
        var notes = this.getNewInklingNotesTextArea().getValue();
        var numInvitedFriends = Ext.fly("numInvitedFriends").getHtml();

        // Validate the new inkling form
        if ((location == "") && (date == null) && (time == "") && (notes == "") && (numInvitedFriends == "0"))
        {
            Ext.Msg.alert("Error", "No inkling information entered.");
        }

        // If the new inkling form is valid, create a new inkling
        else {
            var newInklingView = this.getNewInklingView();
            Ext.Ajax.request({
                url: inkle.app.baseUrl + "/createInkling/",
                headers: { "cache-control": "no-cache" },
                method: "POST",

                params: {
                    location: location,
                    date: date,
                    time: time,
                    notes: notes,
                    invitedMemberIds: newInklingView.getData()["invitedMemberIds"],
                    groupsSharedWith: this.getGroupsSharedWith(),
                    allowShareFowarding: Ext.fly("forwardingSelectionButton").hasCls("selected")
                },

                success: function(response) {
                    // Update and activate the my inklings list
                    // TODO: put the activate in the update's callback?
                    this.updateMyInklingsList();
                    this.activateMyInklingsView("newInklingView");
                },

                failure: function(response) {
                    Ext.Msg.alert("Error", "Cannot create a new inkling. Please try again later.");
                },

                scope: this
            });
        }
    },


    /* Toggles the state of the inputted member selection button and (un)invites the corresponding member */
    toggleMemberSelectionButton: function(tappedSelectionButton) {
        // Only do anything if the invited groups panel is hidden
        if (this.getNewInklingInvitedGroupsPanel().getHidden()) {
            // Get the tapped member ID
            var tappedMemberId = tappedSelectionButton.parent(".member").getAttribute("data-memberId");

            // Toggle the selection button's state
            tappedSelectionButton.toggleCls("selected");

            // Update the selection button's image source and the number of invited friends
            var numInvitedFriends;
            if (tappedSelectionButton.hasCls("selected")) {
                tappedSelectionButton.set({
                    "src": "resources/images/selected.png"
                });

                numInvitedFriends = parseInt(Ext.fly("numInvitedFriends").getHtml()) + 1;
            }
            else {
                tappedSelectionButton.set({
                    "src": "resources/images/deselected.png"
                });

                // Determine the selected groups to which the deselected member belongs
                var invitedGroupIds = this.getInvitedGroupIds();
                if (invitedGroupIds) {
                    invitedGroupIds = invitedGroupIds.split(",");
                }
                var finalInvitedGroupIds = this.getInvitedGroupIds();
                if (finalInvitedGroupIds) {
                    finalInvitedGroupIds = finalInvitedGroupIds.split(",");
                }

                for (var i = 0; i < invitedGroupIds.length; i++) {
                    var currentGroup = Ext.query("#newInklingInvitedGroupsList [data-groupId='" + invitedGroupIds[i] + "']");
                    currentGroup = Ext.fly(currentGroup[0]);

                    var currentGroupMemberIds = currentGroup.getAttribute("data-memberIds");
                    if (currentGroupMemberIds) {
                        currentGroupMemberIds = currentGroupMemberIds.split(",");
                    }

                    var memberIndex = currentGroupMemberIds.indexOf(tappedMemberId);
                    if (memberIndex != -1) {
                        var groupIndex = finalInvitedGroupIds.indexOf(invitedGroupIds[i]);
                        if (groupIndex != -1) {
                            finalInvitedGroupIds.splice(groupIndex, 1);
                        }
                    }
                }

                // Update the new inkling view's data with the uninvited groups (if there are any)
                if (invitedGroupIds.length != finalInvitedGroupIds.length) {
                    var newInklingView = this.getNewInklingView();
                    newInklingView.setData({
                        invitedMemberIds: this.getInvitedMemberIds(),
                        invitedGroupIds: finalInvitedGroupIds
                    });
                }

                numInvitedFriends = parseInt(Ext.fly("numInvitedFriends").getHtml()) - 1;
            }

            // Update the text displaying the number of invited friends on the "New Inkling" page
            Ext.fly("numInvitedFriends").setText(numInvitedFriends);
            if (numInvitedFriends == 1) {
                Ext.fly("numInvitedFriendsPlural").setText("");
            }
            else {
                Ext.fly("numInvitedFriendsPlural").setText("s");
            }
        }
    },


    /* Toggles the state of the inputted group selection button and (un)invites the corresponding group */
    toggleGroupSelectionButton: function(tappedSelectionButton) {
        // Toggle the selection button's state and image source
        tappedSelectionButton.toggleCls("selected");
        if (tappedSelectionButton.hasCls("selected")) {
            tappedSelectionButton.set({
                "src": "resources/images/selected.png"
            });
        }
        else {
            tappedSelectionButton.set({
                "src": "resources/images/deselected.png"
            });
        }

        // Get the IDs for the members in the selected group
        var groupMemberIds = tappedSelectionButton.parent(".group").getAttribute("data-memberIds");
        if (groupMemberIds) {
            groupMemberIds = groupMemberIds.split(",");
        }

        // Toggle the selection button for each friend in the selected group
        var numInvitedFriendsDifference = 0;
        if (tappedSelectionButton.hasCls("selected")) {
            // Loop through each member in the selected group and select it if it is not already selected
            for (var i = 0; i < groupMemberIds.length; i++) {
                var member = Ext.query("#newInklingInvitedFriendsList [data-memberId='" + groupMemberIds[i] + "']");
                member = Ext.fly(member[0]);
                var selectionButton = member.down(".selectionButton");
                if (!selectionButton.hasCls("selected")) {
                    selectionButton.set({
                        "src": "resources/images/selected.png"
                    });
                    selectionButton.addCls("selected");

                    numInvitedFriendsDifference += 1;
                }
            }
        }
        else {
            // Remove the selected members who are a part of other groups
            var invitedGroupIds = this.getInvitedGroupIds();
            if (invitedGroupIds) {
                invitedGroupIds = invitedGroupIds.split(",");
            }

            for (var i = 0; i < invitedGroupIds.length; i++) {
                var currentGroup = Ext.query("#newInklingInvitedGroupsList [data-groupId='" + invitedGroupIds[i] + "']");
                currentGroup = Ext.fly(currentGroup[0]);

                var currentGroupMemberIds = currentGroup.getAttribute("data-memberIds");
                if (currentGroupMemberIds) {
                    currentGroupMemberIds = currentGroupMemberIds.split(",");
                }

                for (var j = 0; j < currentGroupMemberIds.length; j++){
                    var index = groupMemberIds.indexOf(currentGroupMemberIds[j]);
                    if (index != -1) {
                        groupMemberIds.splice(index, 1);
                    }
                }
            }

            // Loop through each member in the deselected group and deselect it if it is not a part of another selected group
            for (var i = 0; i < groupMemberIds.length; i++) {
                var member = Ext.query("#newInklingInvitedFriendsList [data-memberId='" + groupMemberIds[i] + "']");
                member = Ext.fly(member[0]);
                var selectionButton = member.down(".selectionButton");
                if (selectionButton.hasCls("selected")) {
                    selectionButton.set({
                        "src": "resources/images/deselected.png"
                    });
                    selectionButton.removeCls("selected");

                    numInvitedFriendsDifference -= 1;
                }
            }
        }

        // Update the text displaying the number of invited friends on the "New Inkling" page
        var numInvitedFriends = parseInt(Ext.fly("numInvitedFriends").getHtml()) + numInvitedFriendsDifference;
        Ext.fly("numInvitedFriends").setText(numInvitedFriends);
        if (numInvitedFriends == 1) {
            Ext.fly("numInvitedFriendsPlural").setText("");
        }
        else {
            Ext.fly("numInvitedFriendsPlural").setText("s");
        }
    },


    // Toggles the visibility of the new inkling invited groups panel
    toggleNewInklingInvitedGroupsPanel: function() {
        // Get the new inkling invited groups panel
        var newInklingInvitedGroupsPanel = this.getNewInklingInvitedGroupsPanel();

        // If the invited groups panel is hidden, re-load and show it
        if (newInklingInvitedGroupsPanel.getHidden()) {
            var newInklingInvitedGroupsStore = this.getNewInklingInvitedGroupsList().getStore();
            newInklingInvitedGroupsStore.setProxy({
                extraParams: {
                    autoSetGroupsAsSelected: "false",
                    selectedGroupIds: this.getNewInklingView().getData()["invitedGroupIds"]
                }
            });

            var newInklingInvitedGroupsButton = this.getNewInklingInvitedGroupsButton();
            newInklingInvitedGroupsStore.load(
                function(records, operation, success) {
                    newInklingInvitedGroupsPanel.showBy(newInklingInvitedGroupsButton);
                }
            );
        }

        // Otherwise, hide the invited groups panel
        else {
            // Get the list of members and groups invited in the invited friends view
            var invitedMemberIds = this.getInvitedMemberIds();
            var invitedGroupIds = this.getInvitedGroupIds();

            // Update the new inkling view's data so we can recreate the invited friends view
            var newInklingView = this.getNewInklingView();
            newInklingView.setData({
                invitedMemberIds: invitedMemberIds,
                invitedGroupIds: invitedGroupIds
            });

            newInklingInvitedGroupsPanel.hide();
        }
    },


    // Hides the new inkling invited groups panel
    hideMyInklingsPanels: function() {
        var newInklingInvitedGroupsPanel = this.getNewInklingInvitedGroupsPanel();
        if (newInklingInvitedGroupsPanel) {
            newInklingInvitedGroupsPanel.hide();
        }

        var myInklingsFeedCommentPanel = this.getMyInklingsFeedCommentPanel();
        if (myInklingsFeedCommentPanel) {
            myInklingsFeedCommentPanel.hide();
            this.getMyInklingsAddCommentButton().removeCls("toolbarButtonPressed toolbarButtonPlusPressed");
            this.getMyInklingsAddCommentButton().setCls("toolbarButton toolbarButtonPlus");
        }

        // If the logged in member has been invited to at least one inkling, unhide the inkling invites button and set its text
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/numInklingInvitations/",
            headers: { "cache-control": "no-cache" },
            success: function(response) {
                numInklingInvites = response.responseText;
                if (numInklingInvites != 0) {
                    this.getInklingInvitationsButton().setBadgeText(numInklingInvites);
                    if (this.getMainTabView().getTabBar().getActiveTab() != this.getMainTabView().getTabBar().getAt(1)) {
                        this.getMainTabView().getTabBar().getAt(1).setBadgeText(numInklingInvites);
                    }
                }
            },

            failure: function(response) {
                console.log(response.responseText);
            },

            scope: this
        });

        this.getInklingInvitationsPanel().hide();
        //this.getInklingInvitationsButton().removeCls("toolbarButtonPressed toolbarButtonEnvelopePressed");
        //this.getInklingInvitationsButton().setCls("toolbarButton toolbarButtonEnvelope");
    },

    hideMyInklingsTabBadge: function() {
        this.getMainTabView().getTabBar().getAt(1).setBadgeText("");
    },


    /* Selects the selected groups selection button */
    selectSelectedGroupsSelectionButton: function(selectedGroupsSelectionButton) {
        // If the selected groups selection button is not selected, select it and deselect the no one selection button
        if (!selectedGroupsSelectionButton.hasCls("selected")) {
            // Select the selected groups selection button
            selectedGroupsSelectionButton.set({
               "src": "resources/images/selected.png"
            });
            selectedGroupsSelectionButton.addCls("selected");

            // Unfade the selected groups' selection buttons
            Ext.get("newInklingShareOptions").select(".groupSelectionButton").each(function() {
                if (this.hasCls("selected")) {
                    this.set({
                        "src": "resources/images/selected.png"
                    });
                }
                this.removeCls("disabled");
            });

            // Deselect the no one selection button
            var noOneSelectionButton = Ext.fly("noOneSelectionButton");
            noOneSelectionButton.set({
                "src": "resources/images/deselected.png"
            });
            noOneSelectionButton.removeCls("selected");
        }
    },


    /* Toggles the selected state of the inputted selected groups group selection button */
    toggleSelectedGroupsGroupSelectionButton: function(groupSelectionButton) {
        if (!(groupSelectionButton.hasCls("disabled"))) {
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
        }
    },


    /* Selects the no one selection button */
    selectNoOneSelectionButton: function(noOneSelectionButton) {
        // If the no one selection button is not selected, select it and deselect the selected groups selection button
        if (!noOneSelectionButton.hasCls("selected")) {
            // Select the no one selection button
            noOneSelectionButton.set({
               "src": "resources/images/selected.png"
            });
            noOneSelectionButton.addCls("selected");

            // Fade the selected groups' selection buttons
            Ext.get("newInklingShareOptions").select(".groupSelectionButton").each(function() {
                if (this.hasCls("selected")) {
                    this.set({
                        "src": "resources/images/fadedselected.png"
                    });
                }
                this.addCls("disabled");
            });

            // Deslect the selected groups selection button
            var selectedGroupsSelectionButton = Ext.fly("selectedGroupsSelectionButton");
            selectedGroupsSelectionButton.set({
                "src": "resources/images/deselected.png"
            });
            selectedGroupsSelectionButton.removeCls("selected");

        }
    },

    /* Toggles the selected state of the forwarding selection button */
    toggleForwardingSelectionButton: function(forwardingSelectionButton) {
        if (forwardingSelectionButton.hasCls("selected")) {
            forwardingSelectionButton.set({
                "src": "resources/images/deselected.png"
            });
            forwardingSelectionButton.removeCls("selected");
        }
        else {
            forwardingSelectionButton.set({
                "src": "resources/images/selected.png"
            });
            forwardingSelectionButton.addCls("selected");
        }
    },


    respondToInklingInvitation: function(invitationId, invitationResponse) {
        console.log(invitationId);
        console.log(invitationResponse);
        Ext.Ajax.request({
            url: inkle.app.baseUrl + "/respondToInklingInvitation/",
            headers: { "cache-control": "no-cache" },
            params: {
                invitationId: invitationId,
                response: invitationResponse
            },
            success: function(response) {
                var numInklingInvitations = response.responseText;
                if (numInklingInvitations != 0) {
                    this.getInklingInvitationsButton().setBadgeText(numInklingInvitations);
                }
                else {
                    this.getInklingInvitationsButton().setBadgeText("");
                }

                this.getInklingInvitationsList().getStore().load();
                if (invitationResponse == "accepted") {
                    this.updateMyInklingsList();
                }

            },
            failure: function(response) {
                console.log(response.responseText);
            },
            scope: this
        });
    },


    /* Returns a list of member IDs (as a string) of the members who are selected on the newInklingInvitedFriendsView */
    getInvitedMemberIds: function() {
        var invitedMemberIds = "";
        var first = true;

        var invitedMemberSelectionButtons = Ext.query("#newInklingInvitedFriendsList .selected");
        for (var i = 0; i < invitedMemberSelectionButtons.length; i++) {
            if (first) {
                invitedMemberIds += Ext.fly(invitedMemberSelectionButtons[i]).parent(".member").getAttribute("data-memberId");
                first = false;
            }
            else {
                invitedMemberIds += "," + Ext.fly(invitedMemberSelectionButtons[i]).parent(".member").getAttribute("data-memberId");
            }
        }

        return invitedMemberIds;
    },


    /* Returns a list of group IDs (as a string) of the groups who are selected on the newInklingInvitedFriendsView */
    getInvitedGroupIds: function() {
        var invitedGroupIds = "";
        var first = true;

        var invitedGroupSelectionButtons = Ext.query("#newInklingInvitedGroupsList .selected");
        for (var i = 0; i < invitedGroupSelectionButtons.length; i++) {
            if (first) {
                invitedGroupIds += Ext.fly(invitedGroupSelectionButtons[i]).parent(".group").getAttribute("data-groupId");
                first = false;
            }
            else {
                invitedGroupIds += "," + Ext.fly(invitedGroupSelectionButtons[i]).parent(".group").getAttribute("data-groupId");
            }
        }

        return invitedGroupIds;
    },


    /* Returns a list of group IDs (as a string) of the groups who the new inkling are being shared with */
    getGroupsSharedWith: function() {
        var groupsSharedWith = "";
        var first = true;

        var groupsSharedWithSelectionButtons = Ext.query(".shareSettingsForm .groupSelectionButton.selected");
        for (var i = 0; i < groupsSharedWithSelectionButtons.length; i++) {
            if (!Ext.fly(groupsSharedWithSelectionButtons[i]).hasCls("disabled")) {
                if (first) {
                    groupsSharedWith += Ext.fly(groupsSharedWithSelectionButtons[i]).getAttribute("data-groupId");
                    first = false;
                }
                else {
                    groupsSharedWith += "," + Ext.fly(groupsSharedWithSelectionButtons[i]).getAttribute("data-groupId");
                }
            }
        }

        return groupsSharedWith;
    },


    /* Updates the my inklings list */
    updateMyInklingsList: function() {
        // Get today's date
        var today = new Date();

        // Update the my inklings list
        var myInklingsListStore = this.getMyInklingsList().getStore();
        myInklingsListStore.setProxy({
            extraParams: {
                timezoneOffset: today.getTimezoneOffset()
            }
        });
        myInklingsListStore.load();
    },


    /* Updates the inkling invitations list */
    updateInklingInvitationsList: function() {
        // Get today's date
        var today = new Date();

        // Update the my inklings list
        var inklingsInvitationsListStore = this.getInklingInvitationsList().getStore();
        inklingsInvitationsListStore.setProxy({
            extraParams: {
                timezoneOffset: today.getTimezoneOffset()
            }
        });
        inklingsInvitationsListStore.load();
    },


    /* Updates the new inkling invited friends list */
    updateNewInklingInvitedFriendsList: function() {
        var newInklingInvitedFriendsStore = this.getNewInklingInvitedFriendsList().getStore();
        newInklingInvitedFriendsStore.setProxy({
            extraParams: {
                mode: "invite",
                selectedMemberIds: this.getInvitedMemberIds()
            }
        });
        newInklingInvitedFriendsStore.load();
    }
});
