sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/IntervalTrigger"
], function (Controller, JSONModel, IntervalTrigger) {
	"use strict";

	return Controller.extend("helleniq.workzone.counter.Main", {

		onInit: function (oEvent) {

			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.oCard,
				oParams = oCard.getCombinedParameters();

			this._oParams = oParams;

			this._mMainModel = new JSONModel({
				busy: true,
				buttonText: oParams.title,
				badgeCount: '',
				icon: oParams.headericon,
				color: oParams.color
			});

			this.setModel(this._mMainModel, "mainView");
			this._initialiseMain(this._oParams);//αρχικό count


			this._oTrigger = new IntervalTrigger(oParams.counterInterval * 1000); // ← κάθε x secs
			this._oTrigger.addListener(function () {
				this._mMainModel.setProperty("/busy", true);


				this._initialiseMain(this._oParams);
			}, this);

		},
		onExit: function () {
			if (this._oTrigger) {
				this._oTrigger.destroy();             // ← καθάρισμα timer
				this._oTrigger = null;
			}
		},

		_initialiseMain: async function (oParams) {
			var sUrl = this._buildRequestUrl(oParams);
			return this.getOwnerComponent().oCard.request({
				url: sUrl,
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

			}.bind(this)).catch(function (oError) {
				console.log(JSON.stringify(oError));
			}.bind(this));
		},
		_buildRequestUrl: function (oParams) {
			var sBackend = oParams.backend;          // π.χ. "visionSystem" | "visionSystem2" | "successfactors" | "concur" | "free"
			var sPath = oParams.counterUrl || "";    // ό,τι δήλωσε ο admin

			if (sBackend === "free") {
				// Καμία επεξεργασία — ο Admin δίνει full URL
				return sPath;
			}

			// prefix από το selected destination
			var sPrefix = "{{destinations." + sBackend + "}}";
			// εγγυόμαστε ένα μόνο "/" ανάμεσα σε prefix και path
			if (sPath && sPath.charAt(0) !== "/") {
				sPath = "/" + sPath;
			}
			return sPrefix + sPath;
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