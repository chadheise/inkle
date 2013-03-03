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
            // Top toolbar
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
                    // Basic info form
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

                    // Invited friends
                    {
                        xtype: "container",
                        //top: 200,
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
            
                    // Share settings
                    {
                        xtype: "container",
                        //top: 300,
                        margin: "0px 0px 0px -10px",
                        html: [
                            "<div>",
                                "<p class='newInklingViewSectionTitle'>Who else is this shared with?</p>",
                            "</div>"
                           ].join("")
                    },
                    {
                        xtype: "htmlcontainer",
                        //top: 400,
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
                delegate: "#newInklingShareOptions .forwardingShareSetting",
                fn: "onForwardingShareSettingTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: "#newInklingShareOptions .selectedGroupsShareSetting",
                fn: "onSelectedGroupsShareSettingTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: "#newInklingShareOptions .groupShareSetting",
                fn: "onGroupShareSettingTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: "#newInklingShareOptions .noOneShareSetting",
                fn: "onNoOneShareSettingTap"
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
    onSelectedGroupsShareSettingTap: function(event, target) {
        var selectionButton = Ext.fly(target);
        this.fireEvent("selectedGroupsShareSettingTapped", selectionButton);
    },

    onGroupShareSettingTap: function(event, target) {
        var selectionButton = Ext.fly(target);
        this.fireEvent("groupShareSettingTapped", selectionButton);
    },

    onNoOneShareSettingTap: function(event, target) {
        var selectionButton = Ext.fly(target);
        this.fireEvent("noOneShareSettingTapped", selectionButton);
    },

    onForwardingShareSettingTap: function(event, target) {
        var selectionButton = Ext.fly(target);
        this.fireEvent("forwardingShareSettingTapped", selectionButton);
    }
});
