// The MIT License (MIT)

// Copyright (c) 2015 Vasu Mahesh (vasu.mahesh@[gmail|yahoo|hotmail].com)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// 
// 

/*
 * Establish the root object, `window` (`self`) in the browser, `global`
 * on the server, or `this` in some virtual machines. We use `self`
 * instead of `window` for `WebWorker` support.
 */
var root = typeof self === 'object' && self.self === self && self || typeof global === 'object' && global.global === global && global || this;


/**
 * Main Function for the Generator Object
 * @param {object}	settingsData	Configuring Settings of the Generator
 */
function ScaledGen(settingsData) {
	var maxTries = 10;
	var mainMap = new ScaledMap();
	var scaledTmx = null;
	var domSettings = null;
	var tilesetSettings = null;

	if (settingsData) {
		if (("debug" in settingsData) && settingsData["debug"] === true) {
			Commons.debug = true;
		}

		if (("logs" in settingsData)) {
			Commons.allowedLogs = settingsData["logs"];
		}

		if (("maxTries" in settingsData)) {
			maxTries = settingsData["maxTries"];
		}

		if (("onProgressUpdate" in settingsData)) {
			Commons.showProgressUpdate = settingsData["onProgressUpdate"];
		}

	}

	/**
	 * Gets the Map Values (2D Array) for the User
	 */
	this.getMapValues = function () {
		return mainMap.getMapValues();
	};


	/**
	 * Sets the Map Size
	 * @param {integer}	rowSize Size of the Row
	 * @param {integer} columnSize Size of the Column
	 */
	this.setMapSize = function (rowSize, columnSize) {
		mainMap.setDimensions(rowSize, columnSize);
	};

	/**
	 * Adds a Scaled Terrain Object to a Map Instance
	 * @param {object}	terrainData	Object containing information about the terrain
	 */
	this.addTerrain = function (terrainData) {
		mainMap.addTerrain(terrainData);
	};

	/**
	 * Assigns Starting Condition to a Particular Layer
	 * @param {object}	conditionData Object containing information about the starting condition
	 */
	this.addStartingCondition = function (conditionData) {
		mainMap.addStartingCondition(conditionData);
	};

	/**
	 * Assigns a Validation Rule to a Particular Layer
	 * @param {object}	ruleData Object containing information about the rule
	 */
	this.addValidationRule = function (ruleData) {
		mainMap.addValidationRule(ruleData);
	};


	/**
	 * Assigns a Validation Rule to a Particular Layer
	 * @param {object}	dominationData Object containing information about the rule
	 */
	this.addLayerDomination = function (dominationData) {
		domSettings = dominationData;
	};


	/**
	 * Adds TileSet Settings to be Used in TMX XML
	 * @param {object}	tilesetData Object containing information about the rule
	 */
	this.addTileset = function (tilesetData) {
		tilesetSettings = tilesetData;
	};


	this.setTileInfo = function (tileData) {
		mainMap.setTileInfo(tileData);
	};



	/**
	 * Main Function to start the Map Generation Process
	 * Process goes on until a valid map has been generated or the max tries have finished
	 */
	this.generateMapValues = function () {
		var validStatus = false;
		var tries = 0;
		do {
			mainMap.generateMapValues();
			validStatus = mainMap.checkRegularTerrainValidity();
			tries++;
		} while (validStatus === false && tries < maxTries);

		if (validStatus === false) {
			Commons.error("Unable to Validate Map. Perhaps Conditions set are too Strict.");
		}
	};

	/**
	 * Generates the Entire Map from
	 * From 2D Array to 3D Layered Maps to TMX Tiled XML
	 */
	this.generateMap = function () {
		this.generateMapValues();
		if (domSettings && tilesetSettings) {
			var scaledTmxSettings = mainMap.getTmxSettings();
			scaledTmxSettings.domSettings = domSettings;
			scaledTmxSettings.tilesetSettings = tilesetSettings;
			scaledTmx = new ScaledTmxGen(scaledTmxSettings);
			scaledTmx.generateMapTmx();
		} else {
			Commons.warn("No Domination Settings / TileSet Settings provided skipping TMX Generation");
		}
	};

	this.getTmxXml = function () {
		return scaledTmx.getTmxXml();
	};

	/**
	 * Generates an HTML Representation of the 2D Matrix generated by ScaledJS
	 */
	this.renderMapValues = function (identifier) {
		var map_element = document.getElementById(identifier);
		map_element.innerHTML = "";
		var mapValues = mainMap.getMapValues();
		var mapHtml = "";
		for (var rowKey in mapValues) {
			mapHtml += generateRow(mapValues[rowKey]);
		}
		map_element.innerHTML = mapHtml;
	};


	/**
	 * Generates an HTML Row for the Map
	 * @param {Array} rowValues	Contains an Array of Values
	 */
	var generateRow = function (rowValues) {
		var rowHtml = "<div class='row'>";
		for (var columnKey in rowValues) {
			rowHtml += generateCell(rowValues[columnKey]);
		}
		rowHtml += "</div>";
		return rowHtml;
	};


	/**
	 * Generates an HTML Cell for the Map
	 * @param {integer} cellValue Cell Value
	 */
	var generateCell = function (cellValue) {
		var responsibleTerrains = mainMap.getLayersFromValue(cellValue);
		Commons.log("Terrains For Cell Value : " + cellValue, responsibleTerrains, Commons.validLogKeys.mapRenderLogKey);
		var terrainKey = "no-cell";
		for (var key in responsibleTerrains) {
			if (responsibleTerrains[key].isRegularTerrain() === true) {
				terrainKey = responsibleTerrains[key].getData().terrainKey;
				break;
			}
		}

		var html = "";
		html += "<div class='cell " + terrainKey + " ";
		html += "data-value='" + cellValue + "' ";
		html += "'>";
		html += "</div>";
		return html;
	};

}

/*
 * Export the ScaledGen object for **Node.js**, with
 * backwards-compatibility for their old module API. If we're in
 * the browser, add `ScaledGen` as a global object.
 */
if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = ScaledGen;
	}
	exports.ScaledGen = ScaledGen;
} else {
	root.ScaledGen = ScaledGen;
}