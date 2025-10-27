sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"groupheader1": {
						"label": "General Settings",
						"type": "group"
					},
					"separator1": {
						"type": "separator"
					},

					"title": {
						"manifestpath": "/sap.card/configuration/parameters/title/value",
						"type": "string",
						"translatable": true,
						"label": "Card Title",
						"cols": 1,
						"allowDynamicValues": true
					},
					"headericon": {
						"manifestpath": "/sap.card/configuration/parameters/headericon/value",
						"type": "string",
						"label": "Card Icon",
						"cols": 1,
						"allowDynamicValues": false,
						"allowSettings": false
					},
					"counterUrl": {
						"manifestpath": "/sap.card/configuration/parameters/counterUrl/value",
						"type": "string",
						"translatable": false,
						"label": "Counter URL",
						"cols": 1,
						"allowDynamicValues": true
					},
					"counterInterval": {
						"manifestpath": "/sap.card/configuration/parameters/counterInterval/value",
						"type": "string",
						"translatable": false,
						"label": "Counter Interval(Seconds)",
						"cols": 1,
						"allowDynamicValues": true
					},
					"targetUrl": {
						"manifestpath": "/sap.card/configuration/parameters/targetUrl/value",
						"type": "string",
						"translatable": false,
						"label": "Target URL(absolute or relative)",
						"cols": 1,
						"allowDynamicValues": true
					},
					"color": {
						"manifestpath": "/sap.card/configuration/parameters/color/value",
						"type": "string",
						"translatable": false,
						"label": "Text Color:Error , Critical ,Good ,Neutral",
						"cols": 1,
						"allowDynamicValues": true
					},
					"backend": {
						"manifestpath": "/sap.card/configuration/parameters/backend/value",
						"type": "string",
						"label": "Backend Destination",
						"cols": 1,
						"allowDynamicValues": false,
						"values": {
							// Στατικό dataset
							"data": {
								"json": [
									{ "key": "visionSystem", "title": "Vision DEV (vision_system)" },
									{ "key": "visionSystem2", "title": "Vision QA  (vision_system_qa)" },
									{ "key": "visionSystem3", "title": "QA Principal  (VSQ_principal_propagation)" },
									{ "key": "successfactors", "title": "SuccessFactors_API" },
									{ "key": "concur", "title": "Concur_API" },
									{ "key": "free", "title": "free call - No destination" }
								]
							},
							// ΠΩΣ να χαρτογραφήσει κάθε item -> dropdown option
							"item": {
								"key": "{key}",
								"text": "{title}"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "None"
			}
		});
	};
});
