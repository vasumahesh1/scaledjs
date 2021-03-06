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
 * Establish the root object, `window` (`self`) in the browser, `module` for CommonJS,
 * and `define` for AMD.
 */
(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define(["scaled-gen"], factory);
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.ScaledGen = factory();
	}

}(this, function () {

	/**
	 * Main Function for the Generator Object
	 * @param {object}	settingsData	Configuring Settings of the Generator
	 */
	var ScaledGen = function (settingsData) {
		var maxTries = 10;
		var mainMap = new Scaled.ScaledMap();
		var scaledTmx = null;
		var domSettings = null;
		var tilesetSettings = null;

		if (settingsData) {

			Scaled.Commons.debug = settingsData["debug"] ? true : false;
			Scaled.Commons.allowedLogs = settingsData["logs"] ? settingsData["logs"] : [];
			Scaled.Commons.showProgressUpdate = settingsData["onProgressUpdate"] ? settingsData["onProgressUpdate"] : function () {};
			maxTries = settingsData["maxTries"] ? settingsData["maxTries"] : 10;
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

		/**
		 * Sets the Tile Data of a Particular Layer
		 * @param {object} tileData Object containing the Layer Key & associated Tile data
		 */
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
				Scaled.Commons.error("Unable to Validate Map. Perhaps Conditions set are too Strict.");
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
				scaledTmx = new Scaled.ScaledTmxGen(scaledTmxSettings);
				scaledTmx.generateMapTmx();
			} else {
				Scaled.Commons.warn("No Domination Settings / TileSet Settings provided skipping TMX Generation");
			}
		};

		/**
		 * Gets the XML of the TMX Map Generated
		 * @return {string} XML String
		 */
		this.getTmxXml = function () {
			return scaledTmx.getTmxXml();
		};

		/**
		 * Gets the 3D Layered Map in between the TMX XML and the 2D Matrix
		 * @return {object} 3D Layered Object
		 */
		this.getLayeredMap = function () {
			return scaledTmx.getLayeredMap();
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
		 * Gets the percentages of all the Regular Terrains in the Map
		 * @return {object} Indexed {terrainKey, percentage}
		 */
		this.getRegularTerrainPercentages = function () {
			return mainMap.getRegularTerrainPercentages();
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
			Scaled.Commons.log("Terrains For Cell Value : " + cellValue, responsibleTerrains, Scaled.Commons.validLogKeys.mapRenderLogKey);
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
	};

	return ScaledGen;

}));