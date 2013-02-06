Ext.define("inkle.view.Inkling", {
	extend: "Ext.HTMLContainer",
	
	xtype: "inklingView",
	
	config: {
		scrollable: true,
		
        url: inkle.app.getBaseUrl() + "/inkling/",

        listeners: [
            {
				event: "tap",
				element: "element",
				delegate: "#editInklingButton",
				fn: "onEditInklingButtonTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: ".memberPicture",
                fn: "onMemberPictureTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: "#membersAttendingDisclosureArrow",
                fn: "onMembersAttendingDisclosureArrowTap"
            },
            {
                event: "tap",
                element: "element",
                delegate: "#membersAwaitingReplyDisclosureArrow",
                fn: "onMembersAwaitingReplyDisclosureArrowTap"
            }
        ]
    },
    
    // Event firings
    onEditInklingButtonTap: function() {
        this.fireEvent("editInklingButtonTapped");
    },
    
    onMemberPictureTap: function(event) {
        var target = event.getTarget(".memberPicture");
        var tappedMemberName = target.getAttribute("memberName");
        this.fireEvent("memberPictureTapped", tappedMemberName, target);
    },
    
    onMembersAttendingDisclosureArrowTap: function() {
        this.fireEvent("membersAttendingDisclosureArrowTapped");
    },
    
    onMembersAwaitingReplyDisclosureArrowTap: function() {
        this.fireEvent("membersAwaitingReplyDisclosureArrowTapped");
    }
});
