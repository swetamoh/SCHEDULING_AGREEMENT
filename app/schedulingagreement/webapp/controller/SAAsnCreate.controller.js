sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"

], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.schedulingagreement.controller.SAAsnCreate", {
		onInit: function () {

			// this.loginModel = sap.ui.getCore().getModel("loginModel");
			// this.loginData = this.loginModel.getData();

			this.selectedItems = [];

			this.oDataModel = sap.ui.getCore().getModel("oDataModel");

			this.getView().addStyleClass("sapUiSizeCompact");

			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.handleRouteMatched, this);

			this.asnModel = new sap.ui.model.json.JSONModel();
			this.asnModel.setSizeLimit(100000000);
			this.getView().setModel(this.asnModel, "asnModel");

			this.getView().byId("AsnCreateTable").setSticky(["ColumnHeaders", "HeaderToolbar"]);

			// this.asnCreateModel = new sap.ui.model.json.JSONModel();
			// this.getView().setModel(this.asnCreateModel, "asnCreateModel");
			this.dateConfirmationModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.dateConfirmationModel, "DateConfirmationModel");

			this.popOverModel = new sap.ui.model.json.JSONModel();
			//this.uploadCollectionTemp = this.getView().byId("UploadCollItemId").clone();
		},
		handleRouteMatched: function (event) {

			if (event.getParameter("name") === "SAAsnCreate") {
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
				var Tomorrow = new Date();
				var Yesterday = new Date();

				Yesterday.setDate(Today.getDate() - 4);
				Tomorrow.setDate(Today.getDate() + 1);
				// this.getView().byId("DP1").setDateValue(new Date());
				this.getView().byId("DP1").setMinDate(Yesterday);
				this.getView().byId("DP1").setMaxDate(Today);

				this.checkData = [];
				this.Schedule_No = event.getParameter("arguments").Schedule_No;
				this.getView().setModel(new sap.ui.model.json.JSONModel({ minDate: new Date() }), "dateModel");
				// ,App='SA'
				//this.oDataModel.read("/ASN_HEADERSet(Schedule_No='" + this.Schedule_No + "')?$expand=ASNItemnav",
				sap.ui.core.BusyIndicator.show();
				this.oDataModel.read("/ASN_HEADERSet(Schedule_No='" + this.Schedule_No + "')", {
					urlParameters: {
						"$expand": "ASNItemnav"
					},
					success: function (oData, oResponse) {
						sap.ui.core.BusyIndicator.hide();
						var POItems = oData.ASNItemnav.results;
						let pkgMatQty;
						var msg = '';
						var arr = [];
						oData.ASNItemnav.results = POItems.filter(function (item) {
							pkgMatQty = parseFloat(item.Menge) / parseFloat(item.SOQ);
							item.PkgMatQty = isNaN(pkgMatQty) ? "0" : isFinite(pkgMatQty) === false ? "0" : (Math.ceil(pkgMatQty)).toString();
							item.NetprVen = item.Netpr.trim();
							return item.Menge !== "0.00";
						});

						for (var i = 0; i < oData.ASNItemnav.results.length; i++) {
							if (oData.ASNItemnav.results[i].Meins == "EA") {
								oData.ASNItemnav.results[i].Menge = parseInt(oData.ASNItemnav.results[i].Menge).toString();
							}
							that.checkData.push({
								"Ebelp": oData.ASNItemnav.results[i].Ebelp,
								"Etenr": oData.ASNItemnav.results[i].Etenr,
								"Matnr": oData.ASNItemnav.results[i].Matnr,
								"Menge": oData.ASNItemnav.results[i].Menge
							}); //To check ASN qty for previous line item

							// if(oData.ASNItemnav.results[i].Warningmsg!= '')
							// 	msg = msg + "\n" + oData.ASNItemnav.results[i].Warningmsg;
							if (oData.ASNItemnav.results[i].Warningmsg != '') {
								arr.push(oData.ASNItemnav.results[i].Warningmsg);
							}
						}
						var RemovedupArr = that.removeDuplicates(arr);
						for (var i = 0; i < RemovedupArr.length; i++) {
							msg = msg + "\n" + RemovedupArr[i];
						}
						// POItems.forEach(function (item, index, object) {
						// 	if (item.Menge === "0.00") {
						// 		object.splice(index, 1);
						// 	}
						// });

						oData.UnplannedCost = oData.UnplannedCost ? oData.UnplannedCost : 0;
						that.asnModel.setData(oData);
						that.asnModel.refresh(true);
						// that.getView().byId("DP1").setDateValue(new Date());
						var oTable = that.getView().byId("AsnCreateTable");
						var oBindingInfo = oTable.getBindingInfo('items');
						delete oBindingInfo.filters;
						oTable.bindAggregation('items', oBindingInfo);
						setTimeout(() => {
							if (msg && msg != '')
								MessageBox.warning(msg);
						}, 1000);
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value, {
							onClose: function () {
								sap.fiori.schedulingagreement.controller.formatter.onNavBack();
							}
						});
					}
				});

				// Get CSRF token

				if (!this.header_xcsrf_token) {
					var model = this.getView().getModel();
					var oServiceUrl = model.sServiceUrl + "/";
					var that = this;

					sap.ui.core.BusyIndicator.show(0);
					model._request({
						requestUri: oServiceUrl,
						method: "GET",
						headers: {
							"X-Requested-With": "XMLHttpRequest",
							"Content-Type": "application/atom+xml",
							"DataServiceVersion": "2.0",
							"X-CSRF-Token": "Fetch"
						}
					}, function (data, response) {
						sap.ui.core.BusyIndicator.hide();
						that.header_xcsrf_token = response.headers["x-csrf-token"];
					});
				}
				sap.ui.core.BusyIndicator.hide();
				var slash = window.location.href.includes("site") ? "/" : "";
				var modulePath = jQuery.sap.getModulePath("sap/fiori/schedulingagreement");
				modulePath = modulePath === "." ? "" : modulePath;
				var serviceUrl = modulePath + slash + "sap/opu/odata/shiv/NW_SUPP_PORTAL_SA_SRV/AsnAttachementSet";
				var site = window.location.href.includes("site");
				if (site) {
					this.getView().byId("UploadCollection").setUploadUrl(serviceUrl);
				}
				else
					this.getView().byId("UploadCollection").setUploadUrl("/sap/opu/odata/shiv/NW_SUPP_PORTAL_SA_SRV/AsnAttachementSet");

			}
			sap.ui.core.BusyIndicator.hide();
		},
		removeDuplicates: function (arr) {
			return arr.filter((item,
				index) => arr.indexOf(item) === index);
		},
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

		onRowSelect: function (e) {
			var data = this.asnModel.getData();
			data.ASNamt = 0;
			data.InvVal = 0;
			// this.asnModel.refresh(true);
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

			contexts = oTable.getSelectedContexts();
			if (contexts.length) { //Check whether table has any selected contexts
				var items = contexts.map(function (c) {
					return c.getObject();
				});

				if (items.length) {
					for (var i = 0; i < items.length; i++) {
						if (parseFloat(items[i].Menge) >= 0) {
							if (!items[i].Netpr) {
								items[i].Netpr = "0";
							}
							if (!items[i].Cgst) {
								items[i].Cgst = "0";
							}
							if (!items[i].Igst) {
								items[i].Igst = "0";
							}
							if (!items[i].Sgst) {
								items[i].Sgst = "0";
							}
							var nMenge = parseFloat(items[i].Menge) / parseFloat(items[i].PerUnit);
							// data.ASNamt = parseFloat(data.ASNamt) + (parseFloat(items[i].Menge) * ((parseFloat(items[i].Netpr)) + (parseFloat(items[i].Cgst)) +
							// 	(parseFloat(items[i].Igst)) + (parseFloat(items[i].Sgst))));	
							// var NetPr = (parseFloat(items[i].Menge) * (parseFloat(items[i].Netpr))).toFixed(2);
							// var Cgst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Cgst))).toFixed(2);
							// var Igst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Igst))).toFixed(2);
							// var Sgst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Sgst))).toFixed(2);
							var NetPr = (nMenge * (parseFloat(items[i].Netpr))).toFixed(2);
							var Cgst = (nMenge * (parseFloat(items[i].Cgst))).toFixed(2);
							var Igst = (nMenge * (parseFloat(items[i].Igst))).toFixed(2);
							var Sgst = (nMenge * (parseFloat(items[i].Sgst))).toFixed(2);

							data.ASNamt = parseFloat(data.ASNamt) + parseFloat(NetPr) + parseFloat(Cgst) + parseFloat(Igst) + parseFloat(Sgst);
							data.InvVal = parseFloat(data.InvVal) + (parseFloat(items[i].NetprVen) * nMenge);
						} else {
							MessageBox.information("Please enter quantity for selected items");
							return;
						}

					}
					data.ASNamt = parseFloat(data.ASNamt).toFixed(2);

					//data.ASNamt = Math.round(data.ASNamt);

					data.InvoiceAmt = data.ASNamt;

					data.InvVal = parseFloat(data.InvVal).toFixed(2);

					//data.InvVal = Math.round(data.InvVal);

					data.InvoiceVal = data.InvVal;

					// var unplannedAmount = this.asnModel.getData().UnplannedCost;

					// unplannedAmount = Math.abs(parseFloat(unplannedAmount));
					// unplannedAmount = unplannedAmount ? unplannedAmount : 0;
					// var InvoiceVal = +this.asnModel.getData().InvoiceAmt + unplannedAmount;

					// this.asnModel.getData().InvoiceVal = Math.round(InvoiceVal.toFixed(2));

					this.asnModel.refresh(true);
				}
			} else {
				data.ASNamt = 0.00;
				data.InvoiceAmt = data.ASNamt;

				var unplannedAmount = this.asnModel.getData().UnplannedCost;

				unplannedAmount = Math.abs(parseFloat(unplannedAmount));
				unplannedAmount = unplannedAmount ? unplannedAmount : 0;
				var InvoiceVal = +data.InvoiceAmt + unplannedAmount;

				this.asnModel.getData().InvoiceVal = InvoiceVal.toFixed(2);

				this.asnModel.refresh(true);
			}

			// this.onSelectionChangeEnableDisableCheck(e);
			// else {
			// 	MessageBox.information("Please select the item");
			// 	e.getSource().setValue();
			// }
		},

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

		onAsnSave: function (event) {
			var that = this;
			this.getView().byId("MaterialSearchId").setValue("");
			this.onRowSelect(event);
			// var invoiceAmount = this.getView().byId("invoiceAmtId").getValue().trim();
			// var unplannedAmount = this.getView().byId("unplannedAmtId").getValue().trim();
			// unplannedAmount = Math.abs(parseFloat(unplannedAmount));
			// unplannedAmount = unplannedAmount ? unplannedAmount : 0;
			// var InvoiceVal = +invoiceAmount + +unplannedAmount;
			// this.getView().byId("invoiceValueId").setValue(InvoiceVal.toFixed(2));

			this.asnModel.refresh(true);
			this.data = this.asnModel.getData();
			var ButtonText = event.getSource().getText();
			var createData = {
				"Update": false,
				"DraftAsn": false,
				"AsnNum": this.data.AsnNum.toString(),
				"Buyer_Name": this.data.Buyer_Name,
				"Currency": this.data.Currency,
				"InvoiceAmt": this.data.InvoiceAmt.toString(),
				"InvoiceVal": this.data.InvoiceVal.toString(),
				"UnplannedCost": this.data.UnplannedCost.toString(),
				"UnplannedCost_text": this.data.UnplannedCost_text,
				"ASNamt": this.data.ASNamt.toString(),
				"InvoiceDate": this.data.InvoiceDate,
				"InvoiceNum": this.data.InvoiceNum,
				"Purchase_Group_Desc": this.data.Purchase_Group_Desc,
				"ShipTime": this.data.ShipTime,
				"Total_Amount": this.data.Total_Amount,
				"Schedule_No": this.data.Schedule_No,
				"Werks": this.data.Werks,
				"Fis_Year": this.data.Fis_Year,
				"ASNItemnav": []
			};
			if (ButtonText === "Save as Draft") {
				createData.DraftAsn = true;
			} else {
				if (this.getView().byId("UploadCollection").getItems().length <= 0) {
					MessageBox.error("Atleast One attachment is required.");
					return;
				}
			}
			this.data.Schedule_No = this.Schedule_No;
			var oTable = this.getView().byId("AsnCreateTable");
			var aItems = "";
			var contexts = oTable.getSelectedContexts();
			if (contexts) {
				aItems = contexts.map(function (c) {
					return c.getObject();
				});
			}
			for (var i = 0; i < aItems.length; i++) {
				if (parseFloat(aItems[i].Menge) > parseFloat(aItems[i].Con_Qty)) {
					sap.m.MessageBox.error("ASN qty. can't exceed confirmed qty.");
					sap.ui.core.BusyIndicator.hide();
					return;
				}
				// Asn_Created + Menge <= Con_Qty
				if (parseFloat(aItems[i].Menge) + parseFloat(aItems[i].Asn_Created) > parseFloat(aItems[i].Con_Qty)) {
					sap.m.MessageBox.error("ASN qty. can't exceed confirmed qty. at Item no. " + aItems[i].Ebelp + " Schedule Line No." + +aItems[i].Etenr);
					sap.ui.core.BusyIndicator.hide();
					return;
				}
				if (aItems[i].MatExp && !aItems[i].MatExpDate) {
					sap.m.MessageBox.error("Please fill material expiry date");
					sap.ui.core.BusyIndicator.hide();
					return;
				}
			}

			createData.ASNItemnav = aItems;
			// !createData.InvoiceNum || !createData.InvoiceDate ||
			if (createData.InvoiceNum) {
				if (!createData.InvoiceDate) {
					MessageBox.error("Please fill Invoice Date.");
					return;
				}
			}
			if (!createData.InvoiceAmt) {
				MessageBox.error("Please fill all the required Information");
			} else if (createData.ASNItemnav.length <= 0) {
				MessageBox.error("No Line Item Selected");
			} else {
				var that = this;
				MessageBox.confirm("Do You Want to Create ASN ? ", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
					icon: sap.m.MessageBox.Icon.QUESTION,
					onClose: function (oAction) {
						if (oAction === "OK") {
							that.oDataModel.create("/ASN_HEADERSet", createData, null, function (oData, response) {
								var POItems = oData.ASNItemnav.results;
								POItems.forEach(function (item, index, object) {
									if (item.Menge === "0.00") {
										object.splice(index, 1);
									}
								});
								that.asn = oData.AsnNum;
								that.year = oData.Fis_Year;
								that.onStartUpload();
								sap.m.MessageBox.success("ASN No. " + oData.AsnNum + "/" + oData.Fis_Year + " created Succesfully  ", {
									actions: [sap.m.MessageBox.Action.OK],
									icon: sap.m.MessageBox.Icon.SUCCESS,
									onClose: function (oAction) {
										if (oAction == "OK") {
											that.router.navTo("SAMaster");
										}
									}
								});
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
					}
				});
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
			} else {
				this.getView().byId("DP1").setEnabled(true);
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
				this.onRowSelect(oEvent);
			}
			// afilters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, search));
			// afilters.push(new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, search));
			this.byId("AsnCreateTable").getBinding("items").filter(new sap.ui.model.Filter({
				filters: afilters
			}));
		}

	});

});