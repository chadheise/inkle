Ext.define("Ext.HTMLContainer", {
    extend: "Ext.Container",

	xtype: "htmlcontainer",

    requires: [
    	"Ext.Ajax"
    ],

    config: {
        // Create a new configuration called "url" so we can specify the URL
        url: null
    },

	initialize: function() {
        this.callParent();

        this.on({
            initialize: "onInitialize"
        })
    },

    onInitialize: function(me, container) {
        Ext.Ajax.request({
            // Use the getter for our new "url" config
            url: this.getUrl(),
            method: "POST",
            params: me.getData(),
            success: function(response, request) {
                // Use the setter for the HTML config
                me.setHtml(response.responseText);
            },
            failure: function(response, request) {
                me.setHtml("Failed: " + response.responseText);
            }
        });
    }
});