Ext.define("inkle.view.NewInkling", {
    extend: "Ext.navigation.View",

    xtype: "newInklingView",

    requires: [
        "Ext.field.DatePicker",
        "Ext.field.Select"
    ],

    config: {
        scrollable: false,
        navigationBar: false,

        items: [
            /* Top toolbar */
            {
                xtype: "toolbar",
                id: "newInklingViewToolbar",
                docked: "top",
                title: "New Inkling",
                items: [
                    {
                        xtype: "button",
                        id: "newInklingCancelButton",
                        ui: "action",
                        text: "Cancel"
                    },
                    {
                        xtype: "button",
                        id: "newInklingInvitedFriendsBackButton",
                        ui: "back",
                        text: "New Inkling",
                        hidden: true
                    },
                    { xtype: "spacer" },
                    {
                        xtype: "button",
                        id: "newInklingDoneButton",
                        ui: "action",
                        text: "Done"
                    },
                    {
                        xtype: "button",
                        id: "newInklingInvitedGroupsButton",
                        ui: "action",
                        text: "Groups",
                        hidden: true
                    }
                ]
            },

            {
                xtype: "formpanel",
                items: [
                    /* Basic info form */
                    {
                        xtype: "fieldset",
                        id: "newInklingBasicInfoForm",
                        margin: "-30px -10px 10px -10px",
                        title: "What are the details?",

                        items: [
                            {
                                xtype: "textfield",
                                id: "newInklingLocationTextField",
                                name: "location",
                                label: "Location",
                                placeHolder: "Optional",
                                maxLength: 50
                            },
                            {
                                xtype: "datepickerfield",
                                id: "newInklingDatePicker",
                                name: "date",
                                label: "Date",
                                placeHolder: "Optional",
                                minValue: new Date()
                            },
                            {
                                xtype: "textfield",
                                id: "newInklingTimeTextField",
                                name: "time",
                                label: "Time",
                                placeHolder: "Optional",
                                maxLength: 50
                            },
                            {
                                xtype: "textareafield",
                                id: "newInklingNotesTextArea",
                                name: "notes",
                                label: "Notes",
                                placeHolder: "Optional",
                                maxLength: 150
                            }
                        ]
                    },

                    /* Invited friends */
                    {
                        xtype: "container",
                        title: "Who is invited?",
                        margin: "0px -10px 10px -10px",
                        html: [
                            "<p class='newInklingViewSectionTitle'>Who is invited?</p>",
                            "<div id='newInklingViewInvitedFriends'>",
                                "<p><span id='numInvitedFriends'>0</span> friend<span id='numInvitedFriendsPlural'>s</span> invited</p>",
                                "<img class='disclosureArrow' src='resources/images/disclosureArrow.png' />",
                            "</div>"
                        ].join("")
                    },

                    /* Share settings */
                    {
                        xtype: "container",
                        margin: "0px 0px 0px -10px",
                        html: [
                            "<div>",
                                "<p class='newInklingViewSectionTitle'>Who else is this shared with?</p>",
                            "</div>"
                           ].join("")
                    },
                    {
                        xtype: "htmlcontainer",
                        id: "newInklingShareOptions",
                        url: inkle.app.baseUrl + "/shareSettingsForm/"
                    }
                ]
            }
        ],

        listeners: [
            // Toolbar buttons
            {
                delegate: "#newInklingDoneButton",
                event: "tap",
                fn: "onNewInklingDoneButtonTap"
            },
            {
                delegate: "#newInklingCancelButton",
                event: "tap",
                fn: "onNewInklingCancelButtonTap"
            },
            {
                delegate: "#newInklingInvitedFriendsBackButton",
                event: "tap",
                fn: "onNewInklingInvitedFriendsBackButtonTap"
            },
            {
                delegate: "#newInklingInvitedGroupsButton",
                event: "tap",
                fn: "onNewInklingInvitedGroupsButtonTap"
            },

            // Invited friends
            {
                event: "tap",
                element: "element",
                delegate: "#newInklingViewInvitedFriends",
                fn: "onNewInklingViewInvitedFriendsTap"
            },

            // Share settings
            {
                event: "tap",
                element: "element",
                delegate: ".shareSettingsForm #selectedGroupsSelectionButton",
                fn: "onSelectedGroupsSelectionButtonTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: ".shareSettingsForm .groupSelectionButton",
                fn: "onGroupSelectionButtonTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: ".shareSettingsForm #noOneSelectionButton",
                fn: "onNoOneSelectionButtonTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: ".shareSettingsForm #forwardingSelectionButton",
                fn: "onForwardingSelectionButtonTap"
            }
        ]
    },

    /* Event firings */
    // Toolbar buttons
    onNewInklingDoneButtonTap: function() {
        this.fireEvent("newInklingDoneButtonTapped");
    },

    onNewInklingCancelButtonTap: function() {
        this.fireEvent("newInklingCancelButtonTapped", "newInklingView");
    },

    onNewInklingInvitedFriendsBackButtonTap: function() {
    	this.fireEvent("newInklingInvitedFriendsBackButtonTapped", "newInklingInvitedFriendsView");
    },

    onNewInklingInvitedGroupsButtonTap: function() {
    	this.fireEvent("newInklingInvitedGroupsButtonTapped");
    },

    // Invited friends
    onNewInklingViewInvitedFriendsTap: function() {
        this.fireEvent("newInklingInvitedFriendsTapped");
    },

    // Share settings
    onSelectedGroupsSelectionButtonTap: function(event, target) {
        console.log("selectedGroupsSelectionButton tapped");
        var tappedSelectionButton = Ext.fly(target);
        this.fireEvent("selectedGroupsSelectionButtonTapped", tappedSelectionButton);
    },

    onGroupSelectionButtonTap: function(event, target) {
        console.log("groupSelectionButton tapped");
        var tappedSelectionButton = Ext.fly(target);
        this.fireEvent("groupSelectionButtonTapped", tappedSelectionButton);
    },

    onNoOneSelectionButtonTap: function(event, target) {
        console.log("noOneSelectionButton tapped");
        var tappedSelectionButton = Ext.fly(target);
        this.fireEvent("noOneSelectionButtonTapped", tappedSelectionButton);
    },

    onForwardingSelectionButtonTap: function(event, target) {
        console.log("forwardingSelectionButton tapped");
        var tappedSelectionButton = Ext.fly(target);
        this.fireEvent("forwardingSelectionButtonTapped", tappedSelectionButton);
    }
});
