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

        items: [
            // Top toolbar
            {
                title: "Inklings",
                xtype: "toolbar",
                id: "allInklingsViewToolbar",
                docked: "top",
                items: [
                    {
                        xtype: "button",
                        ui: "action",
                        itemId: "allInklingsDateButton"
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
                        ui: "back",
                        text: "Inkling",
                        itemId: "backToInklingButton",
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
                        xtype: "button",
                        ui: "action",
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
                        cls: ["toolbarButton", "toolbarButtonFeed"],
                        pressedCls: ["toolbarButtonPressed", "toolbarButtonFeedPressed"],
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
                        cls: ["toolbarButton", "toolbarButtonPlus"],
                        pressedCls: ["toolbarButtonPressed", "toolbarButtonPlusPressed"],
                        itemId: "allInklingsAddCommentButton",
                        hidden: true
                    }
                ]
            },

            // All inklings list
            {
                xtype: "list",
                id: "allInklingsList",
                cls: "inklingsList",
                loadingText: "Loading inklings...",
                emptyText: "<div class='emptyListText'>No inklings</div>",
                disableSelection: true,
                itemTpl: [
                    "{ html }"
                ],
                store: {
                    fields: [
                        "html",
                        "inklingId",
                        "attendingGroupIds"
                    ],
                    proxy: {
                        type: "ajax",
                        actionMethods: {
                            read: "POST"
                        },
                        url: inkle.app.baseUrl + "/allInklings/"
                    },
                    autoLoad: false
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
                height: 310,
                layout: "fit",
                items: [
                    {
                        xtype: "calendar",
                        itemId: "allInklingsDatePicker",
                        height: 256,
                        viewConfig: {
                            viewMode: "month",
                            weekStart: 0,
                            value: new Date()
                        }
                    },
                    {
                        xtype: "container",
                        html: [
                            "<div>",
                                "<img id='undatedInklingsCheckbox' class='selectionItem' src='resources/images/deselected.png'>",
                                "<p id='undatedInklingsText'>Show inklings with no date</p>",
                            "</div>"
                        ].join(""),
                        top: 257,
                        width: 300
                    }
                ],

                listeners: [
                    {
                        delegate: "#undatedInklingsCheckbox",
                        element: "element",
                        event: "tap",
                        fn: "onUndatedInklingsCheckboxTap"
                    },
                    {
                        delegate: "#allInklingsDatePicker",
                        event: "selectionchange",
                        fn: "onAllInklingsDatePickerSelectionChange"
                    }
                ],

                onUndatedInklingsCheckboxTap: function() {
                    this.fireEvent("undatedInklingsCheckboxTapped");
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
                cls: "groupsListPanel",
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
                                "groupId",
                                "groupName",
                                "html"
                            ],
                            proxy: {
                                type: "ajax",
                                actionMethods: {
                                    read: "POST"
                                },
                                url: inkle.app.baseUrl + "/groupsPanel/",
                                extraParams: {
                                    autoSetGroupsAsSelected: "true"
                                }
                            },
                            sorters: [
                                {
                                    sorterFn: function(record1, record2) {
                                        var groupId1 = record1.data.groupId;
                                        var groupId2 = record2.data.groupId;

                                        var groupName1 = record1.data.groupName;
                                        var groupName2 = record2.data.groupName;

                                        // Put the "Not grouped" group (with an ID of -1) first
                                        if (groupId1 == -1) {
                                            return -1;
                                        }
                                        else if (groupId2 == -1) {
                                            return 1;
                                        }

                                        // Otherwise, sort by group name
                                        else {
                                            return groupName1 > groupName2 ? 1 : (groupName1 == groupName2 ? 0 : -1);
                                        }
                                    }
                                }
                            ],
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
                    }
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
                delegate: "#allInklingsList",
                event: "itemtap",
                fn: "onAllInklingsListItemTap"
            },

            /* Not all inklings view */
            {
                delegate: "#allInklingsInklingBackButton",
                event: "tap",
                fn: "onAllInklingsInklingBackButtonTap"
            },
            {
                delegate: "#backToInklingButton",
                event: "tap",
                fn: "onBackToInklingButtonTap"
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
                delegate: "#allInklingsAddCommentButton",
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

    onAllInklingsListItemTap: function(allInklingsList, index, target, record, event, options) {
        var inklingListItem = event.getTarget(".inklingListItem");
        var tappedInklingId = inklingListItem.getAttribute("data-inklingId");
        var isMemberAttending = inklingListItem.getAttribute("data-isMemberAttending");
        this.fireEvent("inklingTapped", tappedInklingId, isMemberAttending);
    },

    onAllInklingsInklingBackButtonTap: function() {
        this.fireEvent("allInklingsInklingBackButtonTapped");
    },

    onBackToInklingButtonTap: function() {
        this.fireEvent("backToInklingButtonTapped");
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
        this.fireEvent("allInklingsAddCommentButtonTapped");
    }
});
