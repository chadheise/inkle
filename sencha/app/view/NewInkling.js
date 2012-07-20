Ext.define("inkle.view.NewInkling", {
	extend: "Ext.form.Panel",
	
	xtype: "newInklingView",
	
	requires: [
		"Ext.field.DatePicker",
		"Ext.field.Select"
	],
	
	config: {
		scrollable: true,
		
		items: [
			{
				xtype: "fieldset",
				
				items: [
					{
						xtype: "textfield",
						name: "location",
						label: "Location",
						placeHolder: "Optional",
						maxLength: 50
					},
					{
						xtype: "datepickerfield",
						name: "date",
						label: "Date",
						minValue: new Date(),
						value: new Date()
					},
					{
						xtype: "textfield",
						name: "time",
						label: "Time",
						placeHolder: "Optional",
						maxLength: 50
					},
					{
						xtype: "textfield",
						name: "category",
						label: "Category",
						placeHolder: "Optional",
						maxLength: 50
					},
					{
						xtype: "textareafield",
						name: "notes",
						label: "Notes",
						placeHolder: "Optional",
						maxLength: 150
					},
					{
						xtype: "selectfield",
						name: "shareWith",
						label: "Share with",
						usePicker: true,
						store: {
							fields: ["text", "value"],
							proxy: {
								type: "ajax",
								actionMethods: {
									read: "POST"
								},
								url: "http://127.0.0.1:8000/sencha/blots/",
								extraParams: {
									includeAllBlotsBlot: "true"
								},
								reader: {
									type: "json",
									rootProperty: "blots"
								}
							},
							autoLoad: true
						}
					},
					{
						xtype: "checkboxfield",
						name: "isPrivate",
						label: "Private?",
						checked: false
					}
				]
			}
		]
    }
});