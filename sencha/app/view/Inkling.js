Ext.define("inkle.view.Inkling", {
	extend: "Ext.HTMLContainer",
	
	xtype: "inklingView",
	
	config: {
		scrollable: true,
		
    	url: "http://127.0.0.1:8000/sencha/inkling/",
    	
    	listeners: [
        	{
				event: "tap",
				element: "element",
				delegate: "#editInklingButton",
				fn: "onEditInklingButtonTap"
        	}
    	]
    },
    
    // Event firings
    onEditInklingButtonTap: function() {
        this.fireEvent("editInklingButtonTapped");
    }
});