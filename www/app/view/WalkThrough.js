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
                    html : "<h1>Get the ball rolling</h1>" +
                        "<p>Create an inkling to propose an activity to your friends. Provide as much or as little information as you have.</p>",
                    style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                },
                {
                  html: '<div class="spreadTheWord"></div>',
                  style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                },
                {
                    html : "<h1>Spread the word</h1>" +
                        "<p>Invite your friends individually or by custom groups. Easily control who can and cannot see what you're doing.</p>",
                    style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                },
                {
                    html : "<h1>Collaborate on the details</h1>" +
                        "<p>Ditch the mass text messages. Chat with your friends and collectively update the plan, all in one place.</p>",
                    style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                },
                {
                    html : "<h1>Organize and discover</h1>" +
                        "<p>Explore what your friends are up to.</p>" +
                        "<p>Get notified of changes to your upcoming inklings.",
                    style: "background-image: -webkit-radial-gradient(center, circle farthest-corner, #288D42 0%, #1A492B 100%)",
                }
            ],

		listeners: [

        ]
	},
	
	// Event firings

});
