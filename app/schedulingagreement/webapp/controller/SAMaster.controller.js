sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (Controller, JSONModel, Filter) {
	"use strict";

	return Controller.extend("sap.fiori.schedulingagreement.controller.SAMaster", {

		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
			this.filterModel = new sap.ui.model.json.JSONModel();
			this.listTemp = this.byId("idlistitem").clone();
			this.getView().byId("plantFilterId").setText();
		},

		onRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") !== "SAMaster") {
				return;
			}
			// var filter = [new sap.ui.model.Filter("Bukrs", "EQ", sessionStorage.getItem("compCode") || "1000")];
			// if (sap.ui.getCore().getModel("filterModel").getData().Vendor_No) {
			// 	filter.push(new sap.ui.model.Filter("Vendor_No", "EQ", sap.ui.getCore().getModel("filterModel").getData().Vendor_No));
			// }
			this.unitCode = sessionStorage.getItem("unitCode") || "P04";
			this.AddressCodeSA = sessionStorage.getItem("AddressCodeSA");
			this.byId("masterListId").bindAggregation("items", {
				path: "/SchedulingAgreements",
				parameters: {
					custom: {
						AddressCode: this.AddressCodeSA,
						UnitCode: this.unitCode
					},
					countMode: 'None'
				},
				// filters: filter,
				template: this.listTemp
			});
			this.routeToDetail();
		},

		routeToDetail: function () {
			this.byId("masterListId").getBinding("items").attachDataReceived(() => {
				var selectedItem = this.byId("masterListId").getItems()[0];
				if (selectedItem) {
					this.byId("masterListId").setSelectedItem(selectedItem, true);
					var SchNum = selectedItem.getProperty("title").replace(/\//g, '-');
					this.router.navTo("SADetail", {
						"Schedule_No": SchNum,
						"UnitCode": this.unitCode
					});
				} else {
					this.router.navTo('NoData');
				}
			});
		},

		onListItemPress: function (oEvent) {
			var SchNo = oEvent.getParameter("listItem").getProperty("title");
			var SchNum = SchNo.replace(/\//g, '-');
			this.router.navTo("SADetail", {
				"Schedule_No": SchNum,
				"UnitCode": this.unitCode
			});
		},

		onSearch: function (evt) {
			if (evt.getParameter("refreshButtonPressed") === true) {
				this.getView().byId("masterListId").getBinding("items").refresh(true);
			} else {
				var sValue = evt.getParameter("query");
				var sp = sValue ? { custom: { search: sValue } } : "";
				// var filter = [new sap.ui.model.Filter("Bukrs", "EQ", sessionStorage.getItem("compCode") || "1000")];
				// if (sap.ui.getCore().getModel("filterModel").getData().Vendor_No) {
				// 	filter.push(new sap.ui.model.Filter("Vendor_No", "EQ", sap.ui.getCore().getModel("filterModel").getData().Vendor_No));
				// }
				this.byId("masterListId").bindAggregation("items", {
					path: "/SchedulingAgreements?search=" + sValue,
					parameters: {
						custom: {
							AddressCode: this.AddressCodeSA,
							unitCode: this.unitCode
						}
					},
					// filters: filter,
					template: this.listTemp
				});
			}
			this.routeToDetail();
		},

		onPlantValueHelp: function () {
			if (!this.PlantF4Frag) {
				this.PlantF4Frag = sap.ui.xmlfragment("sap.fiori.schedulingagreement.fragment.PlantFrag", this);
				this.PlantF4Temp = sap.ui.getCore().byId("plantTempId").clone();
			}
			this.PlantF4Frag.setModel(new JSONModel(JSON.parse(sessionStorage.getItem("CodeDetails"))), "plantModel");
			this.getView().addDependent(this.PlantF4Frag);
			// sap.ui.getCore().byId("plantF4Id").bindAggregation("items", {
			// 	path: this.plantModel,
			// 	template: this.PlantF4Temp
			// });
			sap.ui.getCore().byId("plantF4Id")._searchField.setVisible(false);
			this.PlantF4Frag.open();
		},

		handlePlantClose: function (oEvent) {
			this.unitCodeFilter = oEvent.getParameter("selectedItem").getProperty("title");
			this.desc = oEvent.getParameter("selectedItem").getProperty("description");
			//sessionStorage.setItem("unitCode", data);
			this.PlantF4Frag.destroy();
			this.PlantF4Frag = "";
			this.getData();
		},

		handlePlantCancel: function () {
			this.PlantF4Frag.destroy();
			this.PlantF4Frag = "";
		},
		getData: function () {
			this.getView().byId("clearFilterId").setVisible(true);
			this.PlantFilter = this.unitCodeFilter + "(" + this.desc + ")";
			this.getView().byId("plantFilterId").setText(this.PlantFilter);
			this.AddressCodeSA = sessionStorage.getItem("AddressCodeSA") || 'JSE-01-01';
			this.byId("masterListId").bindAggregation("items", {
				path: "/SchedulingAgreements",
				parameters: {
					custom: {
						AddressCode: this.AddressCodeSA,
						UnitCode: this.unitCodeFilter
					},
					countMode: 'None'
				},
				template: this.listTemp
			});
			this.routeToDetail();
		},
		onFilterClear: function () {
			this.getView().byId("clearFilterId").setVisible(false);
			this.getView().byId("plantFilterId").setText("");
			var unitCode = sessionStorage.getItem("unitCode") || "P01";
			this.AddressCodeSA = sessionStorage.getItem("AddressCodeSA") || 'JSE-01-01';
			this.byId("masterListId").bindAggregation("items", {
				path: "/SchedulingAgreements",
				parameters: {
					custom: {
						AddressCode: this.AddressCodeSA,
						UnitCode: unitCode
					},
					countMode: 'None'
				},
				template: this.listTemp
			});
			this.routeToDetail();
		},
		
	});
});