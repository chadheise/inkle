Ext.define("inkle.view.WalkThrough", {
	extend: "Ext.Carousel",
	id: "walkThrough",
	xtype: "walkThroughView",
   
    requires: [
	],

    config: {
        fullscreen: true,
        ui: "light",
            defaults: {
                styleHtmlContent: true
            },

            items: [
                {
                    html : '<ul><li>I want to do something</li>' +
                        '<li>Get info about event: location, time, etc</li>' +
                        '</ul>' +
                        '<p>Location icon, calendar icon</p>' +
                        '<p>My Inkling "+" image</p>',
                    style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                },
                {
                    html : '<ul><li>Invite People</li>' +
                        '<li>Groups</li>' +
                        '<li>Sharing</li>' +
                        '</ul>' +
                        '<p>Friends icon</p>' +
                        '<p>Groups panel on invite friends page</p>',
                    style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                },
                {
                    html : '<ul><li>Chat/Fill in details</li>' +
                        '<li>Feed</li>' +
                        '<li>Inkling details</li>' +
                        '</ul>' +
                        '<p>Feed icon</p>' +
                        '<p>Feed list image</p>',
                    style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                },
                {
                    html : '<ul><li>All/My Inklings</li>' +
                        '</ul>' +
                        '<p>inkling icon</p>' +
                        '<p>All inkling/my inkling tabs image</p>',
                    style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                }
            ],

		listeners: [

        ]
	},
	
	// Event firings

});
