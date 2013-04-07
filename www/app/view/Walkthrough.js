Ext.define("inkle.view.Walkthrough", {
    extend: "Ext.Carousel",

    xtype: "walkthroughView",

    config: {
        ui: "light",

        items: [
            /* Main inkle logo */
            {
                html: [
                    "<div id='outerWalkthroughLogoContainer'>",
                        "<div id='innerWalkthroughLogoContainer'>",
                            "<img id='walkthroughLogo' src='resources/images/logoWhite.png' />",
                        "</div>",
                    "</div>"
                ].join("")
            },

            /* Get the ball rolling */
            {
                html: [
                    "<div class='outerWalkthroughInstructionContainer'>",
                        "<div class='innerWalkthroughInstructionContainer'>",
                            "<img class='walkthroughInstruction' src='resources/images/walkthrough/spreadTheWord.png' />",
                        "</div>",
                    "</div>"
                ].join("")
            },

            /* Spread the word */
            {
                html: [
                    "<div class='outerWalkthroughInstructionContainer'>",
                        "<div class='innerWalkthroughInstructionContainer'>",
                            "<img class='walkthroughInstruction' src='resources/images/walkthrough/spreadTheWord.png' />",
                        "</div>",
                    "</div>"
                ].join("")
            },

            /* Collaborate on the details*/
            {
                html: [
                    "<div class='outerWalkthroughInstructionContainer'>",
                        "<div class='innerWalkthroughInstructionContainer'>",
                            "<img class='walkthroughInstruction' src='resources/images/walkthrough/spreadTheWord.png' />",
                        "</div>",
                    "</div>"
                ].join("")
            },

            /* Organize and discover */
            {
                html: [
                    "<div class='outerWalkthroughInstructionContainer'>",
                        "<div class='innerWalkthroughInstructionContainer'>",
                            "<img class='walkthroughInstruction' src='resources/images/walkthrough/spreadTheWord.png' />",
                        "</div>",
                    "</div>"
                ].join("")
            }

            /*
                TODO: delete this comment

                GET THE BALL ROLLING
                Create an inkling to propose an activity to your friends. Provide as much or as little information as you have.
                Image: My inkling + button

                SPREAD THE WORD
                Invite your friends individually or by custom groups. Easily control who can and cannot see what you're doing.
                Image: Groups panel on invite friends

                COLLABORATE ON THE DETAILS
                Ditch the mass text messages. Chat with your friends and collectively update the plan, all in one place.
                Image: Inkling feed

                ORGANIZE AND DISCOVER
                Explore what your friends are up to. Get notified of changes to your upcoming inklings.
                Image: Tab bar
            */
        ]
    }
});