Ext.define("inkle.view.NewInkling", {
	extend: "Ext.form.Panel",
	
	xtype: "newInklingView",
	
	requires: [
		"Ext.field.DatePicker"
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