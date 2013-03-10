Ext.define("inkle.view.NewInklingInvitedFriends", {
    extend: "Ext.Container",

    xtype: "newInklingInvitedFriendsView",

    config: {
        layout: "fit",
        scrollable: false,

        items: [
            /* Invited friends list */
            {
                xtype: "list",
                id: "newInklingInvitedFriendsList",
                cls: "membersList",
                loadingText: "Loading friends...",
                emptyText: "<div class='emptyListText'>No friends to invite</div>",
                grouped: true,
                disableSelection: true,
                indexBar: true,
                itemTpl: "{ html }",
                store: {
                    fields: [
                        "id",
                        "lastName",
                        "html"
                    ],
                    proxy: {
                        type: "ajax",
                        actionMethods: {
                            read: "POST"
                        },
                        url: inkle.app.baseUrl + "/friends/",
                        extraParams: {
                            mode: "invite"
                        }
                    },
                    grouper: {
                        groupFn: function(record) {
                            return record.get("lastName").substr(0, 1);
                        }
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

            /* Groups list */
            {
                xtype: "panel",
                id: "newInklingInvitedGroupsPanel",
                cls: "groupsListPanel",
                hidden: true,
                width: 250,
                height: 310,
                layout: "fit",
                items: [
                    {
                        xtype: "list",
                        id: "newInklingInvitedGroupsList",
                        cls: "groupListPanel",
                        loadingText: "Loading groups...",
                        emptyText: "<div class='emptyListText'>No groups to invite</div>",
                        disableSelection: true,
                        itemTpl: "{ html }",
                        store: {
                            fields: [
                                "html"
                            ],
                            proxy: {
                                type: "ajax",
                                actionMethods: {
                                    read: "POST"
                                },
                                url: inkle.app.baseUrl + "/groupsPanel/",
                                extraParams: {
                                    autoSetGroupsAsSelected: "false",
                                    inklingId: "-1"
                                }
                            },
                            autoLoad: false
                        }
                    }
                ],

                listeners: [
                    {
                        delegate: "#newInklingInvitedGroupsList",
                        event: "itemtap",
                        fn: "onNewInklingInvitedGroupsListItemTap"
                    },
                ],

                /* Event firings */
                onNewInklingInvitedGroupsListItemTap: function(newInklingInvitedGroupsList, index, target, record, event, options) {
                    var selectionButton = Ext.fly(event.getTarget(".selectionButton"));
                    if (selectionButton) {
                        this.fireEvent("groupSelectionButtonTapped", selectionButton);
                    }
                }
            }
        ],

        listeners: [
            {
                delegate: "#newInklingInvitedFriendsList",
                event: "itemtap",
                fn: "onNewInklingInvitedFriendsListItemTap"
            },
            {
                delegate: "#newInklingInvitedFriendsList",
                event: "pullToRefresh",
                fn: "onNewInklingInvitedFriendsListRefresh"
            }
        ]
    },

    /* Event firings */
    onNewInklingInvitedFriendsListItemTap: function(newInklingInvitedFriendsList, index, target, record, event, options) {
        var selectionButton = Ext.fly(event.getTarget(".selectionButton"));
        if (selectionButton) {
            this.fireEvent("memberSelectionButtonTapped", selectionButton);
        }
    },

    onNewInklingInvitedFriendsListRefresh: function() {
        this.fireEvent("newInklingInvitedFriendsListRefreshed");
    }
});
