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

				//this.byId("rateOk").setSelected(true);

				this.byId("totalInvNetAmnt").setValueState("None");
				this.byId("totalCGstAmnt").setValueState("None");
				this.byId("totalSGstAmnt").setValueState("None");
				this.byId("totalIGstAmnt").setValueState("None");
				this.byId("totalAmnt").setValueState("None");
				this.byId("ewayBillNumberId").setValueState("None");

				var that = this;
				this.getView().byId("AsnCreateTable").removeSelections(true);
				var datePicker = this.getView().byId("DP1");

				datePicker.addDelegate({
					onAfterRendering: function () {
						datePicker.$().find('INPUT').attr('disabled', true).css('color', '#000000');
					}
				}, datePicker);

				
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
				var unitCode = event.getParameter("arguments").UnitCode || "P01";
				this.AddressCodeSA = sessionStorage.getItem("AddressCodeSA") || 'JSE-01-01';
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
							var asnModelData = that.getView().getModel("asnModel").getData();
							for (var i = 0; i < asnModelData.DocumentRows.results.length; i++) {
								asnModelData.DocumentRows.results[i].Balance = parseFloat(asnModelData.DocumentRows.results[i].PoQty) - parseFloat(asnModelData.DocumentRows.results[i].ASNQty);
								asnModelData.DocumentRows.results[i].Pkg = "0";
								asnModelData.DocumentRows.results[i].ASSValue = parseFloat(asnModelData.DocumentRows.results[i].Balance) * parseFloat(asnModelData.DocumentRows.results[i].UnitPrice);
								if (asnModelData.DocumentRows.results[i].IGST !== "0") {
									asnModelData.DocumentRows.results[i].IGA = (parseFloat(asnModelData.DocumentRows.results[i].IGST) * parseFloat(asnModelData.DocumentRows.results[i].Balance) * parseFloat(asnModelData.DocumentRows.results[i].UnitPrice)) / 100;
								}
								if (asnModelData.DocumentRows.results[i].CGST !=="0") {
									asnModelData.DocumentRows.results[i].CGA = (parseFloat(asnModelData.DocumentRows.results[i].CGST) * parseFloat(asnModelData.DocumentRows.results[i].Balance) * parseFloat(asnModelData.DocumentRows.results[i].UnitPrice)) / 100;
								}
								if (asnModelData.DocumentRows.results[i].SGST !=="0") {
									asnModelData.DocumentRows.results[i].SGA = (parseFloat(asnModelData.DocumentRows.results[i].SGST) * parseFloat(asnModelData.DocumentRows.results[i].Balance) * parseFloat(asnModelData.DocumentRows.results[i].UnitPrice)) / 100;
								}
								asnModelData.DocumentRows.results[i].LineValue = parseFloat(asnModelData.DocumentRows.results[i].ASSValue) + parseFloat(asnModelData.DocumentRows.results[i].IGA) + parseFloat(asnModelData.DocumentRows.results[i].CGA) + parseFloat(asnModelData.DocumentRows.results[i].SGA);
			
							}
							that.asnModel.refresh(true);
							that.initializeAPIS();
						} else {
							MessageBox.error("Schedule agreement not found");
						}
					},
					error: function (oError) {
						var value = JSON.parse(oError.responseText);
						MessageBox.error(value.error.message.value);
					}
				});

			}
			sap.ui.core.BusyIndicator.hide();
		},
		initializeAPIS: function () {
			this.GetTransportModeList()
				// .catch(function (error) {
				// 	MessageBox.error("Failed to fetch data: " + error.message);
				// });
		},
		GetTransportModeList: function () {
			var oModel = this.getView().getModel();
			return new Promise(function (resolve, reject) {
				oModel.callFunction("/GetTransportModeList", {
					method: "GET",
					success: function (oData, response) {
						var transportData = oData.results;
						var oTransportModel = new sap.ui.model.json.JSONModel();
						oTransportModel.setData({ items: transportData });
						this.getView().setModel(oTransportModel, "transport");
						resolve();
					}.bind(this),
					error: function (oError) {
						reject(new Error("Failed to fetch transport data."));
					}
				});
			}.bind(this));
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
			var that = this;
			// var oModel = this.getOwnerComponent().getModel();
			if(this.validateFields()){
			this.data = this.asnModel.getData();
			var form = {
				//"UnitCode": sessionStorage.getItem("unitCode") || "P01",
				"UnitCode": this.data.PlantCode,
				"CreatedBy": this.getView().getModel().getHeaders().loginId,
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
			if (this.data.EwayBillNumber === undefined) {
				this.data.EwayBillNumber = "";
			}
			if (!this.data.TotalInvNetAmnt) {
				MessageBox.error("Please fill Total Invoice Net Amount");
				return;
			} else if (!this.data.TotalCGstAmnt) {
				MessageBox.error("Please fill Total CGST Amount");
				return;
			}
			else if (!this.data.TotalSGstAmnt) {
				MessageBox.error("Please fill Total SGST Amount");
				return;
			}
			else if (!this.data.TotalIGstAmnt) {
				MessageBox.error("Please fill Total IGST Amount");
				return;
			}
			else if (!this.data.TotalAmnt) {
				MessageBox.error("Please fill Total Amount");
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

					let allEqualIGST = items => items.every(val => val.IGST === items[0].IGST);
					let allEqualCGST = items => items.every(val => val.CGST === items[0].CGST);
					let allEqualSGST = items => items.every(val => val.SGST === items[0].SGST);

					if (!allEqualIGST) {
						MessageBox.error("Please select line items with same IGST %");
						sap.ui.core.BusyIndicator.hide();

						return;
					}
					if (!allEqualCGST) {
						MessageBox.error("Please select line items with same CGST %");
						sap.ui.core.BusyIndicator.hide();

						return;
					}
					if (!allEqualSGST) {
						MessageBox.error("Please select line items with same SGST %");
						sap.ui.core.BusyIndicator.hide();

						return;
					}
					if (parseInt(items[i].LineNum) !== (i+1)) {
						MessageBox.error("Please enter correct Bill Line No.");
						sap.ui.core.BusyIndicator.hide();

						return;
					}
					if (!items[i].Balance) {
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
						if (this.data.ManufacturingMonth === undefined) {
							this.data.ManufacturingMonth = "";
						} else if (this.data.ManufacturingMonth) {
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
							"Quantity": items[i].Balance,
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
							"GRDate": this.data.GRDate,
							"Packaging": "0",
							"WeightPerKG": items[i].WeightInKG,
							"EwayBillNumber": this.data.EwayBillNumber,
							"EwayBillDate": this.EwayBillDate,
							"MillNumber": this.data.MillNumber,
							"MillName": this.data.MillName,
							"PDIRNumber": this.data.PDIRNumber,
							"HeatNumber": this.data.HeatNumber,
							"BatchNumber": this.data.BatchNumber,
							"ManufacturingMonth": this.data.ManufacturingMonth
						};
						form.RowDetails.push(row);
					}

				}
				var messagecontent = "TOTAL AMOUNT = " + this.data.TotalAmnt + " INR" + "\n \n \n Are you sure you want to proceed for ASN generation?";
				MessageBox.confirm(messagecontent, {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
					icon: sap.m.MessageBox.Icon.QUESTION,
					styleClass: "messageText",
					onClose: function (oAction) {
						if (oAction === "OK") {
							sap.ui.core.BusyIndicator.show();
							var formdatastr = JSON.stringify(form);
							// this.hardcodedURL = "";
							// if (window.location.href.includes("launchpad")) {
							// 	this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a91d9b1c-a59b-495f-aee2-3d22b25c7a3c.schedulingagreement.sapfiorischedulingagreement-0.0.1";
							// }
							this.hardcodedURL = "";
							if (window.location.href.includes("site")) {
								this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.schedulingagreement");
							}
							var sPath = this.hardcodedURL + `/sa/odata/v4/catalog/PostASN`;
							$.ajax({
								type: "POST",
								headers: {
									'loginid': that.getView().getModel().getHeaders().loginId,
									'Content-Type': 'application/json'
								},
								url: sPath,
								data: JSON.stringify({
									asnData: formdatastr
								}),
								context: this,
								success: function (data, textStatus, jqXHR) {
									sap.ui.core.BusyIndicator.hide();
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
									that.onAsnSaveDB(this.AsnNum);
								}.bind(this),
								error: function (error) {
									sap.ui.core.BusyIndicator.hide();
									var errormsg = JSON.parse(error.responseText)
									MessageBox.error(errormsg.error.message.value);
								}
							});
						}
					}
				});
			}
		}else{
				MessageBox.error("Eway Bill Number should be 12 digit");
				return;
				
		}
		},
		onAsnSaveDB: function (ASNNUM) {
			// var that = this;
			//this.getView().byId("MaterialSearchId").setValue("");
			//this.onRowSelect(event);
			var oModel = this.getOwnerComponent().getModel();

			this.data = this.asnModel.getData();
			var ASNHeaderData = {
				"SchNum_ScheduleNum": this.data.ScheduleNum,
				"AsnNum": ASNNUM,
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
				"TotalCGstAmnt": this.data.TotalCGstAmnt,
				"TotalSGstAmnt": this.data.TotalSGstAmnt,
				"TotalIGstAmnt": this.data.TotalIGstAmnt,
				"TotalAmnt": this.data.TotalAmnt,
				"TransporterID": this.data.TransporterID
				//"RateStatus": this.data.DocumentRows.results.every(item => item.RateAggreed === true) ? "Rate Matched" : "Rate Un-Matched"
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
			} else if (!ASNHeaderData.TotalCGstAmnt) {
				MessageBox.error("Please fill Total CGST Amount");
				return;
			}
			else if (!ASNHeaderData.TotalSGstAmnt) {
				MessageBox.error("Please fill Total SGST Amount");
				return;
			}
			else if (!ASNHeaderData.TotalIGstAmnt) {
				MessageBox.error("Please fill Total IGST Amount");
				return;
			}
			else if (!ASNHeaderData.TotalAmnt) {
				MessageBox.error("Please fill Total Amount");
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

					if (!items[i].Balance) {
						MessageBox.error("ASN Quantity is required for selected items");
						sap.ui.core.BusyIndicator.hide();

						return;
					} else {
						items[i].ASSValue = items[i].ASSValue.toString();
						items[i].CGA = items[i].CGA.toString();
						items[i].LineValue = items[i].LineValue.toString();
						items[i].SGA = items[i].SGA.toString();
						items[i].IGA = items[i].IGA.toString();
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
				var AsnNum = ASNNUM.replace(/\//g, '-');
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





		//	********************************************Upload File start Code ***********************************


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
			this.hardcodedURL = "";
			if (window.location.href.includes("site")) {
				this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.schedulingagreement");
			}
			var oData = {
				AsnNum: AsnNum,
				mediaType: item.getMediaType(),
				fileName: item.getFileName(),
				size: item.getFileObject().size,
				url: this.hardcodedURL + `/sa/odata/v4/catalog/Files(AsnNum='${AsnNum}')/content`,
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
			this.hardcodedURL = "";
			if (window.location.href.includes("site")) {
				this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.schedulingagreement");
			}
			var url = this.hardcodedURL + `/sa/odata/v4/catalog/Files(AsnNum='${AsnNum}')/content`
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
				// this.getView().byId("DP1").setEnabled(true);
				// this.getView().byId("DP1").setValue("");
				this.getView().byId("uploadSet").setUploadEnabled(false);
			} else {
				// this.getView().byId("DP1").setEnabled(true);
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
			data[path].Balance = val;
			data[path].ASSValue = parseFloat(data[path].Balance) * parseFloat(data[path].UnitPrice);
			if (data[path].Packing) {
				data[path].ASSValue = parseFloat(data[path].ASSValue) + parseFloat(data[path].Packing);
			}
			if (data[path].Frieght) {
				data[path].ASSValue = parseFloat(data[path].ASSValue) + parseFloat(data[path].Frieght);
			}
			if (data[path].OtherCharges) {
				data[path].ASSValue = parseFloat(data[path].ASSValue) + parseFloat(data[path].OtherCharges);
			}
			if (data[path].IGST !== "0") {
				data[path].IGA = (parseFloat(data[path].IGST) * parseFloat(data[path].Balance) * parseFloat(data[path].UnitPrice)) / 100;
			}
			if (data[path].CGST !== "0") {
				data[path].CGA = (parseFloat(data[path].CGST) * parseFloat(data[path].Balance) * parseFloat(data[path].UnitPrice)) / 100;
			}
			if (data[path].SGST !== "0") {
				data[path].SGA = (parseFloat(data[path].SGST) * parseFloat(data[path].Balance) * parseFloat(data[path].UnitPrice)) / 100;
			}
			data[path].LineValue = parseFloat(data[path].ASSValue) + parseFloat(data[path].IGA) + parseFloat(data[path].CGA) + parseFloat(data[path].SGA);
			this.asnModel.refresh(true);
			this.onRowSelect();
			
		},
		onPackChange: function (e) {
			const val = e.getParameter("value") || 0;
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.asnModel.getData().DocumentRows.results;
			data[path].Packing = val;
			if (data[path].Frieght === undefined) { data[path].Frieght = "0" }
			if (data[path].OtherCharges === undefined) { data[path].OtherCharges = "0" }
			data[path].ASSValue = (parseFloat(data[path].Balance) * parseFloat(data[path].UnitPrice)) + parseFloat(data[path].Packing) + parseFloat(data[path].Frieght) + parseFloat(data[path].OtherCharges);
			this.asnModel.refresh(true);
		},
		onFreightChange: function (e) {
			const val = e.getParameter("value") || 0;
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.asnModel.getData().DocumentRows.results;
			data[path].Frieght = val;
			if (data[path].Packing === undefined) { data[path].Packing = "0" }
			if (data[path].OtherCharges === undefined) { data[path].OtherCharges = "0" }
			data[path].ASSValue = (parseFloat(data[path].Balance) * parseFloat(data[path].UnitPrice)) + parseFloat(data[path].Packing) + parseFloat(data[path].Frieght) + parseFloat(data[path].OtherCharges);
			this.asnModel.refresh(true);
		},
		onOtherChange: function (e) {
			const val = e.getParameter("value") || 0;
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.asnModel.getData().DocumentRows.results;
			data[path].OtherCharges = val;
			if (data[path].Frieght === undefined) { data[path].Frieght = "0" }
			if (data[path].Packing === undefined) { data[path].Packing = "0" }
			data[path].ASSValue = (parseFloat(data[path].Balance) * parseFloat(data[path].UnitPrice)) + parseFloat(data[path].Packing) + parseFloat(data[path].Frieght) + parseFloat(data[path].OtherCharges);
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
			let obj, totalInvNetAmnt = 0, totalCGstAmnt = 0, totalSGstAmnt = 0, totalIGstAmnt = 0, totalAmnt = 0;
			this.byId("AsnCreateTable").getSelectedItems().forEach(item => {
				obj = item.getBindingContext("asnModel").getObject();
				totalInvNetAmnt += parseFloat(obj.Balance) * parseFloat(obj.UnitPrice);
				if(parseFloat(obj.CGST) !== 0){
					totalCGstAmnt += (parseFloat(obj.CGST) * parseFloat(obj.Balance) * parseFloat(obj.UnitPrice)) / 100;
				}if(parseFloat(obj.SGST) !== 0){
					totalSGstAmnt += (parseFloat(obj.SGST) * parseFloat(obj.Balance) * parseFloat(obj.UnitPrice)) / 100;
				}if(parseFloat(obj.IGST) !== 0){
					totalIGstAmnt += (parseFloat(obj.IGST) * parseFloat(obj.Balance) * parseFloat(obj.UnitPrice)) / 100;
				}
				totalAmnt = totalInvNetAmnt + totalCGstAmnt + totalSGstAmnt + totalIGstAmnt;
			});
			const totalInvNetAmntCtr = this.byId("totalInvNetAmnt"),
				totalCGstAmntCtr = this.byId("totalCGstAmnt"),
				totalSGstAmntCtr = this.byId("totalSGstAmnt"),
				totalIGstAmntCtr = this.byId("totalIGstAmnt"),
				totalAmntCtr = this.byId("totalAmnt");
			totalInvNetAmntCtr.setValue(parseFloat(this.formatAmnt(totalInvNetAmnt)));
			totalCGstAmntCtr.setValue(parseFloat(this.formatAmnt(totalCGstAmnt)));
			totalSGstAmntCtr.setValue(parseFloat(this.formatAmnt(totalSGstAmnt)));
			totalIGstAmntCtr.setValue(parseFloat(this.formatAmnt(totalIGstAmnt)));
			totalAmntCtr.setValue(parseFloat(this.formatAmnt(totalAmnt)));
			if (totalInvNetAmnt === parseFloat(totalInvNetAmntCtr.getValue())) {
				totalInvNetAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
			} else {
				totalInvNetAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
			}

			if (totalCGstAmnt === parseFloat(totalCGstAmntCtr.getValue())) {
				totalCGstAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
			} else {
				totalCGstAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
			}

			if (totalSGstAmnt === parseFloat(totalSGstAmntCtr.getValue())) {
				totalSGstAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
			} else {
				totalSGstAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
			}

			if (totalIGstAmnt === parseFloat(totalIGstAmntCtr.getValue())) {
				totalIGstAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
			} else {
				totalIGstAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
			}

			if (totalAmnt === parseFloat(totalAmntCtr.getValue())) {
				totalAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
			} else {
				totalAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
			}
		},
		onAmtChange: function () {
			let obj, totalInvNetAmnt = 0, totalCGstAmnt = 0, totalSGstAmnt = 0, totalIGstAmnt = 0, totalAmnt;
			this.byId("AsnCreateTable").getSelectedItems().forEach(item => {
				obj = item.getBindingContext("asnModel").getObject();
				totalInvNetAmnt += parseFloat(obj.Balance) * parseFloat(obj.UnitPrice);
				if(parseFloat(obj.CGST) !== 0){
					totalCGstAmnt += (parseFloat(obj.CGST) * parseFloat(obj.Balance) * parseFloat(obj.UnitPrice)) / 100;
				}if(parseFloat(obj.SGST) !== 0){
					totalSGstAmnt += (parseFloat(obj.SGST) * parseFloat(obj.Balance) * parseFloat(obj.UnitPrice)) / 100;
				}if(parseFloat(obj.IGST) !== 0){
					totalIGstAmnt += (parseFloat(obj.IGST) * parseFloat(obj.Balance) * parseFloat(obj.UnitPrice)) / 100;
				}
				totalAmnt = totalInvNetAmnt + totalCGstAmnt + totalSGstAmnt + totalIGstAmnt;
			});
			const totalInvNetAmntCtr = this.byId("totalInvNetAmnt"),
				totalCGstAmntCtr = this.byId("totalCGstAmnt"),
				totalSGstAmntCtr = this.byId("totalSGstAmnt"),
				totalIGstAmntCtr = this.byId("totalIGstAmnt"),
				totalAmntCtr = this.byId("totalAmnt");
				if (totalInvNetAmnt === parseFloat(totalInvNetAmntCtr.getValue())) {
					totalInvNetAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
				} else {
					totalInvNetAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
				}
	
				if (totalCGstAmnt === parseFloat(totalCGstAmntCtr.getValue())) {
					totalCGstAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
				} else {
					totalCGstAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
				}
	
				if (totalSGstAmnt === parseFloat(totalSGstAmntCtr.getValue())) {
					totalSGstAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
				} else {
					totalSGstAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
				}
	
				if (totalIGstAmnt === parseFloat(totalIGstAmntCtr.getValue())) {
					totalIGstAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
				} else {
					totalIGstAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
				}
	
				if (totalAmnt === parseFloat(totalAmntCtr.getValue())) {
					totalAmntCtr.setValueState("Success").setValueStateText("Amount Matched");
				} else {
					totalAmntCtr.setValueState("Warning").setValueStateText("Amount Mismatch");
				}
		},
		validateFields: function () {
			var bValidationError = true, oInput = this.getView().byId("ewayBillNumberId"), oBinding = oInput.getBinding("value");
			if(oInput.getValue()){
			try {
				oBinding.getType().validateValue(oInput.getValue());
				oInput.setValueState("None");
				bValidationError = true;
			} catch (oException) {
				oInput.setValueState("Error");
				bValidationError = false;
			}
		}
			return bValidationError;
		},
		formatAmnt: function (oAmount) {
			if (oAmount) {
				var oFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
					"groupingEnabled": false,
					"groupingSeparator": '',
					"groupingSize": 0,
					"decimalSeparator": ".",
					"decimals": 2
				});
				return oFormat.format(oAmount);
			}
			return "0.00";
		},
	});

});
