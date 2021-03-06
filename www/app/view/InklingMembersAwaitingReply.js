Ext.define("inkle.view.InklingMembersAwaitingReply", {
	extend: "Ext.Container",

	xtype: "inklingMembersAwaitingReply",

    requires: [
    	"Ext.dataview.List"
    ],

	config: {
	    layout: "card",

	    items: [
	        {
                xtype: "list",
                id: "inklingMembersAwaitingReplyList",
                cls: "membersList",
                loadingText: "Loading members...",
                emptyText: "<div class='emptyListText'>No members</div>",
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
                        url: inkle.app.baseUrl + "/inklingMembersAwaitingReply/",
                        actionMethods: {
                            read: "POST"
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
            }
        ]
    }
});
