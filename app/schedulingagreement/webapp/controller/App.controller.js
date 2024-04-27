sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/HashChanger"
  ],
  function (Controller, HashChanger) {
    "use strict";

    return Controller.extend("sap.fiori.schedulingagreement.controller.App", {

      doRoute: function () {
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({}), "filterModel");
        this.router = sap.ui.core.UIComponent.getRouterFor(this);
        this.Component = this.getOwnerComponent().getComponentData();
        HashChanger.getInstance().replaceHash("");
        this.router.initialize();

      },
      onInit: function () {
        var site = window.location.href.includes("site");
        if (site) {
          var slash = site ? "/" : "";
          var modulePath = jQuery.sap.getModulePath("sap/fiori/schedulingagreement");
          modulePath = modulePath === "." ? "" : modulePath;
          $.ajax({
            url: modulePath + slash + "user-api/attributes",
            type: "GET",
            success: res => {
             if(!sessionStorage.getItem('AddressCodeSA')){
              if (res.email === 'manishgupta8@kpmg.com' || res.email === 'swetamohanty1@kpmg.com' || res.email === 'mohsinahmad@kpmg.com' || res.email === 'rishabhyadav3@kpmg.com' || res.email === 'vikrantnanda@kpmg.com') {
                sessionStorage.setItem('AddressCodeSA', 'JSE-01-01');
              } else {
                sessionStorage.setItem('AddressCodeSA', res.login_name[0]);
              }
            }
              this.setHeaders(res.login_name[0], res.type[0].substring(0, 1).toUpperCase());
            }
          });
        }
        else {
          this.setHeaders("RA046 ", "E");
        }
      },
      setHeaders: function (loginId, loginType) {
        this.getView().getModel().setHeaders({
          "loginId": loginId,
          "loginType": loginType
        });

        // enable routing
        this.doRoute();
      },
    });
  }
);
