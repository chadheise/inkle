Ext.define("inkle.view.Offline", {
    extend: "Ext.Panel",

    xtype: "offlineView",

    config: {
        scrollable: false,
        style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",

        items: [
            {
                xtype: "container",
                html: [
                    "<center>",
                    "   <img src='resources/images/logoWhite.png' style='padding-top: 50px; padding-bottom: 60px; width: 80%;' />",
                    "   <p style='color: #FFFFFF; text-shadow: 0.1em 0.1em #333333;'>No Internet access!</p>",
                    "   <p style='color: #FFFFFF; padding: 20px; text-shadow: 0.1em 0.1em #333333;'>You must be connected to the Internet to use inkle.</p>",
                    "</center>"
                ].join("")
            }
        ]
    }
});