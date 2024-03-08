sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageBox"],function(e,t){"use strict";return e.extend("sap.fiori.schedulingagreement.controller.SAAsnEdit",{onInit:function(){this.selectedItems=[];this.oDataModel=sap.ui.getCore().getModel("oDataModel");this.getView().setModel(this.oDataModel);this.getView().addStyleClass("sapUiSizeCompact");this.router=sap.ui.core.UIComponent.getRouterFor(this);this.router.attachRouteMatched(this.handleRouteMatched,this);this.asnModel=new sap.ui.model.json.JSONModel;this.asnModel.setSizeLimit(1e4);this.getView().setModel(this.asnModel,"asnModel");this.getView().byId("AsnCreateTable").setSticky(["ColumnHeaders","HeaderToolbar"]);this.uploadCollectionTemp=this.getView().byId("UploadCollItemId").clone();this.dateConfirmationModel=new sap.ui.model.json.JSONModel;this.getView().setModel(this.dateConfirmationModel,"DateConfirmationModel");this.popOverModel=new sap.ui.model.json.JSONModel;this.DeleteArray=[];this.DeleteFlag=false},handleRouteMatched:function(e){if(e.getParameter("name")==="SAAsnEdit"){var a=this;this.getView().byId("AsnCreateTable").removeSelections(true);var r=this.getView().byId("DP1");r.addDelegate({onAfterRendering:function(){r.$().find("INPUT").attr("disabled",true).css("color","#000000")}},r);var n=new Date;var s=new Date;var o=new Date;o.setDate(n.getDate()-4);s.setDate(n.getDate()+1);this.getView().byId("DP1").setMinDate(o);this.getView().byId("DP1").setMaxDate(n);this.Amount=e.getParameter("arguments").Amount;this.Amount.trim();this.Vendor_No=e.getParameter("arguments").Vendor_No;this.Asn_No=e.getParameter("arguments").Asn_No;this.FisYear=this.getOwnerComponent().getComponentData().startupParameters.FisYear[0];this.getView().byId("AsnObjectId").setTitle("ASN Number:"+this.Asn_No+"/"+this.FisYear+"");this.getView().byId("AsnCreateTable").removeSelections(true);this.Schedule_No=e.getParameter("arguments").Schedule_No;this.oDataModel.read("/ASN_HEADERSet(Schedule_No='"+this.Schedule_No+"')?$expand=ASNItemnav",null,null,false,function(e,t){var r=jQuery.sap.storage(jQuery.sap.storage.Type.session).get("AsnItems");var n=e.ASNItemnav.results;n.forEach(function(e){r.forEach(function(t){if(e.Ebelp===t.ItemNo.trim()&&e.Etenr===t.schd_line.trim()){e.Draft_AsnQty=t.Quantity;e.Draft_AsnQty1=t.Quantity}})});let s;e.ASNItemnav.results=n.filter(function(e){s=parseFloat(e.Draft_AsnQty)/parseFloat(e.SOQ);e.PkgMatQty=isNaN(s)?"0":isFinite(s)===false?"0":Math.ceil(s).toString();e.NetprVen=e.Netpr.trim();return e.Menge!=="0.00"||e.Draft_AsnQty!=="0"});n.forEach(function(e,t){if(e.Draft_AsnQty!=="0"){e.Selected=true;e.CheckFlag="X"}});a.asnModel.setData(e);a.asnModel.getData().InvoiceAmt=a.Amount;a.asnModel.getData().InvoiceNum=a.getOwnerComponent().getComponentData().startupParameters.Invoice_Num[0];a.asnModel.getData().InvoiceDate=a.getOwnerComponent().getComponentData().startupParameters.Invoice_Date[0];if(jQuery.sap.storage(jQuery.sap.storage.Type.session).get("UnplannedCost")){a.asnModel.getData().UnplannedCost=jQuery.sap.storage(jQuery.sap.storage.Type.session).get("UnplannedCost").trim();var o=+a.asnModel.getData().InvoiceAmt+ +a.asnModel.getData().UnplannedCost;a.asnModel.getData().InvoiceVal=o.toFixed(2);a.getView().byId("AsnObjectId").setNumber(a.asnModel.getData().InvoiceVal)}a.asnModel.refresh(true);var i=a.getView().byId("AsnCreateTable");var l=i.getBindingInfo("items");delete l.filters;i.bindAggregation("items",l)},function(e){var a=JSON.parse(e.response.body);t.error(a.error.message.value,{onClose:function(){sap.fiori.schedulingagreement.controller.formatter.onNavBack()}})});if(!this.header_xcsrf_token){var i=this.getView().getModel();var l=i.sServiceUrl+"/";var a=this;sap.ui.core.BusyIndicator.show(0);i._request({requestUri:l,method:"GET",headers:{"X-Requested-With":"XMLHttpRequest","Content-Type":"application/atom+xml",DataServiceVersion:"2.0","X-CSRF-Token":"Fetch"}},function(e,t){sap.ui.core.BusyIndicator.hide();a.header_xcsrf_token=t.headers["x-csrf-token"]});sap.ui.core.BusyIndicator.hide()}sap.ui.core.BusyIndicator.hide();this.getView().byId("UploadCollection").bindItems({path:"/AsnAttachementSet?$filter=AsnNum eq '"+this.Asn_No+"' and FisYear eq '"+this.FisYear+"'",template:a.uploadCollectionTemp})}},onUnplannedCostChange:function(e){if(e.getParameter("newValue").includes("-")){t.error("Unplanned cost less than 0 is not allowed!");var a=Math.abs(parseFloat(e.getParameter("newValue")));e.getSource().setValue(a)}if(e.getParameter("newValue").includes(".")){var r=e.getParameter("newValue").split(".");if(r[1].length>2){t.error("Value upto 2 decimals is allowed.");e.getSource().setValue(parseFloat(e.getParameter("newValue")).toFixed(2))}}},onQuanChange:function(e){var t=e.getSource().getParent().getProperty("selected");var a=this.asnModel.getData();a.ASNamt=0;var r=e.getSource().getParent().getBindingContext("asnModel").getPath().split("/")[3];var n=this.getView().byId("AsnCreateTable");var s=n.getSelectedContexts();var o=s.map(function(e){return e.getObject()});a.ASNItemnav.results[r].Menge=e.getSource().getValue();for(var i=0;i<o.length;i++){if(!o[i].Netpr){o[i].Netpr=0}if(!o[i].Cgst){o[i].Cgst=0}if(!o[i].Igst){o[i].Igst=0}if(!o[i].Sgst){o[i].Sgst=0}var l=(parseFloat(o[i].Menge)*parseFloat(o[i].Netpr)).toFixed(2);var d=(parseFloat(o[i].Menge)*parseFloat(o[i].Cgst)).toFixed(2);var g=(parseFloat(o[i].Menge)*parseFloat(o[i].Igst)).toFixed(2);var u=(parseFloat(o[i].Menge)*parseFloat(o[i].Sgst)).toFixed(2);a.ASNamt=parseFloat(a.ASNamt)+parseFloat(l)+parseFloat(d)+parseFloat(g)+parseFloat(u);a.ASNamt=parseFloat(a.ASNamt).toFixed(2)}a.ASNamt=parseFloat(a.ASNamt).toFixed(2);a.InvoiceAmt=a.ASNamt;this.asnModel.refresh(true)},onAsnQtyChange:function(e){var t=e.getSource().getParent().getBindingContext("asnModel").getObject();var a=e.getSource().getParent().getBindingContext("asnModel").getPath().split("/")[3];var r=e.getSource().getParent().getSelected();var n=parseFloat(t.Con_Qty)-(parseFloat(t.Asn_Created)+parseFloat(t.Menge));var s=this.getView().byId("AsnCreateTable");s.getItems().forEach(function(e){var t=e.getBindingContext("asnModel").getPath().split("/")[3];var o=e.$().find(".sapMCb");var i=sap.ui.getCore().byId(o.attr("id"));if(t>a){if(t==parseInt(a,10)+1&&r&&parseFloat(n)==0){i.setEnabled(true)}else{i.setSelected(false);s.setSelectedItem(e,false);i.setEnabled(false)}}})},onSelectionChangeEnableDisableCheck:function(e){var t=e.getParameter("listItem").getBindingContext("asnModel").getObject();var a=e.getParameter("listItem").getBindingContext("asnModel").getPath().split("/")[3];var r=e.getParameter("listItem").getSelected();var n=parseFloat(t.Con_Qty)-(parseFloat(t.Asn_Created)+parseFloat(t.Menge));var s=this.getView().byId("AsnCreateTable");s.getItems().forEach(function(e){var t=e.getBindingContext("asnModel").getPath().split("/")[3];var o=e.$().find(".sapMCb");var i=sap.ui.getCore().byId(o.attr("id"));if(t>a){if(t==parseInt(a,10)+1&&r&&parseFloat(n)==0){i.setEnabled(true)}else{i.setSelected(false);s.setSelectedItem(e,false);i.setEnabled(false)}}})},onRowSelect:function(e){var t=this.getView().byId("AsnCreateTable").getItems();for(var a=0;a<t.length;a++){var r=t[a].getBindingContext("asnModel").getObject();if(r.CheckFlag=="X"){t[a].setSelected(true)}}this.draftInvoiceAmt()},onNavBack:function(){var e=this.getOwnerComponent().getComponentData();if(e!==undefined&&e.startupParameters.ASN_NO){var t=sap.ushell.Container.getService("CrossApplicationNavigation");t.toExternal({target:{semanticObject:"asn",action:"manage"},params:{Asn_Num:e.startupParameters.ASN_NO[0]}})}else{this.router.navTo("SAMaster")}},onAsnUpdate:function(){var e=this;this.asnModel.refresh(true);this.data=this.asnModel.getData();var a={Update:true,Delete:this.DeleteFlag,AsnNum:this.Asn_No,Buyer_Name:this.data.Buyer_Name,Currency:this.data.Currency,InvoiceAmt:this.data.InvoiceAmt.toString(),InvoiceVal:this.data.InvoiceVal.toString(),UnplannedCost:this.data.UnplannedCost.toString(),InvoiceDate:this.data.InvoiceDate,InvoiceNum:this.data.InvoiceNum,Purchase_Group_Desc:this.data.Purchase_Group_Desc,ShipTime:this.data.ShipTime,Total_Amount:this.data.Total_Amount,Schedule_No:this.data.Schedule_No,Werks:this.data.Werks,Fis_Year:this.FisYear,ASNItemnav:[]};if(this.data.InvoiceNum){a.DraftAsn=false;if(this.getView().byId("UploadCollection").getItems().length<=0){t.error("Atleast One attachment is required.");return}}else{a.DraftAsn=true}this.data.Schedule_No=this.Schedule_No;var r=this.getView().byId("AsnCreateTable");var n="";var s=r.getSelectedContexts();if(s){n=s.map(function(e){return e.getObject()})}for(var o=0;o<n.length;o++){if(n[o].Draft_AsnQty!=="0"){if(!n[o].Draft_AsnQty1){n[o].Draft_AsnQty1="0.00"}var i=+n[o].Asn_Created-+n[o].Draft_AsnQty1;var l=+n[o].Draft_AsnQty+i;if(parseFloat(n[o].Con_Qty)<l){sap.m.MessageBox.error("Draft ASN Quantity cannot be greater then ASN to be Created.");sap.ui.core.BusyIndicator.hide();return}}else{t.error("Draft ASN Quantity is required for selected items");sap.ui.core.BusyIndicator.hide();return}}a.ASNItemnav=n;if(!a.InvoiceAmt){t.error("Please fill all the required Information")}else if(a.ASNItemnav.length<=0){t.error("No Line Item Selected")}else{var e=this;t.confirm("Do You Want to Update ASN ? ",{actions:[sap.m.MessageBox.Action.OK,sap.m.MessageBox.Action.CLOSE],icon:sap.m.MessageBox.Icon.QUESTION,onClose:function(r){if(r==="OK"){for(var n=0;n<a.ASNItemnav.length;n++){delete a.ASNItemnav[n].Selected;delete a.ASNItemnav[n].CheckFlag;delete a.ASNItemnav[n].Draft_AsnQty1}e.oDataModel.create("/ASN_HEADERSet",a,null,function(t,a){e.asn=t.AsnNum;e.year=t.Fis_Year;e.onStartUpload();sap.m.MessageBox.success("ASN No. "+t.AsnNum+"/"+t.Fis_Year+" updated Succesfully  ",{actions:[sap.m.MessageBox.Action.OK],icon:sap.m.MessageBox.Icon.SUCCESS,onClose:function(t){if(t=="OK"){e.onNavBack()}}})},function(e){try{var a=JSON.parse(e.response.body);t.error(a.error.message.value)}catch(a){var r=jQuery.parseXML(e.getParameter("responseText")).querySelector("message").textContent;t.error(r)}})}}})}},handleLinkPress:function(e){if(!this._oPopover){this._oPopover=sap.ui.xmlfragment("sap.fiori.schedulingagreement.view.PricePopoverFragment",this);this.getView().addDependent(this._oPopover)}var t=e.getSource().getBindingContext("asnModel").sPath;var a=this.asnModel.getProperty(t);this.popOverModel.setData(a);this._oPopover.setModel(this.popOverModel);this._oPopover.openBy(e.getSource())},onAsnCancel:function(){this.router.navTo("PoSplit")},onQuanPress:function(e){var t=this;if(!this.QuantFrag){this.QuantFrag=sap.ui.xmlfragment("sap.fiori.schedulingagreement.view.SAFragRequiredQuan",this);this.getView().addDependent(this.QuantFrag)}var a=e.getSource().getBindingContext("asnModel").getPath();var r=this.asnModel.getProperty(a);this.oDataModel.read("/S_LINEITEMSSet?$filter=Schedule_No eq '"+r.Ebeln+"' and Schedule_Item eq '"+r.Ebelp+"' and Material_No eq '"+r.Matnr+"' and Uom eq '"+r.Uom+"'",null,null,false,function(e,a){t.popOverModel.setData(e);t.QuantFrag.setModel(t.popOverModel,"itemModel");t.popOverModel.refresh(true)});this.QuantFrag.openBy(e.getSource())},onMaterialHelpReq:function(e){this.inputId=e.getSource().getId();var t=this;if(!this.matFrag){this.matFrag=sap.ui.xmlfragment("sap.fiori.schedulingagreement.view.materialFrag",this);this.matTemp=sap.ui.getCore().byId("materialTempId").clone()}sap.ui.getCore().byId("materialF4Id").bindAggregation("items",{path:"oDataModel>/MaterialHelpSet?$filter=Schedule_No eq '"+t.Schedule_No+"'",template:t.matTemp});this.matFrag.open()},materialValueHelpClose:function(e){var t=this.getView().byId("AsnCreateTable");var a=t.getBindingInfo("items");var r=e.getParameter("selectedItem").getBindingContext("oDataModel").getObject().Matnr;this.getView().byId("MaterialId").setValue(r);var n=this.getView().byId("MaterialId").getValue();var s=this.getView().byId("DelDateId").getValue();if(!s){s=""}if(!n){n=""}var o=false;if(s&&n){o=true}a.filters=[new sap.ui.model.Filter({filters:[new sap.ui.model.Filter({path:"Matnr",operator:sap.ui.model.FilterOperator.Contains,value1:n}),new sap.ui.model.Filter({path:"Eindt",operator:sap.ui.model.FilterOperator.EQ,value1:s})],and:o})];t.bindAggregation("items",a)},onChange:function(e){var t=e.getSource();if(this.header_xcsrf_token){var a=new sap.m.UploadCollectionParameter({name:"x-csrf-token",value:this.header_xcsrf_token});t.addHeaderParameter(a)}},onStartUpload:function(e){var t=this.getView().byId("UploadCollection");t.upload()},onBeforeUploadStarts:function(e){var t=new sap.m.UploadCollectionParameter({name:"slug",value:this.asn+"/"+this.year+"/"+e.getParameter("fileName")});e.getParameters().addHeaderParameter(t)},onDeliveryCost:function(e){},onEditPress:function(e){this.byId("invoiceValueId").setEditable(true)},onUpdateFinished:function(e){var t=this;var a=this.asnModel.getData().ASNItemnav.results;t.asnModel.refresh()},onDelete:function(e){this.DeleteFlag=true;this.path=e.getSource().getBindingContext("asnModel").getPath().slice(-1);this.DeleteArray.push(this.asnModel.getData().ASNItemnav.results[this.path]);this.asnModel.getData().ASNItemnav.results.splice(this.path,1);this.asnModel.refresh();this.asnModel.getData().InvoiceVal="";this.draftInvoiceAmt()},draftInvoiceAmt:function(e){const a=e.getParameter("newValue"),r=e.getSource().getParent().getBindingContext("asnModel").getObject();if(e){var n=r.Meins;if(n=="EA"){if(a.includes(".")){t.error("Fractional Values are not allowed");e.getSource().setValue(parseInt(a,10).toString());return}}}var s=this.asnModel.getData();s.InvoiceAmt=0;var o=this.getView().byId("AsnCreateTable");var i=o.getSelectedContexts();if(i.length){var l=i.map(function(e){return e.getObject()});for(var d=0;d<l.length;d++){var g=parseFloat(l[d].Draft_AsnQty);if(g<0||l[d].Draft_AsnQty.includes("-")){sap.m.MessageBox.error("Quantity can't be in negative.");sap.ui.core.BusyIndicator.hide();return}if(!l[d].Draft_AsnQty){sap.m.MessageBox.error("Please enter a valid Quantity for selected items");s.InvoiceAmt=0;break}var u=(parseFloat(l[d].Draft_AsnQty)*parseFloat(l[d].Netpr)).toFixed(2);var c=(parseFloat(l[d].Draft_AsnQty)*parseFloat(l[d].Cgst)).toFixed(2);var h=(parseFloat(l[d].Draft_AsnQty)*parseFloat(l[d].Igst)).toFixed(2);var p=(parseFloat(l[d].Draft_AsnQty)*parseFloat(l[d].Sgst)).toFixed(2);s.InvoiceAmt=parseFloat(s.InvoiceAmt)+parseFloat(u)+parseFloat(c)+parseFloat(h)+parseFloat(p);s.InvoiceAmt=parseFloat(s.InvoiceAmt).toFixed(2);s.InvoiceAmt=Math.round(s.InvoiceAmt);var m=+this.asnModel.getData().InvoiceAmt+ +this.asnModel.getData().UnplannedCost;m=Math.round(s.InvoiceAmt);this.asnModel.getData().InvoiceVal=m.toFixed(2);this.getView().byId("AsnObjectId").setNumber(this.asnModel.getData().InvoiceVal)}}const f=parseFloat(a)/parseFloat(r.SOQ);r.PkgMatQty=isNaN(f)?"0":isFinite(f)===false?"0":Math.ceil(f).toString();this.asnModel.refresh()},onUndo:function(e){var t=this;this.DeleteFlag=false;if(this.DeleteArray){this.DeleteArray.forEach(function(e,a){t.asnModel.getData().ASNItemnav.results.unshift(e)});t.asnModel.refresh();t.DeleteArray=[];t.draftInvoiceAmt()}},onLinkPress:function(e){var a=this;var r=e.getSource().getParent().getBindingContext("asnModel").getObject();if(!this._oPopoverFragment){this._oPopoverFragment=sap.ui.xmlfragment("sap.fiori.schedulingagreement.fragment.DatePopoverFragment",this);this._oPopoverFragment.setModel(this.dateConfirmationModel);this.getView().addDependent(this._oPopoverFragment)}this.oDataModel.read("/ConfirmationDateSet?$filter=Ebeln eq '"+r.Schedule_No+"'and Ebelp  eq '"+r.Ebelp+"' and Etens eq '"+r.Etenr+"'",null,null,false,function(e,t){a.dateConfirmationModel.setData(e);a.dateConfirmationModel.refresh(true)},function(e){var a=JSON.parse(e.response.body);t.error(a.error.message.value)});this._oPopoverFragment.openBy(e.getSource())},onDeletePress:function(e){debugger;var a=this;var r=e.getSource().getBindingContext().getObject();t.confirm("Are you sure you want to delete this attachment?",{onClose:function(e){if(e=="OK"){a.oDataModel.remove("/AsnAttachementSet(AsnNum='"+r.AsnNum+"',FisYear='"+r.FisYear+"',Sernr='"+r.Sernr+"')",null,function(e){t.success("File Deleted successfully.");a.getView().byId("UploadCollection").bindItems({path:"/AsnAttachementSet?$filter=AsnNum eq '"+a.Asn_No+"' and FisYear eq '"+a.FisYear+"'",template:a.uploadCollectionTemp})},function(e){try{var a=JSON.parse(e.getParameter("responseText"));t.error(a.error.message.value)}catch(a){var r=jQuery.parseXML(e.getParameter("responseText")).querySelector("message").textContent;t.error(r)}})}}})},onTypeMissmatch:function(e){t.error("Only PDF files are allowed.")}})});