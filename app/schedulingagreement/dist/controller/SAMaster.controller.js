sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/model/Filter"],function(e,t,s){"use strict";return e.extend("sap.fiori.schedulingagreement.controller.SAMaster",{onInit:function(){this.router=sap.ui.core.UIComponent.getRouterFor(this);this.router.attachRoutePatternMatched(this.onRouteMatched,this);this.filterModel=new sap.ui.model.json.JSONModel;this.listTemp=this.byId("idlistitem").clone();this.getView().byId("plantFilterId").setText()},onRouteMatched:function(e){if(e.getParameter("name")!=="SAMaster"){return}this.unitCode=sessionStorage.getItem("unitCode")||"P04";this.AddressCodeSA=sessionStorage.getItem("AddressCodeSA");sap.ui.core.BusyIndicator.show();this.byId("masterListId").bindAggregation("items",{path:"/SchedulingAgreements",parameters:{custom:{AddressCode:this.AddressCodeSA,UnitCode:this.unitCode},countMode:"None"},template:this.listTemp});sap.ui.core.BusyIndicator.hide();this.routeToDetail()},routeToDetail:function(){this.byId("masterListId").getBinding("items").attachDataReceived(()=>{var e=this.byId("masterListId").getItems()[0];if(e){this.byId("masterListId").setSelectedItem(e,true);var t=e.getProperty("title").replace(/\//g,"-");this.router.navTo("SADetail",{Schedule_No:t,UnitCode:this.unitCode})}else{this.router.navTo("NoData")}})},onListItemPress:function(e){var t=e.getParameter("listItem").getProperty("title");var s=t.replace(/\//g,"-");this.router.navTo("SADetail",{Schedule_No:s,UnitCode:this.unitCode})},onSearch:function(e){if(e.getParameter("refreshButtonPressed")===true){this.getView().byId("masterListId").getBinding("items").refresh(true)}else{var t=e.getParameter("query");var s=t?{custom:{search:t}}:"";sap.ui.core.BusyIndicator.show();this.byId("masterListId").bindAggregation("items",{path:"/SchedulingAgreements?search="+t,parameters:{custom:{AddressCode:this.AddressCodeSA,unitCode:this.unitCode}},template:this.listTemp});sap.ui.core.BusyIndicator.hide()}this.routeToDetail()},onPlantValueHelp:function(){if(!this.PlantF4Frag){this.PlantF4Frag=sap.ui.xmlfragment("sap.fiori.schedulingagreement.fragment.PlantFrag",this);this.PlantF4Temp=sap.ui.getCore().byId("plantTempId").clone()}this.PlantF4Frag.setModel(new t(JSON.parse(sessionStorage.getItem("CodeDetails"))),"plantModel");this.getView().addDependent(this.PlantF4Frag);sap.ui.getCore().byId("plantF4Id")._searchField.setVisible(false);this.PlantF4Frag.open()},handlePlantClose:function(e){this.unitCodeFilter=e.getParameter("selectedItem").getProperty("title");this.desc=e.getParameter("selectedItem").getProperty("description");this.PlantF4Frag.destroy();this.PlantF4Frag="";this.getData()},handlePlantCancel:function(){this.PlantF4Frag.destroy();this.PlantF4Frag=""},getData:function(){this.getView().byId("clearFilterId").setVisible(true);this.PlantFilter=this.unitCodeFilter+"("+this.desc+")";this.getView().byId("plantFilterId").setText(this.PlantFilter);this.AddressCodeSA=sessionStorage.getItem("AddressCodeSA")||"JSE-01-01";sap.ui.core.BusyIndicator.show();this.byId("masterListId").bindAggregation("items",{path:"/SchedulingAgreements",parameters:{custom:{AddressCode:this.AddressCodeSA,UnitCode:this.unitCodeFilter},countMode:"None"},template:this.listTemp});sap.ui.core.BusyIndicator.hide();this.routeToDetail()},onFilterClear:function(){this.getView().byId("clearFilterId").setVisible(false);this.getView().byId("plantFilterId").setText("");var e=sessionStorage.getItem("unitCode")||"P01";this.AddressCodeSA=sessionStorage.getItem("AddressCodeSA")||"JSE-01-01";sap.ui.core.BusyIndicator.show();this.byId("masterListId").bindAggregation("items",{path:"/SchedulingAgreements",parameters:{custom:{AddressCode:this.AddressCodeSA,UnitCode:e},countMode:"None"},template:this.listTemp});sap.ui.core.BusyIndicator.hide();this.routeToDetail()}})});