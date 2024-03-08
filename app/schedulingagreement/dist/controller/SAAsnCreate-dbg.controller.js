sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"

], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.schedulingagreement.controller.SAAsnCreate", {
		onInit: function () {

			// this.loginModel = sap.ui.getCore().getModel("loginModel");
			// this.loginData = this.loginModel.getData();

			//this.selectedItems = [];

			this.oDataModel = sap.ui.getCore().getModel("oDataModel");

			this.getView().addStyleClass("sapUiSizeCompact");

			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.handleRouteMatched, this);

			this.asnModel = new sap.ui.model.json.JSONModel();
			this.asnModel.setSizeLimit(100000000);
			this.getView().setModel(this.asnModel, "asnModel");
			this.detailHeaderModel = new sap.ui.model.json.JSONModel();
			this.detailHeaderModel.setSizeLimit(1000);
			this.getView().setModel(this.detailHeaderModel, "detailHeaderModel");

			this.getView().byId("AsnCreateTable").setSticky(["ColumnHeaders", "HeaderToolbar"]);

			// this.asnCreateModel = new sap.ui.model.json.JSONModel();
			// this.getView().setModel(this.asnCreateModel, "asnCreateModel");
			this.dateConfirmationModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.dateConfirmationModel, "DateConfirmationModel");

			this.popOverModel = new sap.ui.model.json.JSONModel();
			//this.uploadCollectionTemp = this.getView().byId("UploadCollItemId").clone();
			this.byId("uploadSet").attachEvent("openPressed", this.onOpenPressed, this);
		},
		handleRouteMatched: function (event) {
			var oModel = this.getView().getModel();
			var oUploadSet = this.byId("uploadSet");
			oUploadSet.removeAllItems();

			if (event.getParameter("name") === "SAAsnCreate") {

				this.byId("rateOk").setSelected(true);

				this.modulePath = jQuery.sap.getModulePath("sap/fiori/schedulingagreement");
				this.modulePath = this.modulePath === "." ? "" : this.modulePath;

				this.byId("totalInvNetAmnt").setValueState("None");
				this.byId("totalGstAmnt").setValueState("None");

				var that = this;
				this.getView().byId("AsnCreateTable").removeSelections(true);
				var datePicker = this.getView().byId("DP1");

				datePicker.addDelegate({
					onAfterRendering: function () {
						datePicker.$().find('INPUT').attr('disabled', true).css('color', '#000000');
					}
				}, datePicker);

				//=====================================================================

				// var oTable = this.getView().byId('AsnCreateTable');
				// oTable.addDelegate({
				// 	onAfterRendering: function () {
				// 		var header = this.$().find('thead');
				// 		var selectAllCb = header.find('.sapMCb');
				// 		selectAllCb.remove();

				// 		this.getItems().forEach(function (r) {
				// 			var Index = r.getBindingContext("asnModel").getPath().split("/")[3];
				// 			// var obj = r.getBindingContext("asnModel").getObject();
				// 			// var status = obj.Status;
				// 			var cb = r.$().find('.sapMCb');
				// 			var oCb = sap.ui.getCore().byId(cb.attr('id'));
				// 			if (Index == 0) {
				// 				oCb.setEnabled(true);
				// 			} else {
				// 				oCb.setEnabled(false);
				// 			}
				// 		});
				// 	}
				// }, oTable);

				//=====================================================================

				// code for date Restriction
				// this.getView().byId("DP1").setDateValue(new Date());
				// var fdate = new Date();
				// this.getView().byId("DP1").setMaxDate(fdate);
				var Today = new Date();
				// var Tomorrow = new Date();
				// var Yesterday = new Date();

				// Yesterday.setDate(Today.getDate() - 4);
				// Tomorrow.setDate(Today.getDate() + 1);
				// this.getView().byId("DP1").setDateValue(new Date());
				// this.getView().byId("DP1").setMinDate(Yesterday);
				this.getView().byId("DP1").setMaxDate(Today);

				//this.checkData = [];
				var Schedule_No = event.getParameter("arguments").Schedule_No;
				this.Schedule_No = Schedule_No.replace(/-/g, '/');
				var unitCode = sessionStorage.getItem("unitCode") || "P01";
				this.AddressCodeSA = sessionStorage.getItem("AddressCodeSA") || 'REP-04-04';
				var oModel = this.getOwnerComponent().getModel();
				this.getView().setModel(new sap.ui.model.json.JSONModel({ minDate: new Date() }), "dateModel");
				var request = "/SchedulingAgreements";
				oModel.read(request, {
					urlParameters: {
						"$expand": "DocumentRows",
						AddressCode: this.AddressCodeSA,
						UnitCode: unitCode,
						SchNum: this.Schedule_No
					},
					success: function (oData) {
						var filteredPurchaseOrder = oData.results.find(po => po.ScheduleNum === that.Schedule_No);
						if (filteredPurchaseOrder) {
							that.detailHeaderModel.setData(filteredPurchaseOrder);
							that.detailHeaderModel.refresh(true);

							that.asnModel.setData(filteredPurchaseOrder);
							that.asnModel.refresh(true);
							// var asnModelData = that.getView().getModel("asnModel").getData();
							// for (var i = 0; i < asnModelData.DocumentRows.results.length; i++) {
							// 	asnModelData.DocumentRows.results[i].ASSValue = parseFloat(asnModelData.DocumentRows.results[i].BalanceQty) * parseFloat(asnModelData.DocumentRows.results[i].UnitPrice);
							// 	if (asnModelData.DocumentRows.results[i].Packing) {
							// 		asnModelData.DocumentRows.results[i].ASSValue = parseFloat(asnModelData.DocumentRows.results[i].ASSValue) + parseFloat(asnModelData.DocumentRows.results[i].Packing);
							// 	}
							// 	if (asnModelData.DocumentRows.results[i].Frieght) {
							// 		asnModelData.DocumentRows.results[i].ASSValue = parseFloat(asnModelData.DocumentRows.results[i].ASSValue) + parseFloat(asnModelData.DocumentRows.results[i].Frieght);
							// 	}
							// 	if (asnModelData.DocumentRows.results[i].OtherCharges) {
							// 		asnModelData.DocumentRows.results[i].ASSValue = parseFloat(asnModelData.DocumentRows.results[i].ASSValue) + parseFloat(asnModelData.DocumentRows.results[i].OtherCharges);
							// 	}
							// }
							that.asnModel.refresh(true);
							//that.initializeScheduleNumber();
						} else {
							MessageBox.error("Schedule agreement not found");
						}
					},
					error: function (oError) {
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);
					}
				});
				// ,App='SA'
				//this.oDataModel.read("/ASN_HEADERSet(Schedule_No='" + this.Schedule_No + "')?$expand=ASNItemnav",
				//sap.ui.core.BusyIndicator.show();
				// this.oDataModel.read("/ASN_HEADERSet(Schedule_No='" + this.Schedule_No + "')", {
				// 	urlParameters: {
				// 		"$expand": "ASNItemnav"
				// 	},
				// 	success: function (oData, oResponse) {
				// 		sap.ui.core.BusyIndicator.hide();
				// 		var POItems = oData.ASNItemnav.results;
				// 		let pkgMatQty;
				// 		var msg = '';
				// 		var arr = [];
				// 		oData.ASNItemnav.results = POItems.filter(function (item) {
				// 			pkgMatQty = parseFloat(item.Menge) / parseFloat(item.SOQ);
				// 			item.PkgMatQty = isNaN(pkgMatQty) ? "0" : isFinite(pkgMatQty) === false ? "0" : (Math.ceil(pkgMatQty)).toString();
				// 			item.NetprVen = item.Netpr.trim();
				// 			return item.Menge !== "0.00";
				// 		});

				// 		for (var i = 0; i < oData.ASNItemnav.results.length; i++) {
				// 			if (oData.ASNItemnav.results[i].Meins == "EA") {
				// 				oData.ASNItemnav.results[i].Menge = parseInt(oData.ASNItemnav.results[i].Menge).toString();
				// 			}
				// 			that.checkData.push({
				// 				"Ebelp": oData.ASNItemnav.results[i].Ebelp,
				// 				"Etenr": oData.ASNItemnav.results[i].Etenr,
				// 				"Matnr": oData.ASNItemnav.results[i].Matnr,
				// 				"Menge": oData.ASNItemnav.results[i].Menge
				// 			}); //To check ASN qty for previous line item

				// 			// if(oData.ASNItemnav.results[i].Warningmsg!= '')
				// 			// 	msg = msg + "\n" + oData.ASNItemnav.results[i].Warningmsg;
				// 			if (oData.ASNItemnav.results[i].Warningmsg != '') {
				// 				arr.push(oData.ASNItemnav.results[i].Warningmsg);
				// 			}
				// 		}
				// 		var RemovedupArr = that.removeDuplicates(arr);
				// 		for (var i = 0; i < RemovedupArr.length; i++) {
				// 			msg = msg + "\n" + RemovedupArr[i];
				// 		}
				// 		// POItems.forEach(function (item, index, object) {
				// 		// 	if (item.Menge === "0.00") {
				// 		// 		object.splice(index, 1);
				// 		// 	}
				// 		// });

				// 		oData.UnplannedCost = oData.UnplannedCost ? oData.UnplannedCost : 0;
				// 		that.asnModel.setData(oData);
				// 		that.asnModel.refresh(true);
				// 		// that.getView().byId("DP1").setDateValue(new Date());
				// 		var oTable = that.getView().byId("AsnCreateTable");
				// 		var oBindingInfo = oTable.getBindingInfo('items');
				// 		delete oBindingInfo.filters;
				// 		oTable.bindAggregation('items', oBindingInfo);
				// 		setTimeout(() => {
				// 			if (msg && msg != '')
				// 				MessageBox.warning(msg);
				// 		}, 1000);
				// 	},
				// 	error: function (oError) {
				// 		sap.ui.core.BusyIndicator.hide();
				// 		var value = JSON.parse(oError.response.body);
				// 		MessageBox.error(value.error.message.value, {
				// 			onClose: function () {
				// 				sap.fiori.schedulingagreement.controller.formatter.onNavBack();
				// 			}
				// 		});
				// 	}
				// });

				// Get CSRF token

				// if (!this.header_xcsrf_token) {
				// 	var model = this.getView().getModel();
				// 	var oServiceUrl = model.sServiceUrl + "/";
				// 	var that = this;

				// 	sap.ui.core.BusyIndicator.show(0);
				// 	model._request({
				// 		requestUri: oServiceUrl,
				// 		method: "GET",
				// 		headers: {
				// 			"X-Requested-With": "XMLHttpRequest",
				// 			"Content-Type": "application/atom+xml",
				// 			"DataServiceVersion": "2.0",
				// 			"X-CSRF-Token": "Fetch"
				// 		}
				// 	}, function (data, response) {
				// 		sap.ui.core.BusyIndicator.hide();
				// 		that.header_xcsrf_token = response.headers["x-csrf-token"];
				// 	});
				// }
				// sap.ui.core.BusyIndicator.hide();
				// var slash = window.location.href.includes("site") ? "/" : "";
				// var modulePath = jQuery.sap.getModulePath("sap/fiori/schedulingagreement");
				// modulePath = modulePath === "." ? "" : modulePath;
				// var serviceUrl = modulePath + slash + "sap/opu/odata/shiv/NW_SUPP_PORTAL_SA_SRV/AsnAttachementSet";
				// var site = window.location.href.includes("site");
				// if (site) {
				// 	this.getView().byId("UploadCollection").setUploadUrl(serviceUrl);
				// }
				// else
				// 	this.getView().byId("UploadCollection").setUploadUrl("/sap/opu/odata/shiv/NW_SUPP_PORTAL_SA_SRV/AsnAttachementSet");

			}
			sap.ui.core.BusyIndicator.hide();
		},
		// removeDuplicates: function (arr) {
		// 	return arr.filter((item,
		// 		index) => arr.indexOf(item) === index);
		// },
		onUnplannedCostChange: function (oEvent) {
			if (oEvent.getParameter("newValue").includes("-")) {
				MessageBox.error("Unplanned cost less than 0 is not allowed!");
				var newVal = Math.abs(parseFloat(oEvent.getParameter("newValue")));
				oEvent.getSource().setValue(newVal);
			}
			if (oEvent.getParameter("newValue").includes(".")) {
				var splitValue = oEvent.getParameter("newValue").split(".");
				if (splitValue[1].length > 2) {
					MessageBox.error("Value upto 2 decimals is allowed.");
					oEvent.getSource().setValue(parseFloat(oEvent.getParameter("newValue")).toFixed(2));
				}
			}
		},

		onSwitchChange: function (e) {
			const val = e.getParameter("state");
			var obj = e.getSource().getParent().getBindingContext("asnModel").getObject();
			if (val == true)
				obj.TaxChange = "X";
			else
				obj.TaxChange = "";
			this.asnModel.refresh(true);
		},
		onQuanChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("asnModel").getObject();
			var Meins = obj.Meins;
			obj.Menge = val;
			if (Meins == "EA") {
				if (val.includes(".")) {
					MessageBox.error("Fractional Values are not allowed");
					e.getSource().setValue(parseInt(val, 10).toString());
					return;
				}
			}
			const pkgMatQty = parseFloat(val) / parseFloat(obj.SOQ);
			obj.PkgMatQty = isNaN(pkgMatQty) ? "0" : isFinite(pkgMatQty) === false ? "0" : (Math.ceil(pkgMatQty)).toString();

			var oTable = this.getView().byId("AsnCreateTable");
			var contexts = oTable.getSelectedContexts();

			// for (var i = 0; i < contexts.length; i++) {
			// 	var index = contexts[i].getPath().substring(contexts[i].getPath().lastIndexOf("/") + 1);
			// 	var item = contexts[i].getProperty();
			// 	for (var j = 0; j < oTable.getItems().length; j++) {
			// 		// if (oTable.getItems()[index - 1]) {
			// 		var previousItem = oTable.getItems()[j].getBindingContext("asnModel").getProperty();
			// 		var previousIndex = oTable.getItems()[j].getBindingContext("asnModel").getPath()
			// 			.substring(oTable.getItems()[j].getBindingContext("asnModel").getPath().lastIndexOf("/") + 1);
			// 		if ((previousItem.Matnr === item.Matnr && previousItem.Ebelp === item.Ebelp) && parseInt(previousIndex) < parseInt(index) &&
			// 			(!oTable.getItems()[j].getSelected() || (previousItem.Menge !== this.checkData[previousIndex].Menge))) {
			// 			var forwardItem = oTable.getItems()[j + 1].getBindingContext("asnModel").getProperty();
			// 			if (forwardItem.Matnr === item.Matnr && forwardItem.Ebelp === item.Ebelp) {
			// 				oTable.getItems()[j + 1].setSelected(false);
			// 			}
			// 			// MessageBox.error("Please select the schedule line item " + previousItem.Etenr);
			// 			// return;
			// 		}
			// 	}
			// }

			var selected = e.getSource().getParent().getProperty("selected");
			var data = this.asnModel.getData();
			data.ASNamt = 0;
			var index = e.getSource().getParent().getBindingContext("asnModel").getPath().split("/")[3];
			var items = contexts.map(function (c) {
				return c.getObject();
			});

			data.ASNItemnav.results[index].Menge = e.getSource().getValue();

			for (var i = 0; i < items.length; i++) {

				if (!items[i].Netpr) {
					items[i].Netpr = 0;
				}
				if (!items[i].Cgst) {
					items[i].Cgst = 0;
				}
				if (!items[i].Igst) {
					items[i].Igst = 0;
				}
				if (!items[i].Sgst) {
					items[i].Sgst = 0;
				}

				// data.ASNamt = parseFloat(data.ASNamt) + (parseFloat(items[i].Menge) * ((parseFloat(items[i].Netpr)) + (parseFloat(items[i].Cgst)) +
				// 	(parseFloat(items[i].Igst)) + (parseFloat(items[i].Sgst))));
				var NetPr = (parseFloat(items[i].Menge) * (parseFloat(items[i].Netpr))).toFixed(2);
				var Cgst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Cgst))).toFixed(2);
				var Igst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Igst))).toFixed(2);
				var Sgst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Sgst))).toFixed(2);

				data.ASNamt = parseFloat(data.ASNamt) + parseFloat(NetPr) + parseFloat(Cgst) + parseFloat(Igst) + parseFloat(Sgst);
				// data.ASNamt = parseFloat(data.ASNamt).toFixed(2);
			}
			// }
			data.ASNamt = parseFloat(data.ASNamt).toFixed(2);
			//PP Change
			//data.ASNamt = Math.round(data.ASNamt);

			data.InvoiceAmt = data.ASNamt;
			var InvoiceVal = +this.asnModel.getData().InvoiceAmt + +this.asnModel.getData().UnplannedCost;
			this.asnModel.getData().InvoiceVal = parseFloat(InvoiceVal).toFixed(2);

			//PP Change
			//Math.round(InvoiceVal.toFixed(2));
			this.asnModel.refresh(true);

			// this.onAsnQtyChange(e);
		},

		onAsnQtyChange: function (oEvent) {
			var Obj = oEvent.getSource().getParent().getBindingContext("asnModel").getObject();

			var CurrentLineItemIndex = oEvent.getSource().getParent().getBindingContext("asnModel").getPath().split("/")[3];

			var CurrentLineSelected = oEvent.getSource().getParent().getSelected();
			var CurrentLineAsnQtyDifference = parseFloat(Obj.Con_Qty) - (parseFloat(Obj.Asn_Created) + parseFloat(Obj.Menge));

			var oTable = this.getView().byId("AsnCreateTable");
			oTable.getItems().forEach(function (r) {

				var Index = r.getBindingContext("asnModel").getPath().split("/")[3];

				var cb = r.$().find('.sapMCb');
				var oCb = sap.ui.getCore().byId(cb.attr('id'));
				if (Index > CurrentLineItemIndex) {
					if (Index == parseInt(CurrentLineItemIndex, 10) + 1 && CurrentLineSelected && parseFloat(CurrentLineAsnQtyDifference) == 0) {
						oCb.setEnabled(true);
					} else {
						oCb.setSelected(false);
						oTable.setSelectedItem(r, false);
						oCb.setEnabled(false);
					}
				}
			});
		},
		onSelectionChangeEnableDisableCheck: function (oEvent) {
			var Obj = oEvent.getParameter("listItem").getBindingContext("asnModel").getObject();

			var CurrentLineItemIndex = oEvent.getParameter("listItem").getBindingContext("asnModel").getPath().split("/")[3];

			var CurrentLineSelected = oEvent.getParameter("listItem").getSelected();
			var CurrentLineAsnQtyDifference = parseFloat(Obj.Con_Qty) - (parseFloat(Obj.Asn_Created) + parseFloat(Obj.Menge));

			var oTable = this.getView().byId("AsnCreateTable");
			oTable.getItems().forEach(function (r) {

				var Index = r.getBindingContext("asnModel").getPath().split("/")[3];

				var cb = r.$().find('.sapMCb');
				var oCb = sap.ui.getCore().byId(cb.attr('id'));
				if (Index > CurrentLineItemIndex) {
					if (Index == parseInt(CurrentLineItemIndex, 10) + 1 && CurrentLineSelected && parseFloat(CurrentLineAsnQtyDifference) == 0) {
						oCb.setEnabled(true);
					} else {
						oCb.setSelected(false);
						oTable.setSelectedItem(r, false);
						oCb.setEnabled(false);
					}
				}
			});
		},

		// onRowSelect: function (e) {
		// 	var data = this.asnModel.getData();
		// 	data.ASNamt = 0;
		// 	data.InvVal = 0;
		// 	// this.asnModel.refresh(true);
		// 	var oTable = this.getView().byId("AsnCreateTable");
		// 	var contexts = oTable.getSelectedContexts();

		// 	// for (var i = 0; i < contexts.length; i++) {
		// 	// 	var index = contexts[i].getPath().substring(contexts[i].getPath().lastIndexOf("/") + 1);
		// 	// 	var item = contexts[i].getProperty();
		// 	// 	for (var j = 0; j < oTable.getItems().length; j++) {
		// 	// 		// if (oTable.getItems()[index - 1]) {
		// 	// 		var previousItem = oTable.getItems()[j].getBindingContext("asnModel").getProperty();
		// 	// 		var previousIndex = oTable.getItems()[j].getBindingContext("asnModel").getPath()
		// 	// 			.substring(oTable.getItems()[j].getBindingContext("asnModel").getPath().lastIndexOf("/") + 1);
		// 	// 		if ((previousItem.Matnr === item.Matnr && previousItem.Ebelp === item.Ebelp) && parseInt(previousIndex) < parseInt(index) &&
		// 	// 			(!oTable.getItems()[j].getSelected() || (previousItem.Menge !== this.checkData[previousIndex].Menge))) {
		// 	// 			var forwardItem = oTable.getItems()[j + 1].getBindingContext("asnModel").getProperty();
		// 	// 			if (forwardItem.Matnr === item.Matnr && forwardItem.Ebelp === item.Ebelp) {
		// 	// 				oTable.getItems()[j + 1].setSelected(false);
		// 	// 			}
		// 	// 			// MessageBox.error("Please select the schedule line item " + previousItem.Etenr);
		// 	// 			// return;
		// 	// 		}
		// 	// 	}
		// 	// }

		// 	contexts = oTable.getSelectedContexts();
		// 	if (contexts.length) { //Check whether table has any selected contexts
		// 		var items = contexts.map(function (c) {
		// 			return c.getObject();
		// 		});

		// 		if (items.length) {
		// 			for (var i = 0; i < items.length; i++) {
		// 				if (parseFloat(items[i].Menge) >= 0) {
		// 					if (!items[i].Netpr) {
		// 						items[i].Netpr = "0";
		// 					}
		// 					if (!items[i].Cgst) {
		// 						items[i].Cgst = "0";
		// 					}
		// 					if (!items[i].Igst) {
		// 						items[i].Igst = "0";
		// 					}
		// 					if (!items[i].Sgst) {
		// 						items[i].Sgst = "0";
		// 					}
		// 					var nMenge = parseFloat(items[i].Menge) / parseFloat(items[i].PerUnit);
		// 					// data.ASNamt = parseFloat(data.ASNamt) + (parseFloat(items[i].Menge) * ((parseFloat(items[i].Netpr)) + (parseFloat(items[i].Cgst)) +
		// 					// 	(parseFloat(items[i].Igst)) + (parseFloat(items[i].Sgst))));	
		// 					// var NetPr = (parseFloat(items[i].Menge) * (parseFloat(items[i].Netpr))).toFixed(2);
		// 					// var Cgst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Cgst))).toFixed(2);
		// 					// var Igst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Igst))).toFixed(2);
		// 					// var Sgst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Sgst))).toFixed(2);
		// 					var NetPr = (nMenge * (parseFloat(items[i].Netpr))).toFixed(2);
		// 					var Cgst = (nMenge * (parseFloat(items[i].Cgst))).toFixed(2);
		// 					var Igst = (nMenge * (parseFloat(items[i].Igst))).toFixed(2);
		// 					var Sgst = (nMenge * (parseFloat(items[i].Sgst))).toFixed(2);

		// 					data.ASNamt = parseFloat(data.ASNamt) + parseFloat(NetPr) + parseFloat(Cgst) + parseFloat(Igst) + parseFloat(Sgst);
		// 					data.InvVal = parseFloat(data.InvVal) + (parseFloat(items[i].NetprVen) * nMenge);
		// 				} else {
		// 					MessageBox.information("Please enter quantity for selected items");
		// 					return;
		// 				}

		// 			}
		// 			data.ASNamt = parseFloat(data.ASNamt).toFixed(2);

		// 			//data.ASNamt = Math.round(data.ASNamt);

		// 			data.InvoiceAmt = data.ASNamt;

		// 			data.InvVal = parseFloat(data.InvVal).toFixed(2);

		// 			//data.InvVal = Math.round(data.InvVal);

		// 			data.InvoiceVal = data.InvVal;

		// 			// var unplannedAmount = this.asnModel.getData().UnplannedCost;

		// 			// unplannedAmount = Math.abs(parseFloat(unplannedAmount));
		// 			// unplannedAmount = unplannedAmount ? unplannedAmount : 0;
		// 			// var InvoiceVal = +this.asnModel.getData().InvoiceAmt + unplannedAmount;

		// 			// this.asnModel.getData().InvoiceVal = Math.round(InvoiceVal.toFixed(2));

		// 			this.asnModel.refresh(true);
		// 		}
		// 	} else {
		// 		data.ASNamt = 0.00;
		// 		data.InvoiceAmt = data.ASNamt;

		// 		var unplannedAmount = this.asnModel.getData().UnplannedCost;

		// 		unplannedAmount = Math.abs(parseFloat(unplannedAmount));
		// 		unplannedAmount = unplannedAmount ? unplannedAmount : 0;
		// 		var InvoiceVal = +data.InvoiceAmt + unplannedAmount;

		// 		this.asnModel.getData().InvoiceVal = InvoiceVal.toFixed(2);

		// 		this.asnModel.refresh(true);
		// 	}

		// 	// this.onSelectionChangeEnableDisableCheck(e);
		// 	// else {
		// 	// 	MessageBox.information("Please select the item");
		// 	// 	e.getSource().setValue();
		// 	// }
		// },

		onNavBack: function () {
			jQuery.sap.require("sap.ui.core.routing.History");
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry    
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history  
				var bReplace = true;
				this.router.navTo("SAMaster", {}, bReplace);
			}
		},
		formatASNdates: function (input) {
			const parts = input.split('/');
			const year = parseInt(parts[2], 10);
			const month = parseInt(parts[1], 10) - 1;
			const day = parseInt(parts[0], 10)
			const date = new Date(year, month, day);
			const localTimezoneOffset = date.getTimezoneOffset() * 60000;
			const adjustedDate = new Date(date.getTime() - localTimezoneOffset);
			const isoString = adjustedDate.toISOString().split('T')[0] + 'T00:00:00';
			return isoString + '+05:30';
		},

		onAsnSave: function (event) {
			// var that = this;
			// var oModel = this.getOwnerComponent().getModel();
			this.data = this.asnModel.getData();
			var form = {
				"UnitCode": sessionStorage.getItem("unitCode") || "P01",
				"CreatedBy": "Manikandan",
				"CreatedIP": "",
				"RowDetails": []
			};
			var oTable = this.getView().byId("AsnCreateTable");
			var contexts = oTable.getSelectedContexts();
			if (this.data.BillNumber) {
				if (!this.data.BillDate) {
					MessageBox.error("Please fill the Invoice Date");
					return;
				}
			} else {
				MessageBox.error("Please fill the Invoice Number");
				return;
			}
			if (!this.data.TotalInvNetAmnt) {
				MessageBox.error("Please fill Total Invoice Net Amount");
				return;
			} else if (!this.data.TotalGstAmnt) {
				MessageBox.error("Please fill Total GST Amount");
				return;
			}
			//if (this.getView().byId("uploadSet").getItems().length <= 0) {
			if (!this.item) {
				MessageBox.error("Atleast One attachment is required.");
				return;
			}
			if (!contexts.length) {
				MessageBox.error("No Item Selected");
				return;
			} else {
				var items = contexts.map(function (c) {
					return c.getObject();
				});
				for (var i = 0; i < items.length; i++) {

					if (!items[i].BalanceQty) {
						MessageBox.error("ASN Quantity is required for selected items");
						sap.ui.core.BusyIndicator.hide();

						return;
					} else {
						if (this.data.BillDate) {
							var date = this.data.BillDate.substring(4, 6) + "/" + this.data.BillDate.substring(6, 8) + "/" + this.data.BillDate.substring(0, 4);
							var DateInstance = new Date(date);
							var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "dd/MM/yyyy"
							});
							this.BillDate = dateFormat.format(DateInstance);
							this.BillDate = this.formatASNdates(this.BillDate);
						}
						if (this.data.ManufacturingMonth) {
							var date = this.data.ManufacturingMonth.substring(4, 6) + "/" + this.data.ManufacturingMonth.substring(6, 8) + "/" + this.data.ManufacturingMonth.substring(0, 4);
							var DateInstance = new Date(date);
							var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "dd/MM/yyyy"
							});
							this.ManufacturingMonth = dateFormat.format(DateInstance);
							this.ManufacturingMonth = this.formatASNdates(this.ManufacturingMonth);
						}
						// if(items[i].IGST === undefined){
						// 	items[i].IGST = "";
						// }
						// if(items[i].IGA === undefined){
						// 	items[i].IGA = "";
						// }
						// if(items[i].CGST === undefined){
						// 	items[i].CGST = "";
						// }
						// if(items[i].CGA === undefined){
						// 	items[i].CGA = "";
						// }
						// if(items[i].SGST === undefined){
						// 	items[i].SGST = "";
						// }
						// if(items[i].SGA === undefined){
						// 	items[i].SGA = "";
						// }
						if (items[i].TCS === undefined) {
							items[i].TCS = "";
						}
						// if(items[i].TCA === undefined){
						// 	items[i].TCA = "";
						// }
						// if(items[i].LineValue === undefined){
						// 	items[i].LineValue = "";
						// }
						// if(items[i].Packages === undefined){
						// 	items[i].Packages = "";
						// }
						// if(items[i].WeightInKG === undefined){
						// 	items[i].WeightInKG = "";
						// }
						if (this.data.TransportName === undefined) {
							this.data.TransportName = "";
						}
						if (this.data.TransportMode === undefined) {
							this.data.TransportMode = "";
						}
						if (this.data.DocketNumber === undefined) {
							this.data.DocketNumber = "";
						}
						if (this.data.GRDate === undefined) {
							this.data.GRDate = "";
						} else if (this.data.GRDate) {
							var date = this.data.GRDate.substring(4, 6) + "/" + this.data.GRDate.substring(6, 8) + "/" + this.data.GRDate.substring(0, 4);
							var DateInstance = new Date(date);
							var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "dd/MM/yyyy"
							});
							this.GRDate = dateFormat.format(DateInstance);
							this.GRDate = this.formatASNdates(this.GRDate);
						}
						if (this.data.EwayBillNumber === undefined) {
							this.data.EwayBillNumber = "";
						}
						if (this.data.EwayBillDate === undefined) {
							this.data.EwayBillDate = "";
						} else if (this.data.EwayBillDate) {
							var date = this.data.EwayBillDate.substring(4, 6) + "/" + this.data.EwayBillDate.substring(6, 8) + "/" + this.data.EwayBillDate.substring(0, 4);
							var DateInstance = new Date(date);
							var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "dd/MM/yyyy"
							});
							this.EwayBillDate = dateFormat.format(DateInstance);
							this.EwayBillDate = this.formatASNdates(this.EwayBillDate);
						}
						if (this.data.MillNumber === undefined) {
							this.data.MillNumber = "";
						}
						if (this.data.MillName === undefined) {
							this.data.MillName = "";
						}
						if (this.data.PDIRNumber === undefined) {
							this.data.PDIRNumber = "";
						}
						if (this.data.HeatNumber === undefined) {
							this.data.HeatNumber = "";
						}
						if (this.data.BatchNumber === undefined) {
							this.data.BatchNumber = "";
						}
						if (this.data.ManufacturingMonth === undefined) {
							this.ManufacturingMonth = "";
						}
						if (items[i].Packing === undefined) {
							items[i].Packing = "0";
						}
						if (items[i].Frieght === undefined) {
							items[i].Frieght = "0";
						}
						if (items[i].OtherCharges === undefined) {
							items[i].OtherCharges = "0";
						}

						var row = {
							"BillLineNumber": items[i].LineNum,
							"BillNumber": this.data.BillNumber,
							"BillDate": this.BillDate,
							"ScheduleNumber": items[i].SchNum_ScheduleNum,
							"ScheduleLineNumber": items[i].SchLineNum,
							"PONumber": items[i].PoNum,
							"IAIVendorCode": this.data.VendorCode,
							"IAIItemCode": items[i].ItemCode,
							"UOM": items[i].UOM,
							"HSNCode": items[i].HSNCode,
							"Rate": items[i].UnitPrice,
							"Quantity": items[i].BalanceQty,
							"PackingAmount": items[i].Packing,
							"Freight": items[i].Frieght,
							"OtherCharges": items[i].OtherCharges,
							"AssValue": items[i].ASSValue.toString(),
							"IGST": items[i].IGST,
							"IGA": items[i].IGA,
							"CGST": items[i].CGST,
							"CGA": items[i].CGA,
							"SGST": items[i].SGST,
							"SGA": items[i].SGA,
							"TCS": items[i].TCS,
							"TCA": items[i].TCA,
							"LineValue": items[i].LineValue,
							"TransportName": this.data.TransportName,
							"TransportMode": this.data.TransportMode,
							"DocketNumber": this.data.DocketNumber,
							"GRDate": this.GRDate,
							"Packaging": "0",
							"WeightPerKG": items[i].WeightInKG,
							"EwayBillNumber": this.data.EwayBillNumber,
							"EwayBillDate": this.EwayBillDate,
							"MillNumber": this.data.MillNumber,
							"MillName": this.data.MillName,
							"PDIRNumber": this.data.PDIRNumber,
							"HeatNumber": this.data.HeatNumber,
							"BatchNumber": this.data.BatchNumber,
							"ManufacturingMonth": this.ManufacturingMonth
						};
						form.RowDetails.push(row);
					}

				}
				var formdatastr = JSON.stringify(form);
				this.hardcodedURL = "";
				if (window.location.href.includes("launchpad")) {
					this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a91d9b1c-a59b-495f-aee2-3d22b25c7a3c.schedulingagreement.sapfiorischedulingagreement-0.0.1";
				}
				var sPath = this.hardcodedURL + `/sa/odata/v4/catalog/PostASN`;
				$.ajax({
					type: "POST",
					headers: {
						'Content-Type': 'application/json'
					},
					url: sPath,
					data: JSON.stringify({
						asnData: formdatastr
					}),
					context: this,
					success: function (data, textStatus, jqXHR) {
						this.AsnNum = data.d.PostASN;
						MessageBox.success(this.AsnNum + " ASN created succesfully", {
							actions: [sap.m.MessageBox.Action.OK],
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Success",
							onClose: function (oAction) {
								if (oAction === "OK") {
									sap.fiori.schedulingagreement.controller.formatter.onNavBack();
								}
							}
						});
						this.onAsnSaveDB();
					}.bind(this),
					error: function (error) {
						MessageBox.error("ASN creation failed");
					}
				});
			}
		},
		onAsnSaveDB: function () {
			// var that = this;
			//this.getView().byId("MaterialSearchId").setValue("");
			//this.onRowSelect(event);
			var oModel = this.getOwnerComponent().getModel();

			this.data = this.asnModel.getData();
			var ASNHeaderData = {
				"SchNum_ScheduleNum": this.data.ScheduleNum,
				"AsnNum": this.AsnNum,
				"BillDate": this.data.BillDate,
				"BillNumber": this.data.BillNumber,
				"DocketNumber": this.data.DocketNumber,
				"GRDate": this.data.GRDate,
				"TransportName": this.data.TransportName,
				"TransportMode": this.data.TransportMode,
				"EwayBillNumber": this.data.EwayBillNumber,
				"EwayBillDate": this.data.EwayBillDate,
				"MillNumber": this.data.MillNumber,
				"MillName": this.data.MillName,
				"PDIRNumber": this.data.PDIRNumber,
				"HeatNumber": this.data.HeatNumber,
				"BatchNumber": this.data.BatchNumber,
				"ManufacturingMonth": this.data.ManufacturingMonth,
				"PlantName": this.data.PlantName,
				"PlantCode": this.data.PlantCode,
				"VendorCode": this.data.VendorCode,
				"TotalInvNetAmnt": this.data.TotalInvNetAmnt,
				"TotalGstAmnt": this.data.TotalGstAmnt,
				"RateStatus": this.data.DocumentRows.results.every(item => item.RateAggreed === true) ? "Rate Matched" : "Rate Un-Matched"
			};
			var ASNItemData = [];

			var oTable = this.getView().byId("AsnCreateTable");
			var contexts = oTable.getSelectedContexts();

			if (ASNHeaderData.BillNumber) {
				if (!ASNHeaderData.BillDate) {
					MessageBox.error("Please fill the Invoice Date");
					return;
				}
			} else {
				MessageBox.error("Please fill the Invoice Number");
				return;
			}
			if (!ASNHeaderData.TotalInvNetAmnt) {
				MessageBox.error("Please fill Total Invoice Net Amount");
				return;
			} else if (!ASNHeaderData.TotalGstAmnt) {
				MessageBox.error("Please fill Total GST Amount");
				return;
			}

			if (!contexts.length) {
				MessageBox.error("No Item Selected");
				return;
			} else {
				var items = contexts.map(function (c) {
					return c.getObject();
				});

				for (var i = 0; i < items.length; i++) {

					if (!items[i].BalanceQty) {
						MessageBox.error("ASN Quantity is required for selected items");
						sap.ui.core.BusyIndicator.hide();

						return;
					} else {
						items[i].ASSValue = items[i].ASSValue.toString();
						ASNItemData.push(items[i]);

					}

				}
				oModel.create("/ASNListHeader", ASNHeaderData, null, function (oData, response) {
					//MessageBox.success("ASN created succesfully");


				}, function (oError) {
					try {
						var error = JSON.parse(oError.response.body);
						MessageBox.error(error.error.message.value);
					} catch (err) {
						var errorXML = jQuery.parseXML(oError.getParameter("responseText")).querySelector("message").textContent;
						MessageBox.error(errorXML);
					}
				});
				for (var i = 0; i < ASNItemData.length; i++) {
					oModel.create("/ASNList", ASNItemData[i], null, function (oData, response) {

					}, function (oError) {
						try {
							var error = JSON.parse(oError.response.body);
							MessageBox.error(error.error.message.value);
						} catch (err) {
							var errorXML = jQuery.parseXML(oError.getParameter("responseText")).querySelector("message").textContent;
							MessageBox.error(errorXML);
						}
					});
				}
				var AsnNum = this.AsnNum.replace(/\//g, '-');
				var oData = {
					AsnNum: AsnNum
				};
				// oModel.update(`/Files(InvoiceNo='${this.invoiceNo}')`, oData, {
				// 	merge: true,
				// 	success: function () {

				// 	},
				// 	error: function (oError) {
				// 		console.log("Error: ", oError);

				// 	}
				// });
				this._createEntity(this.item, AsnNum)
					.then(() => {
						this._uploadContent(this.item, AsnNum);
					})
					.catch((err) => {
						console.log("Error: " + err);
					})

			}
		},
		handleLinkPress: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.fiori.schedulingagreement.view.PricePopoverFragment", this);
				this.getView().addDependent(this._oPopover);
			}

			var sPath = oEvent.getSource().getBindingContext("asnModel").sPath;
			var data = this.asnModel.getProperty(sPath);
			this.popOverModel.setData(data);
			this._oPopover.setModel(this.popOverModel);

			this._oPopover.openBy(oEvent.getSource());

		},

		onAsnCancel: function () {
			this.router.navTo("PoSplit");
		},

		onQuanPress: function (e) {
			var that = this;

			if (!this.QuantFrag) {
				this.QuantFrag = sap.ui.xmlfragment("sap.fiori.schedulingagreement.view.SAFragRequiredQuan", this);
				this.getView().addDependent(this.QuantFrag);
			}

			var sPath = e.getSource().getBindingContext("asnModel").getPath();
			var data = this.asnModel.getProperty(sPath);

			this.oDataModel.read("/S_LINEITEMSSet?$filter=Schedule_No eq '" + data.Ebeln + "' and Schedule_Item eq '" + data.Ebelp +
				"' and Material_No eq '" + data.Matnr + "' and Uom eq '" + data.Uom + "'", null, null, false,
				function (oData, oResponse) {
					that.popOverModel.setData(oData);
					that.QuantFrag.setModel(that.popOverModel, "itemModel");
					that.popOverModel.refresh(true);
				});

			this.QuantFrag.openBy(e.getSource());
		},

		// onFilter: function () {
		// 	var oTable = this.getView().byId("AsnCreateTable");
		// 	var oBindingInfo = oTable.getBinding('items');
		// 	var Matnr = this.getView().byId("MaterialId").getValue();
		// 	var Maktx = this.getView().byId("MaterialId").getValue();
		// 	var Eindt = this.getView().byId("DelDateId").getValue();
		// 	if (!Eindt) {
		// 		Eindt = "";
		// 	}
		// 	if (!Matnr) {
		// 		Matnr = "";
		// 	}
		// 	//===============================================
		// 	if (Eindt && Matnr) {
		// 		var afilter1 =
		// 			new sap.ui.model.Filter({
		// 				filters: [
		// 					new sap.ui.model.Filter({
		// 						path: 'Maktx',
		// 						operator: sap.ui.model.FilterOperator.Contains,
		// 						value1: Maktx
		// 					}),
		// 					new sap.ui.model.Filter({
		// 						path: 'Matnr',
		// 						operator: sap.ui.model.FilterOperator.Contains,
		// 						value1: Matnr
		// 					})
		// 				],
		// 				and: false
		// 			});

		// 		var aFilter2 = new sap.ui.model.Filter({
		// 			path: 'Eindt',
		// 			operator: sap.ui.model.FilterOperator.EQ,
		// 			value1: Eindt
		// 		});

		// 		var afilters = [afilter1, aFilter2];
		// 	} else if (Matnr) {
		// 		afilters = [
		// 			new sap.ui.model.Filter({
		// 				filters: [
		// 					new sap.ui.model.Filter({
		// 						path: 'Matnr',
		// 						operator: sap.ui.model.FilterOperator.Contains,
		// 						value1: Matnr
		// 					}),
		// 					new sap.ui.model.Filter({
		// 						path: 'Maktx',
		// 						operator: sap.ui.model.FilterOperator.Contains,
		// 						value1: Maktx
		// 					})
		// 				],
		// 				and: false
		// 			})
		// 		];
		// 	} else if (Eindt) {
		// 		afilters = [
		// 			new sap.ui.model.Filter("Eindt", sap.ui.model.FilterOperator.EQ, Eindt)
		// 		];
		// 	} else {
		// 		delete oBindingInfo.filters;
		// 	}
		// 	oBindingInfo.filter(afilters);
		// },

		// onFilterClear: function () {
		// 	this.getView().byId("DelDateId").setValue("");
		// 	this.getView().byId("MaterialId").setValue("");
		// 	var oTable = this.getView().byId("AsnCreateTable");
		// 	var oBindingInfo = oTable.getBinding('items');
		// 	oBindingInfo.filter([]);
		// },

		onMaterialHelpReq: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			var that = this;
			if (!this.matFrag) {
				this.matFrag = sap.ui.xmlfragment("sap.fiori.schedulingagreement.view.materialFrag", this);
				this.matTemp = sap.ui.getCore().byId("materialTempId").clone();
			}

			sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
				path: "oDataModel>/MaterialHelpSet?$filter=Schedule_No eq '" + that.Schedule_No + "'",
				template: that.matTemp
			});
			this.matFrag.open();
		},
		materialValueHelpClose: function (oEvent) {
			var oTable = this.getView().byId("AsnCreateTable");
			var oBindingInfo = oTable.getBindingInfo('items');
			var Val = oEvent.getParameter("selectedItem").getBindingContext("oDataModel").getObject().Matnr;
			this.getView().byId("MaterialId").setValue(Val);
			var Matnr = this.getView().byId("MaterialId").getValue();
			var Eindt = this.getView().byId("DelDateId").getValue();
			if (!Eindt) {
				Eindt = "";
			}
			if (!Matnr) {
				Matnr = "";
			}
			//===============================================
			var both = false;
			if (Eindt && Matnr) {
				both = true;
			}

			oBindingInfo.filters = [
				new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter({
							path: 'Matnr',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: Matnr
						}),
						new sap.ui.model.Filter({
							path: 'Eindt',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: Eindt
						})
					],
					and: both
				})
			];

			oTable.bindAggregation('items', oBindingInfo);
		},

		//	********************************************Upload File start Code ***********************************
		/*
		onChange: function (oEvent) {
			var oUploadCollection = oEvent.getSource();

			// var model = this.getView().getModel();
			// var oServiceUrl = model.sServiceUrl;
			// oUploadCollection.setUploadUrl(oServiceUrl + "/LotAttachmentSet");

			// Header Token

			if (this.header_xcsrf_token) {
				var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
					name: "x-csrf-token",
					value: this.header_xcsrf_token
				});
				oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			}

		},

		onStartUpload: function (oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.upload();
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			// var that = this;
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: this.asn + "/" + this.year + "/" + oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},
		*/

		onAfterItemAdded: function (oEvent) {
			this.item = oEvent.getParameter("item");
			//this.invoiceNo = this.Schedule_No.replace(/\//g, '-');
			this.invoiceNo = this.getView().byId("invoiceNumId").getValue();

			// this._createEntity(this.item, this.invoiceNo)
			// .then(() => {
			// 	this._uploadContent(this.item, this.invoiceNo);
			// })
			// .catch((err) => {
			// 	console.log("Error: " + err);
			// })
		},

		onUploadCompleted: function (oEvent) {
			var oUploadSet = this.byId("uploadSet");
			var oUploadedItem = oEvent.getParameter("item");
			var sUploadUrl = oUploadedItem.getUploadUrl();

			var sDownloadUrl = sUploadUrl
			oUploadedItem.setUrl(sDownloadUrl);
			oUploadSet.getBinding("items").refresh();
			oUploadSet.invalidate();
		},
		_createEntity: function (item, AsnNum) {
			var oModel = this.getView().getModel();
			var oData = {
				AsnNum: AsnNum,
				mediaType: item.getMediaType(),
				fileName: item.getFileName(),
				size: item.getFileObject().size,
				url: "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a91d9b1c-a59b-495f-aee2-3d22b25c7a3c.schedulingagreement.sapfiorischedulingagreement-0.0.1" + `/sa/odata/v4/catalog/Files(AsnNum='${AsnNum}')/content`,
				//url: this.getView().getModel().sServiceUrl + `/Files(SchNum_ScheduleNum='${schNum}')/content`

			};

			return new Promise((resolve, reject) => {
				oModel.update(`/Files(AsnNum='${AsnNum}')`, oData, {
					success: function () {
						resolve();
					},
					error: function (oError) {
						console.log("Error: ", oError);
						reject(oError);
					}
				});
			});
		},

		_uploadContent: function (item, AsnNum) {
			//var url = `/sa/odata/v4/catalog/Files(SchNum_ScheduleNum='${schNum}')/content`
			var url = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a91d9b1c-a59b-495f-aee2-3d22b25c7a3c.schedulingagreement.sapfiorischedulingagreement-0.0.1" + `/sa/odata/v4/catalog/Files(AsnNum='${AsnNum}')/content`
			item.setUploadUrl(url);
			var oUploadSet = this.byId("uploadSet");
			oUploadSet.setHttpRequestMethod("PUT")
			oUploadSet.uploadItem(item);
		},

		onOpenPressed: function (oEvent) {
			oEvent.preventDefault();
			//var item = oEvent.getSource();
			var item = oEvent.getParameter("item");
			this._fileName = item.getFileName();
			this._download(item)
				.then((blob) => {
					var url = window.URL.createObjectURL(blob);
					var link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', this._fileName);
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				})
				.catch((err) => {
					console.log(err);
				});
		},
		_download: function (item) {
			console.log("_download")
			var settings = {
				url: item.getUrl(),
				method: "GET",
				xhrFields: {
					responseType: "blob"
				}
			}

			return new Promise((resolve, reject) => {
				$.ajax(settings)
					.done((result, textStatus, request) => {
						resolve(result);
					})
					.fail((err) => {
						reject(err);
					})
			});
		},

		onDeliveryCost: function (event) {
			var invoiceAmount = this.getView().byId("invoiceAmtId").getValue().trim();
			// var unplannedAmount = this.getView().byId("unplannedAmtId").getValue().trim();
			unplannedAmount = Math.abs(parseFloat(unplannedAmount));
			unplannedAmount = unplannedAmount ? unplannedAmount : 0;
			var InvoiceVal = +invoiceAmount + +unplannedAmount;
			this.getView().byId("invoiceValueId").setValue(InvoiceVal.toFixed(2));
		},
		onEditPress: function (event) {
			this.byId("invoiceValueId").setEditable(true);
		},
		onDateFilter: function (event) {
			var FromDate = this.byId("FromDateId").getValue();
			var ToDate = this.byId("ToDateId").getValue();
			var oBindings = this.getView().byId("AsnCreateTable").getBinding("items");
			if (FromDate || ToDate) {
				var Filter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter({
							path: 'ShipDate',
							operator: sap.ui.model.FilterOperator.LE,
							value1: ToDate
						}),
						new sap.ui.model.Filter({
							path: 'ShipDate',
							operator: sap.ui.model.FilterOperator.GE,
							value1: FromDate
						})
					],
					and: true
				});
				oBindings.filter(Filter);
			} else {
				MessageBox.error("No Dates are Selected");
			}
		},
		onDateFilterClear: function (event) {
			this.byId("FromDateId").setValue("");
			this.byId("ToDateId").setValue("");
			this.getView().byId("AsnCreateTable").getBinding("items").filter([]);
		},
		onLinkPress: function (oEvent) {
			var that = this;
			var LineItemData = oEvent.getSource().getParent().getBindingContext("asnModel").getObject();
			if (!this._oPopoverFragment) {
				this._oPopoverFragment = sap.ui.xmlfragment("sap.fiori.schedulingagreement.fragment.DatePopoverFragment", this);
				this._oPopoverFragment.setModel(this.dateConfirmationModel);
				this.getView().addDependent(this._oPopoverFragment);
			}
			this.oDataModel.read("/ConfirmationDateSet?$filter=Ebeln eq '" + LineItemData.Schedule_No + "'and Ebelp  eq '" + LineItemData.Ebelp +
				"' and Etens eq '" + LineItemData.Etenr + "'", null, null, false,
				function (oData, oResponse) {
					that.dateConfirmationModel.setData(oData);
					that.dateConfirmationModel.refresh(true);

				},
				function (oError) {
					var value = JSON.parse(oError.response.body);
					MessageBox.error(value.error.message.value);
				});
			this._oPopoverFragment.openBy(oEvent.getSource());
			// this._oPopover.openBy(oEvent.getSource());

		},
		onTypeMissmatch: function (oEvent) {
			MessageBox.error("Only PDF files are allowed.");
		},
		onInvNoChange: function (oEvent) {

			if (oEvent.getParameter("value") == "") {
				this.getView().byId("DP1").setEnabled(false);
				this.getView().byId("DP1").setValue("");
				this.getView().byId("uploadSet").setUploadEnabled(false);
			} else {
				this.getView().byId("DP1").setEnabled(true);
				this.getView().byId("uploadSet").setUploadEnabled(true);
			}
		},
		onFromDateChange: function (oEvent) {
			var FromDate = this.getView().byId("FromDateId").getDateValue();
			this.getView().byId("ToDateId").setMinDate(FromDate);
		},
		onMaterialLiveChange: function (oEvent) {
			var search = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
			var afilters = [];

			if (search) {
				// var values = search.split(" ");
				// if (values.length) {
				// 	for (var i = 0; i < values.length; i++) {
				//	if (values[i].trim()) {
				afilters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, search));
				afilters.push(new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, search));

				// 			afilters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, values[i]));
				// 			afilters.push(new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, values[i]));
				// 		}
				// 	}
				// }
			} else {
				afilters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, ""));
				afilters.push(new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, ""));
				//this.onRowSelect(oEvent);
			}
			// afilters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, search));
			// afilters.push(new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, search));
			this.byId("AsnCreateTable").getBinding("items").filter(new sap.ui.model.Filter({
				filters: afilters
			}));
		},
		onQuantityChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("asnModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.asnModel.getData().DocumentRows.results;
			data[path].BalanceQty = val;
			data[path].ASSValue = parseFloat(data[path].BalanceQty) * parseFloat(data[path].UnitPrice);
			if (data[path].Packing) {
				data[path].ASSValue = parseFloat(data[path].ASSValue) + parseFloat(data[path].Packing);
			}
			if (data[path].Frieght) {
				data[path].ASSValue = parseFloat(data[path].ASSValue) + parseFloat(data[path].Frieght);
			}
			if (data[path].OtherCharges) {
				data[path].ASSValue = parseFloat(data[path].ASSValue) + parseFloat(data[path].OtherCharges);
			}
			this.asnModel.refresh(true);
		},
		onPackChange: function (e) {
			const val = e.getParameter("value") || 0;
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.asnModel.getData().DocumentRows.results;
			data[path].Packing = val;
			if (data[path].Frieght === undefined) { data[path].Frieght = "0" }
			if (data[path].OtherCharges === undefined) { data[path].OtherCharges = "0" }
			data[path].ASSValue = (parseFloat(data[path].BalanceQty) * parseFloat(data[path].UnitPrice)) + parseFloat(data[path].Packing) + parseFloat(data[path].Frieght) + parseFloat(data[path].OtherCharges);
			this.asnModel.refresh(true);
		},
		onFreightChange: function (e) {
			const val = e.getParameter("value") || 0;
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.asnModel.getData().DocumentRows.results;
			data[path].Frieght = val;
			if (data[path].Packing === undefined) { data[path].Packing = "0" }
			if (data[path].OtherCharges === undefined) { data[path].OtherCharges = "0" }
			data[path].ASSValue = (parseFloat(data[path].BalanceQty) * parseFloat(data[path].UnitPrice)) + parseFloat(data[path].Packing) + parseFloat(data[path].Frieght) + parseFloat(data[path].OtherCharges);
			this.asnModel.refresh(true);
		},
		onOtherChange: function (e) {
			const val = e.getParameter("value") || 0;
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.asnModel.getData().DocumentRows.results;
			data[path].OtherCharges = val;
			if (data[path].Frieght === undefined) { data[path].Frieght = "0" }
			if (data[path].Packing === undefined) { data[path].Packing = "0" }
			data[path].ASSValue = (parseFloat(data[path].BalanceQty) * parseFloat(data[path].UnitPrice)) + parseFloat(data[path].Packing) + parseFloat(data[path].Frieght) + parseFloat(data[path].OtherCharges);
			this.asnModel.refresh(true);
		},

		onRateOkChange: function (evt) {
			const state = evt.getParameter("selected");
			this.asnModel.getData().DocumentRows.results.forEach(item => {
				item.RateAggreed = state;
			});
			this.asnModel.refresh(true);
		},

		onRateAgreedChange: function (evt) {
			const state = evt.getParameter("selected");
			if (state) {
				evt.getSource().getBindingContext("asnModel").getObject().SupplierRate = 0;
			}
			this.asnModel.refresh(true);
		},

		onRowSelect: function () {
			let obj, totalInvNetAmnt = 0, totalGstAmnt = 0;
			this.byId("AsnCreateTable").getSelectedItems().forEach(item => {
				obj = item.getBindingContext("asnModel").getObject();
				totalInvNetAmnt += parseFloat(obj.BalanceQty) * parseFloat(obj.UnitPrice);
				totalGstAmnt += parseFloat(obj.IGST) + parseFloat(obj.CGST) + parseFloat(obj.SGST);
			});
			const totalInvNetAmntCtr = this.byId("totalInvNetAmnt"),
				totalGstAmntCtr = this.byId("totalGstAmnt");
			if (totalInvNetAmnt === parseFloat(totalInvNetAmntCtr.getValue())) {
				totalInvNetAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
			} else {
				totalInvNetAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
			}

			if (totalGstAmnt === parseFloat(totalGstAmntCtr.getValue())) {
				totalGstAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
			} else {
				totalGstAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
			}
		}
	});

});
