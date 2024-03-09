sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/model/Filter"],function(e,t,a){"use strict";return e.extend("sap.fiori.schedulingagreement.controller.SAMaster",{onInit:function(){this.router=sap.ui.core.UIComponent.getRouterFor(this);this.router.attachRoutePatternMatched(this.onRouteMatched,this);this.filterModel=new sap.ui.model.json.JSONModel;this.listTemp=this.byId("idlistitem").clone()},onRouteMatched:function(e){if(e.getParameter("name")!=="SAMaster"){return}this.unitCode=sessionStorage.getItem("unitCode")||"P01";this.AddressCodeSA=sessionStorage.getItem("AddressCodeSA")||"JSE-01-01";this.byId("masterListId").bindAggregation("items",{path:"/SchedulingAgreements",parameters:{custom:{AddressCode:this.AddressCodeSA,UnitCode:this.unitCode},countMode:"None"},template:this.listTemp});this.routeToDetail()},routeToDetail:function(){this.byId("masterListId").getBinding("items").attachDataReceived(()=>{var e=this.byId("masterListId").getItems()[0];if(e){this.byId("masterListId").setSelectedItem(e,true);var t=e.getProperty("title").replace(/\//g,"-");this.router.navTo("SADetail",{Schedule_No:t})}else{this.router.navTo("NoData")}})},onSupplierValueHelp:function(){var e=sap.ui.xmlfragment("sap.fiori.schedulingagreement.fragment.SuppF4",this);this.getView().addDependent(e);this.oTemplate=sap.ui.getCore().byId("suppF4Temp").clone();sap.ui.getCore().byId("suppF4").bindAggregation("items",{path:"/SupplierHelpSet",template:this.oTemplate});e.open()},onSuppF4Search:function(e){var t=e.getParameter("value");var a=t?{custom:{search:t}}:"";sap.ui.getCore().byId("suppF4").bindAggregation("items",{path:"/SupplierHelpSet",parameters:a,template:this.oTemplate})},onSuppF4Confirm:function(e){e.getSource().destroy();sap.ui.getCore().getModel("filterModel").getData().Vendor_No=e.getParameter("selectedItem").getTitle();sap.ui.getCore().getModel("filterModel").refresh("true")},onSuppF4Close:function(e){e.getSource().destroy()},onListItemPress:function(e){var t=e.getParameter("listItem").getProperty("title");var a=t.replace(/\//g,"-");this.router.navTo("SADetail",{Schedule_No:a})},onSearch:function(e){if(e.getParameter("refreshButtonPressed")===true){this.getView().byId("masterListId").getBinding("items").refresh(true)}else{var t=e.getParameter("query");var a=t?{custom:{search:t}}:"";this.byId("masterListId").bindAggregation("items",{path:"/SchedulingAgreements?search="+t,parameters:{custom:{unitCode:this.unitCode}},template:this.listTemp})}this.routeToDetail()},onFilter:function(){if(!this.filterFragment){this.filterFragment=sap.ui.xmlfragment("sap.fiori.schedulingagreement.fragment.filterFragment",this);this.filterFragment.setModel(sap.ui.getCore().getModel("filterModel"),"filterModel")}this.filterFragment.open()},onPlantValueHelp:function(){if(!this.PlantF4Frag){this.PlantF4Frag=sap.ui.xmlfragment("sap.fiori.schedulingagreement.fragment.PlantFrag",this);this.PlantF4Temp=sap.ui.getCore().byId("plantTempId").clone()}this.getView().addDependent(this.PlantF4Frag);sap.ui.getCore().byId("plantF4Id").bindAggregation("items",{path:"/PlantHelpSet",template:this.PlantF4Temp});this.PlantF4Frag.open()},handlePlantSearch:function(e){var t=e.getParameter("value");var a=t?{custom:{search:t}}:"";sap.ui.getCore().byId("plantF4Id").bindAggregation("items",{path:"/PlantHelpSet",parameters:a,template:this.PlantF4Temp})},handlePlantClose:function(e){var t=e.getParameter("selectedItem").getBindingContext().getObject();sap.ui.getCore().getModel("filterModel").getData().Werks=t.Werks;sap.ui.getCore().getModel("filterModel").refresh("true");this.PlantF4Frag.destroy();this.PlantF4Frag=""},handlePlantCancel:function(){this.PlantF4Frag.destroy();this.PlantF4Frag=""},onMaterialValueHelp:function(){if(!this.MaterialF4Frag){this.MaterialF4Frag=sap.ui.xmlfragment("sap.fiori.schedulingagreement.fragment.MaterialFrag",this);this.MaterialF4Temp=sap.ui.getCore().byId("materialTempId").clone()}this.getView().addDependent(this.MaterialF4Frag);sap.ui.getCore().byId("materialF4Id").bindAggregation("items",{path:"/MaterialHelpSet",template:this.MaterialF4Temp});this.MaterialF4Frag.open()},handleMaterialSearch:function(e){var t=e.getParameter("value");var a=t?{custom:{search:t}}:"";sap.ui.getCore().byId("materialF4Id").bindAggregation("items",{path:"/MaterialHelpSet",parameters:a,template:this.MaterialF4Temp})},handleMaterialClose:function(e){var t=e.getParameter("selectedItem").getBindingContext().getObject();sap.ui.getCore().getModel("filterModel").getData().Matnr=t.Matnr;sap.ui.getCore().getModel("filterModel").refresh("true");this.MaterialF4Frag.destroy();this.MaterialF4Frag=""},handleMaterialCancel:function(){this.MaterialF4Frag.destroy();this.MaterialF4Frag=""},onFilterSubmit:function(){var e=sap.ui.getCore().getModel("filterModel").getData();var t=e.Vendor_No||"";if(this.getView().getModel().getHeaders().LoginType==="E"&&!t.trim()){sap.m.MessageBox.error("Please fill all the required details");return}var a=e.Matnr||"";var i=e.Werks||"";this.byId("masterListId").bindAggregation("items",{path:"/S_HEADERSet",filters:[new sap.ui.model.Filter("Matnr","EQ",a),new sap.ui.model.Filter("Plant","EQ",i)],template:this.listTemp});this.filterFragment.close();this.filterFragment.destroy();this.filterFragment="";if(a||i){this.getView().byId("clearFilterId").setVisible(true)}this.routeToDetail()},onFilterCancel:function(){this.filterFragment.close();this.filterFragment.destroy();this.filterFragment=""},onFilterClear:function(){this.byId("clearFilterId").setVisible(false);if(sap.ui.getCore().getModel("filterModel").getData().Vendor_No){this.byId("masterListId").bindItems({path:"/S_HEADERSet",template:this.listTemp});sap.ui.getCore().getModel("filterModel").setData({Vendor_No:sap.ui.getCore().getModel("filterModel").getData().Vendor_No})}else{this.byId("masterListId").bindItems({path:"/S_HEADERSet",template:this.listTemp});sap.ui.getCore().getModel("filterModel").setData({})}this.routeToDetail()}})});