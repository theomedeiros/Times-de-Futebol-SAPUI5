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
			
			var that = this;


			var sUrl = jQuery.sap.getModulePath("com.projetos.times") + "/parent";
			
			// Carrega a segunda aplicação
			sap.ui.component.load({
				name: "com.projetos.transacoes",
				// Use the below URL to run the extended application when SAP-delivered application is deployed on cloud
				url: sUrl
					// we use a URL relative to our own component
					// extension application is deployed with customer namespace
			});
			
			//Setta a segunda aplicação carregada para o component Container dentro da tela
			/* @type sap.ui.core.ComponentContainer */
			var oComponent = this.byId("componentContainer");
			oComponent.setName("com.projetos.transacoes");
			oComponent.setUrl(sUrl);

		}

	});

});