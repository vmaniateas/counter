sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/IntervalTrigger"
], function (Controller, JSONModel, IntervalTrigger) {
	"use strict";

	return Controller.extend("helleniq.workzone.counter.Main", {

		onInit: async function (oEvent) {

			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.oCard,
				oParams = oCard.getCombinedParameters();

			const oHost = oCard?.getHostInstance();

			let oUser = null;

			oUser = await oHost.getContextValue("sap.workzone/currentUser");
			// for BAS Preview
			if (oUser === null) {
				oUser = {
					"id": {
						"value": "Qy4qQEGoFEV1DM4BSVo0Ki"
					},
					"name": {
						"value": "VASILEIOS MANIATEAS"
					},
					"firstName": {
						"value": "VASILEIOS"
					},
					"lastName": {
						"value": "MANIATEAS"
					},
					"email": {
						"value": "vasileios.maniateas@sap.com"
					},
					"global_uuid": {
						"value": "880875"
					},
					"user_type": {
						"value": "employee"
					}
				};
			}

			this._user = oUser;
			this._oParams = oParams;

			this._mMainModel = new JSONModel({
				busy: true,
				buttonText: oParams.title,
				badgeCount: '',
				icon: oParams.headericon,
				color: oParams.color
			});

			this.setModel(this._mMainModel, "mainView");
			this._initialiseMain(this._oParams);	//αρχικό count

			this._oTrigger = new IntervalTrigger(oParams.counterInterval * 1000);	// ← κάθε x secs
			this._oTrigger.addListener(function () {
				this._mMainModel.setProperty("/busy", true);

				this._initialiseMain(this._oParams);
			}, this);

		},

		onExit: function () {
			if (this._oTrigger) {
				this._oTrigger.destroy();	// ← καθάρισμα timer
				this._oTrigger = null;
			}
		},

		_initialiseMain: async function () {
			return this._getCount().then(function (oData) {

				var items = [],
					count = 0;

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

		_buildRequestUrl: function () {
			var sBackend = this._oParams.backend,			// π.χ. "visionSystem" | "visionSystem2" | "successfactors" | "concur" | "free"
				sPath = this._oParams.counterUrl || "";    // ό,τι δήλωσε ο admin

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

		_getCount: function () {
			//ToDo if this._oParams.app = 'concur_tr' or 'concur_er'
			//thelei 2 klhseis mia gia na pareis to userid
			//kai mia gia na pareis ta data me to concuruserid

			//console.log(this._oParams);
			//console.log(this._user);
			var sUrl = this._buildRequestUrl();

			return this.getOwnerComponent().oCard.request({
				url: sUrl,
				withCredentials: true
			})
		},

		handleSeeDetails: function () {
			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.oCard,
				oParams = oCard.getCombinedParameters();

			/* oCard.triggerAction({
				type: "Navigation",
				parameters: {
					"url": oParams.targetUrl,
					"target": "_parent"
				}
			}); */

			if (oParams.targetUrl[0] === "#") {
				var oElement = document.getElementById(oParams.targetUrl.slice(1));

				if (!!oElement) {
					oElement.scrollIntoView({ behavior: "smooth", block: "start" });
				}

			} else {
				oCard.triggerAction({
					type: "Navigation",
					parameters: {
						"url": oParams.targetUrl,
						"target": "_parent"
					}
				});
			}

		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

	});
});