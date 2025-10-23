sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("helleniq.workzone.counter.Main", {

		onInit: function (oEvent) {

			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.oCard,
				oParams = oCard.getCombinedParameters();

			this._mMainModel = new JSONModel({
				busy: true,
				buttonText: oParams.title,
				badgeCount: '',
				icon: oParams.headericon,
				color: oParams.color
			});

			this.setModel(this._mMainModel, "mainView");

			// Data model (table rows)
			this._mODataModel = new JSONModel([]);
			this.setModel(this._mODataModel);

			this._initialiseMain(oParams);

		},


		_initialiseMain: async function (oParams) {

			this._mODataModel.setData([]);

 


			return this.getOwnerComponent().oCard.request({
				url: "{{destinations.visionSystem}}/" + oParams.counterUrl,
				withCredentials: true
			}).then(function (oData) {

			 

				var items = [];
				var count = 0;

				// --- OData v2 ---
				if (oData && oData.d && Array.isArray(oData.d.results)) {
					items = oData.d.results;

					// Αν υπάρχουν αντικείμενα με property "number"
					if (items.length > 0) {
						// Αν είναι πίνακας με αριθμούς, π.χ. [{number:7},{number:5}]
						if (items.every(it => typeof it.number === "number")) {
							count = items.reduce((sum, it) => sum + it.number, 0);
						}
						// Αν έχει μόνο το πρώτο "number"
						else if (typeof items[0].number === "number") {
							count = items[0].number;
						}
						// Αλλιώς μετράμε γραμμές
						else {
							count = items.length;
						}
					}
				}

				// --- OData v4 ή plain array ---
				else if (Array.isArray(oData.value)) {
					items = oData.value;
					count = items.length;
				}
				else if (Array.isArray(oData)) {
					items = oData;
					count = items.length;
				}

				// --- Απλός αριθμός ή string-αριθμός ---
				else if (typeof oData === "number") {
					count = oData;
				}
				else if (typeof oData === "string" && /^\d+$/.test(oData)) {
					count = Number(oData);
				}

				// --- Εναλλακτικά πεδία count ---
				else if (oData && typeof oData.count === "number") {
					count = oData.count;
				}
				else if (oData && typeof oData.Count === "number") {
					count = oData.Count;
				}

				// --- Διαχείριση άγνωστης περίπτωσης ---
				else {
					console.warn("⚠️ Unexpected oData format:", oData);
				}
                this._mMainModel.setProperty("/busy", false);
				this._mMainModel.setProperty("/badgeCount", count);
				this._mODataModel.setData(a);
			}.bind(this)).catch(function (oError) {
				console.log(JSON.stringify(oError));

			}.bind(this));
		},



		handleSeeDetails: function () {
			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.oCard,
				oParams = oCard.getCombinedParameters();


			oCard.triggerAction({
				type: "Navigation",
				parameters: {
					"url": oParams.targetUrl,
					"target": "_parent"
				}
			});
		},
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

	});
});