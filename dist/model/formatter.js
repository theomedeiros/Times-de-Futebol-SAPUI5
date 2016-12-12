sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		
		// Função para contar idade
		contaIdade: function(sDate) {
			var anos = 0,
				diaMaior = false,
				mesMaior = false,
				mesIgual = false;
				
			var currentDate = new Date();
			
			anos = ( currentDate.getFullYear() - sDate.getFullYear() );
			
			// Valida possível não passagem do aniversário
			if(sDate.getMonth() > currentDate.getMonth()){
				mesMaior = true;
			} else if(sDate.getMonth() === currentDate.getMonth()){
				mesIgual = true;
			}
			
			if(sDate.getDate() > currentDate.getDate()){
				diaMaior = true;
			}
			
			if(mesMaior) {
				anos -= 1;
			} else if (mesIgual && !diaMaior) {
				anos -= 1;
			}
			
			return anos;
		}
	};

});