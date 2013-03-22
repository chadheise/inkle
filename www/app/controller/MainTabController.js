Ext.define("inkle.controller.MainTabController", {
    extend: "Ext.app.Controller",

    config: {
        refs: {
            // Views
            mainTabView: "mainTabView",
            myInklingsView: "myInklingsView",
            friendsView: "friendsView",

            // Toolbar buttons
            inklingInvitationsButton: "#inklingInvitationsButton",
            friendRequestsButton: "#friendsViewRequestsButton"
        },

        control: {
            mainTabView: {
                // Tab events
                activate: "activateMainTabView",
                activeitemchange: "activeItemChangeMainTabView"
            }
        }
    },

    /****************/
    /*  TAB EVENTS  */
    /****************/
    /* Activates the main tab view */
    activateMainTabView: function(mainTabView, activeView, previouslyActiveView, options) {
        if (!previouslyActiveView) {
            this.updateMyInklingsTabBadge(activeView);
            this.updateFriendsTabBadge(activeView);
        }
    },


    /* Cleans up the tabs when the main tab view's activate item changes */
    activeItemChangeMainTabView: function (mainTabView, activeView, previouslyActiveView, options) {
        this.updateMyInklingsTabBadge(activeView);
        this.updateFriendsTabBadge(activeView);
    },


   /* Updates the my inklings tab badge */
    updateMyInklingsTabBadge: function(activeView) {
        // If the my inklings view is now active, hide its tab's badge
        var myInklingsViewTab = this.getMainTabView().getTabBar().getAt(1);
        if (activeView == this.getMyInklingsView()) {
            myInklingsViewTab.setBadgeText("");
        }

        // Otherwise, determine its tab's badge text
        else {
            Ext.Ajax.request({
                url: inkle.app.baseUrl + "/numInklingInvitations/",

                success: function(response) {
                    var numInklingInvites = response.responseText;

                    if (numInklingInvites == 0) {
                        myInklingsViewTab.setBadgeText("");
                    }
                    else {
                        myInklingsViewTab.setBadgeText(numInklingInvites);
                        this.getInklingInvitationsButton().setBadgeText(numInklingInvites);
                    }
                },

                failure: function(response) {
                    console.log(response.responseText);
                },

                scope: this
            });
        }
    },


    /* Updates the friends tab badge */
    updateFriendsTabBadge: function(activeView) {
        // If the friends view is now active, hide its tab's badge
        var friendsViewTab = this.getMainTabView().getTabBar().getAt(2);
        if (activeView == this.getFriendsView()) {
            friendsViewTab.setBadgeText("");
        }

        // Otherwise, determine its tab's badge text
        else {
            Ext.Ajax.request({
                url: inkle.app.baseUrl + "/numFriendRequests/",

                success: function(response) {
                    var numFriendRequests = response.responseText;

                    if (numFriendRequests == 0) {
                        friendsViewTab.setBadgeText("");
                    }
                    else {
                        friendsViewTab.setBadgeText(numFriendRequests);
                        this.getFriendRequestsButton().setBadgeText(numFriendRequests);
                    }
                },

                failure: function(response) {
                    console.log(response.responseText);
                },

                scope: this
            });
        }
    }
});
