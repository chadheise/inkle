Ext.define("inkle.view.Main", {
    extend: "Ext.tab.Panel",
    
    requires: [
    	"Ext.TitleBar"
    ],
    
    xtype: "mainTabView",
    
    config: {
        tabBarPosition: "bottom",
        //ui: "customTabBar",
        
        items: [
            {
            	xtype: "allInklingsView"
            },
            {
            	xtype: "myInklingsView"
            },
            {
            	xtype: "friendsView"
            },
            {
            	xtype: "settingsView"
            }
        ]
    }
});