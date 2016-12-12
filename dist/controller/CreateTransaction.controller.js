sap.ui.define([
	"com/projetos/times/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"

], function(BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("com.projetos.times.controller.CreateTransaction", {

		onInit: function(oEvent) {
			
			// Anexa os métodos que serão executados no hit do Router
			this.getRouter().getRoute("createTransaction").attachPatternMatched(this._onObjectMatched, this);
			// Instância do modelo
			this._oODataModel = this.getModel();
			this._oResourceBundle = this.getResourceBundle();
			
			
		},
		
		_onObjectMatched: function(oEvent) {
			
			sap.ui.component.load({
				name: "com.projetos.transacoes",
				// Use the below URL to run the extended application when SAP-delivered application is deployed on cloud
				url: jQuery.sap.getModulePath("com.projetos.times") + "/parent"
					// we use a URL relative to our own component
					// extension application is deployed with customer namespace
			});
			
			/* @type sap.ui.core.ComponentContainer */
			var oComponent = this.byId("componentContainer");
			
			oComponent.setUrl("com.projetos.transacoes");
			
		}
	});

});