/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/routing/HashChanger",
    "sap/fiori/schedulingagreement/model/models",
    "sap/fiori/schedulingagreement/controller/formatter",
],
    function (UIComponent, MessageBox, ODataModel, HashChanger, models) {
        "use strict";

        return UIComponent.extend("sap.fiori.schedulingagreement.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
                var slash = window.location.href.includes("site") ? "/" : "";
                var modulePath = jQuery.sap.getModulePath("sap/fiori/schedulingagreement");
                modulePath = modulePath === "." ? "" : modulePath;
                var serviceUrl = modulePath + slash + this.getMetadata().getManifestEntry("sap.app").dataSources.mainService.uri;
                var oDataModel = new ODataModel(serviceUrl, true);

                // metadata failed
                oDataModel.attachMetadataFailed(err => {
                    var response = err.getParameter("response").body;
                    if (response.indexOf("<?xml") !== -1) {
                        MessageBox.error($($.parseXML(response)).find("message").text());
                    } else {
                        MessageBox.error(response);
                    }
                });

                oDataModel.attachMetadataLoaded(() => {
                    this.setModel(oDataModel);
                    sap.ui.getCore().setModel(oDataModel, "oDataModel");
                    oDataModel.setDefaultCountMode("None");

                    var pItemModel = new sap.ui.model.json.JSONModel();
                    sap.ui.getCore().setModel(pItemModel, "pItemModel");

                    // set the device model
                    this.setModel(models.createDeviceModel(), "device");
                });

                // odata request failed
                oDataModel.attachRequestFailed(err => {
                    var responseText = err.getParameter("responseText");
                    if (responseText.indexOf("<?xml") !== -1) {
                        MessageBox.error($($.parseXML(responseText)).find("message").text());
                    } else {
                        MessageBox.error(JSON.parse(responseText).error.message.value);
                    }
                });
                // enable routing
                HashChanger.getInstance().replaceHash("");
                this.getRouter().initialize();
            }
        });
    }
);