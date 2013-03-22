Ext.define("inkle.view.Friends", {
    extend: "Ext.navigation.View",

    xtype: "friendsView",

    requires: [
        "Ext.SegmentedButton",
        "Ext.dataview.List",
        "Ext.ActionSheet"
    ],

    config: {
        // Tab information
        title: "Friends",
        iconCls: "friendsIcon",

        // Layout information
        navigationBar: false,

        items: [
            // Top toolbar
            {
                xtype: "toolbar",
                id: "friendsViewToolbar",
                docked: "top",
                items: [
                    // Remove friends buttons
                    {
                        xtype: "button",
                        id: "friendsViewRemoveFriendsButton",
                        cls: ["toolbarButton", "toolbarButtonMinusFriend"],
                        pressedCls: ["toolbarButtonPressed", "toolbarButtonMinusFriendPressed"]
                    },
                    {
                        xtype: "button",
                        id: "friendsViewRemoveFriendsDoneButton",
                        text: "Done",
                        pressedCls: ["toolbarButtonPressed"],
                        hidden: true
                    },

                    // Edit groups buttons
                    {
                        xtype: "button",
                        id: "friendsViewEditGroupsButton",
                        cls: ["toolbarButton", "toolbarButtonGear"],
                        pressedCls: ["toolbarButtonPressed", "toolbarButtonGearPressed"],
                        hidden: true
                    },
                    {
                        xtype: "button",
                        id: "friendsViewEditGroupsDoneButton",
                        text: "Done",
                        pressedCls: ["toolbarButtonPressed"],
                        hidden: true
                    },

                    // Group members button
                    {
                        xtype: "button",
                        id: "groupMembersViewBackButton",
                        text: "Groups",
                        ui: "back",
                        //pressedCls: ["toolbarButtonPressed"],
                        hidden: true
                    },

                    // Spacer
                    { xtype: "spacer" },

                    // Segmented button
                    {
                        xtype: "segmentedbutton",
                        id: "friendsViewSegmentedButton",
                        allowDepress: false,
                        allowMultiple: false,
                        centered: true,
                        items: [
                            {
                                text: "Friends",
                                id: "friendsViewFriendsButton",
                                width: 68,
                                pressed: true
                            },
                            {
                                text: "Groups",
                                id: "friendsViewGroupsButton",
                                width: 68,
                                padding: 0
                            },
                            {
                                text: "Requests",
                                id: "friendsViewRequestsButton",
                                width: 68,
                                padding: 0
                            }
                        ]
                    },

                    // Spacer
                    { xtype: "spacer" },

                    // Add friends button
                    {
                        xtype: "button",
                        id: "friendsViewAddFriendsButton",
                        cls: ["toolbarButton", "toolbarButtonPlusFriend"],
                        pressedCls: ["toolbarButtonPressed", "toolbarButtonPlusFriendPressed"]
                    },

                    // Create group button
                    {
                        xtype: "button",
                        id: "friendsViewCreateGroupButton",
                        cls: ["toolbarButton", "toolbarButtonPlus"],
                        pressedCls: ["toolbarButtonPressed", "toolbarButtonPlusPressed"],
                        hidden: true
                    }
                ]
            },

            // Main content lists
            {
                xtype: "container",
                itemId: "friendsViewMainContent",
                layout: "card",
                items: [
                    // Friends list
                    {
                        xtype: "list",
                        id: "friendsViewFriendsList",
                        cls: "membersList",
                        loadingText: "Loading friends...",
                        emptyText: "<div class='emptyListText'>No friends</div>",
                        grouped: true,
                        disableSelection: true,
                        indexBar: true,
                        itemTpl: [
                            "{ html }"
                        ],
                        store: {
                            fields: [
                                "memberId",
                                "lastName",
                                "html"
                            ],
                            proxy: {
                                type: "ajax",
                                url: inkle.app.baseUrl + "/friends/",
                                actionMethods: {
                                    read: "POST"
                                },
                                extraParams: {
                                    mode: "friends"
                                }
                            },
                            grouper: {
                                groupFn: function(record) {
                                    return record.get("lastName").substr(0, 1);
                                }
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

                    // Groups list
                    {
                        xtype: "list",
                        id: "friendsViewGroupsList",
                        cls: "groupsListMainContent",
                        loadingText: "Loading groups...",
                        emptyText: "<div class='emptyListText'>No groups</div>",
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
                                url: inkle.app.baseUrl + "/groupsMainContent/"
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

                    // Friend requests list
                    {
                        xtype: "list",
                        id: "friendsViewRequestsList",
                        cls: "membersList",
                        loadingText: "Loading friend requests...",
                        emptyText: "<div class='emptyListText'>No friend requests</div>",
                        disableSelection: true,
                        itemTpl: [
                            "{ html }"
                        ],
                        store: {
                            fields: [
                                "requestId",
                                "html"
                            ],
                            proxy: {
                                type: "ajax",
                                actionMethods: {
                                    read: "POST"
                                },
                                url: inkle.app.baseUrl + "/friendRequests/"
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
                    }
                ]
            }
        ],

        listeners: [
            // Top toolbar segmented button
            {
                delegate: "#friendsViewSegmentedButton",
                event: "toggle",
                fn: "onFriendsViewSegmentedButtonToggle"
            },

            // Top toolbar buttons
            {
                delegate: "#friendsViewRemoveFriendsButton",
                event: "tap",
                fn: "onFriendsViewRemoveFriendsButtonTap"
            },
            {
                delegate: "#friendsViewRemoveFriendsDoneButton",
                event: "tap",
                fn: "onFriendsViewRemoveFriendsDoneButtonTap"
            },
            {
                delegate: "#friendsViewAddFriendsButton",
                event: "tap",
                fn: "onFriendsViewAddFriendsButtonTap"
            },
            {
                delegate: "#friendsViewEditGroupsButton",
                event: "tap",
                fn: "onFriendsViewEditGroupsButtonTap"
            },
            {
                delegate: "#friendsViewEditGroupsDoneButton",
                event: "tap",
                fn: "onFriendsViewEditGroupsDoneButtonTap"
            },
            {
                delegate: "#friendsViewCreateGroupButton",
                event: "tap",
                fn: "onFriendsViewCreateGroupButtonTap"
            },
            {
                delegate: "#groupMembersViewBackButton",
                event: "tap",
                fn: "onGroupMembersViewBackButtonTap"
            },

            // List disclosure/itemtap
            {
                delegate: "#friendsViewFriendsList",
                event: "itemtap",
                fn: "onFriendsViewFriendsListItemTap"
            },
            {
                delegate: "#friendsViewGroupsList",
                event: "itemtap",
                fn: "onFriendsViewGroupsListItemTap"
            },
            {
                delegate: "#friendsViewRequestsList",
                event: "itemtap",
                fn: "onFriendsViewRequestsListItemTap"
            },

            // Groups list name input blur
            {
                event: "blur",
                element: "element",
                delegate: ".groupNameInput",
                fn: "onGroupNameInputBlurred"
            },

            // Pull to refresh
            {
                delegate: "#friendsViewFriendsList",
                event: "pullToRefresh",
                fn: "onFriendsViewFriendsListRefresh"
            },
            {
                delegate: "#friendsViewGroupsList",
                event: "pullToRefresh",
                fn: "onFriendsViewGroupsListRefresh"
            },
            {
                delegate: "#friendsViewRequestsList",
                event: "pullToRefresh",
                fn: "onFriendsViewRequestsListRefresh"
            }
        ]
    },

    /* Event firings */
    // Top toolbar segmented button
    onFriendsViewSegmentedButtonToggle: function(segmentedButton, button, isPressed, options) {
        var tappedId = segmentedButton.getItems().indexOf(button);
        this.fireEvent("friendsViewSegmentedButtonToggled", tappedId);
    },

    // Top toolbar buttons
    onFriendsViewRemoveFriendsButtonTap: function() {
        this.fireEvent("friendsViewRemoveFriendsButtonTapped", "editable");
    },

    onFriendsViewRemoveFriendsDoneButtonTap: function() {
        this.fireEvent("friendsViewRemoveFriendsDoneButtonTapped", "uneditable");
    },

    onFriendsViewAddFriendsButtonTap: function() {
        this.fireEvent("friendsViewAddFriendsButtonTapped");
    },

    onFriendsViewEditGroupsButtonTap: function() {
        this.fireEvent("friendsViewEditGroupsButtonTapped", "editable");
    },

    onFriendsViewEditGroupsDoneButtonTap: function() {
        this.fireEvent("friendsViewEditGroupsDoneButtonTapped", "uneditable");
    },

    onFriendsViewCreateGroupButtonTap: function() {
        this.fireEvent("friendsViewCreateGroupButtonTapped");
    },

    onGroupMembersViewBackButtonTap: function() {
        this.fireEvent("groupMembersViewBackButtonTapped", /* source = */ "groupMembersView");
    },

    // List disclosure/itemtap
    onFriendsViewFriendsListItemTap: function(friendsList, index, target, record, event, options) {
        var deleteLock = Ext.fly(event.getTarget(".deleteLock"));
        if (deleteLock) {
            this.fireEvent("deleteLockTapped", friendsList, target, deleteLock, record);
        }
        else {
            this.fireEvent("friendsViewFriendsListItemTapped", record.getData()["memberId"]);
        }
    },

    onFriendsViewGroupsListItemTap: function(groupsList, index, target, record, event, options) {
        var deleteLock = Ext.fly(event.getTarget(".deleteLock"));
        if (deleteLock) {
            this.fireEvent("deleteLockTapped", groupsList, target, deleteLock, record);
        }
        else {
            this.fireEvent("friendsViewGroupsListItemTapped", record.getData()["memberId"]);
        }
    },

    onFriendsViewRequestsListItemTap: function(requestsList, index, target, record, event, options) {
        this.fireEvent("friendsViewRequestsListItemTapped", record.getData()["memberId"]);
    },

    // Groups list name input blur
    onGroupNameInputBlurred: function(event, target) {
        var groupNameInput = event.getTarget(".groupNameInput", 10, true);
        this.fireEvent("groupNameInputBlurred", groupNameInput);
    },

    onIgnoreRequestButtonTap: function(event, target) {
        var memberId = Ext.fly(target).parent(".member").getAttribute("data-memberId");
        this.fireEvent("ignoreRequestButtonTapped", memberId, "ignore");
    },

    // Pull to refresh
    onFriendsViewFriendsListRefresh: function() {
        this.fireEvent("friendsViewFriendsListRefreshed");
    },

    onFriendsViewGroupsListRefresh: function() {
        this.fireEvent("friendsViewGroupsListRefreshed");
    },

    onFriendsViewRequestsListRefresh: function() {
        this.fireEvent("friendsViewRequestsListRefreshed");
    },
});
