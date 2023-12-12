sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.fiori.schedulingagreement.controller.ItemDisplay", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.fiori.schedulingagreement.view.ItemDisplay
		 */
		onInit: function() {

			this.oDataModel = sap.ui.getCore().getModel("oDataModel");
			// this.oDataModel = this.getView().getModel();

			this.getView().setModel(this.oDataModel);

			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this._handleRouteMatched, this);

			this.itemModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.itemModel, "itemModel");
		},

		_handleRouteMatched: function(evt) {

			var that = this;
			this.pItemModel = sap.ui.getCore().getModel("pItemModel");
			this.getView().setModel(this.pItemModel, "pItemModel");
			this.pData = this.pItemModel.getData();
			if ("ItemDisplay" !== evt.getParameter("name")) {
				return;
			}
			this.Schedule_No = evt.getParameter("arguments").Schedule_No;
			this.Item_No = evt.getParameter("arguments").Item_No;
			this.Material_No = evt.getParameter("arguments").Material_No;
			this.Uom = evt.getParameter("arguments").Uom;
			this.oDataModel.read("/S_LINEITEMSSet?$filter=Schedule_No eq '"+ this.Schedule_No +"' and Schedule_Item eq '"+ this.Item_No +"' and Material_No eq '"+ this.Material_No +"' and Uom eq '"+ this.Uom +"'",
				null,
				null,
				false,
				function(oData, oResponse) {
					that.itemModel.setData(oData);
					that.itemModel.refresh(true);

				});

		},
		onNavBack : function() {  
		jQuery.sap.require("sap.ui.core.routing.History");
		var oHistory = sap.ui.core.routing.History.getInstance(),    
		sPreviousHash = oHistory.getPreviousHash(); 

		if (sPreviousHash !== undefined) {   
			// The history contains a previous entry    
			history.go(-1);   
		} else {    
			// Otherwise we go backwards with a forward history  
			var bReplace = true;   
			this.router.navTo("SASplit", 
					{}, bReplace);  
		}
	}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf sap.fiori.schedulingagreement.view.ItemDisplay
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf sap.fiori.schedulingagreement.view.ItemDisplay
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf sap.fiori.schedulingagreement.view.ItemDisplay
		 */
		//	onExit: function() {
		//
		//	}

	});

});