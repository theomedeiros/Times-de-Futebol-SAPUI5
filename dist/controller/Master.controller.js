/*global history */
sap.ui.define([
	"com/projetos/times/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"com/projetos/times/model/formatter",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, MessageBox) {
	"use strict";

	return BaseController.extend("com.projetos.times.controller.Master", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit: function() {
				// Control state model
				var oList = this.byId("list"),
					//Instancia um modelo JSON com propriedades necessárias para a visão Master
					oViewModel = this._createViewModel(),
					// Put down master list's original value for busy indicator delay,
					// so it can be restored later on. Busy handling on the master list is
					// taken care of by the master list itself.
					iOriginalBusyDelay = oList.getBusyIndicatorDelay();

				this._oList = oList;
				// keeps the filter and search state
				this._oListFilterState = {
					aFilter: [],
					aSearch: []
				};

				this.setModel(oViewModel, "masterView");
				oList.attachEventOnce("updateFinished", function() {
					// Restore original busy indicator delay for the list
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				});
				
				// Anexa os métodos que serão executados no hit do Router
				this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
				this.getRouter().attachBypassed(this.onBypassed, this);
				// Instância do modelo
				this._oODataModel = this.getOwnerComponent().getModel();
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			// Evento executado ao final do carregamento da lista
			onUpdateFinished: function(oEvent) {
				// Atualiza o contador da lista com o valor encontrado sem necessidade de chamada $count
				this._updateListItemCount(oEvent.getParameter("total"));
				// hide pull to refresh if necessary
				this.byId("pullToRefresh").hide();
				this.getModel("appView").setProperty("/addEnabled", true);
			},

			// Evento de busca na lista
			onSearch: function(oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					this.onRefresh();
					return;
				}

				var sQuery = oEvent.getParameter("query");

				if (sQuery) {
					this._oListFilterState.aSearch = [new Filter("Nome", FilterOperator.Contains, sQuery)];
				} else {
					this._oListFilterState.aSearch = [];
				}
				this._applyFilterSearch();

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh: function() {
				this._oList.getBinding("items").refresh();
			},
			
			// Evento de execução ao clicar em um item da lista
			onSelectionChange: function(oEvent) {
				var that = this;
				var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
				var fnLeave = function() {
					that._oODataModel.resetChanges();
					that._showDetail(oItem);
				};
				if (this._oODataModel.hasPendingChanges()) {
					this._leaveEditPage(fnLeave);
				} else {
					this._showDetail(oItem);
				}
				that.getModel("appView").setProperty("/addEnabled", true);
			},
			
			// Caso nenhuma rota seja atingida pelo Router a Lista remove os itens selecionados
			onBypassed: function() {
				this._oList.removeSelections(true);
			},

			/**
			 * Used to create GroupHeaders with non-capitalized caption.
			 * These headers are inserted into the master list to
			 * group the master list's items.
			 * @param {Object} oGroup group whose text is to be displayed
			 * @public
			 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
			 */
			createGroupHeader: function(oGroup) {
				return new GroupHeaderListItem({
					title: oGroup.text,
					upperCase: false
				});
			},

			// Função de navegação para página anterior
			onNavBack: function() {
				
				BaseController.onNavBack();
				// var oHistory = sap.ui.core.routing.History.getInstance(),
				// 	sPreviousHash = oHistory.getPreviousHash(),
				// 	oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

				// if (sPreviousHash !== undefined) {
				// 	// The history contains a previous entry
				// 	history.go(-1);
				// } else {
				// 	// Navigate back to FLP home
				// 	oCrossAppNavigator.toExternal({
				// 		target: {
				// 			shellHash: "#Shell-home"
				// 		}
				// 	});
				// }
			},
			
			// Evento para criação de item novo na lista
			onAdd: function() {
				this.getModel("appView").setProperty("/addEnabled", false);
				this.getRouter().getTargets().display("create");

			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Creates the model for the view
			 * @private
			 */
			_createViewModel: function() {
				return new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "Nome",
					groupBy: "None"
				});
			},

			/**
			 * Ask for user confirmation to leave the edit page and discard all changes
			 * @param {object} fnLeave - handles discard changes
			 * @param {object} fnLeaveCancelled - handles cancel
			 * @private
			 */
			_leaveEditPage: function(fnLeave, fnLeaveCancelled) {
				var sQuestion = this.getResourceBundle().getText("warningConfirm");
				var sTitle = this.getResourceBundle().getText("warning");

				MessageBox.show(sQuestion, {
					icon: MessageBox.Icon.WARNING,
					title: sTitle,
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if (oAction === MessageBox.Action.OK) {
							fnLeave();
						} else if (fnLeaveCancelled) {
							fnLeaveCancelled();
						}
					}
				});
			},

			/**
			 * If the master route was hit (empty hash) we have to set
			 * the hash to to the first item in the list as soon as the
			 * listLoading is done and the first item in the list is known
			 * @private
			 */
			_onMasterMatched: function() {
				this.getModel("appView").setProperty("/addEnabled", true);
				this.getRouter().navTo("object", {
					Id: encodeURIComponent("1")
				}, true);
		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function(oItem) {
			var bReplace = !Device.system.phone;
			this.getRouter().navTo("object", {
				Id: encodeURIComponent(oItem.getBindingContext().getProperty("Id"))
			}, bReplace);
		},

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount: function(iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oList.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				this.getModel("masterView").setProperty("/title", sTitle);
			}
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch: function() {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				oViewModel = this.getModel("masterView");
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else if (this._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			}
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar: function(sFilterBarText) {
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
		},

		/**
		 * Internal helper method that adds "/" to the item's path 
		 * @private
		 */
		_fnGetPathWithSlash: function(sPath) {
			return (sPath.indexOf("/") === 0 ? "" : "/") + sPath;
		}

	});
});