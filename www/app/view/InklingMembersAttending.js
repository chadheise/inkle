Ext.define("inkle.view.InklingMembersAttending", {
	extend: "Ext.Container",
	
	xtype: "inklingMembersAttending",
	
    requires: [
    	"Ext.dataview.List"
    ],
	
	config: {
	    layout: "card",
	    
	    items: [
	        {
                xtype: "list",
                id: "inklingMembersAttendingList",
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
                        "id",
                        "lastName",
                        "html"
                    ],
                    proxy: {
                        type: "ajax",
                        url: "http://127.0.0.1:8000/sencha/inklingMembersAttending/",
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