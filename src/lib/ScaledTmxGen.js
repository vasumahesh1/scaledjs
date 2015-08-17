var ScaledTmxGen = function (settingsData) {

	var BLANK_GID_VALUE = 1;
	var templateString = "";

	var terrains = [];
	var mapValues = [];
	var mapValuesDecoration = [];
	var mapValuesTmx = [];
	var tilesetObject = null;
	var edgeHandler = null;
	var edgeHandlerSettings = null;
	var dominationObject = null;

	if (settingsData) {

		mapValues = settingsData["mapValues"] ? settingsData["mapValues"] : [];
		terrains = settingsData["terrains"] ? settingsData["terrains"] : [];
		tilesetObject = settingsData["tilesetSettings"] ? settingsData["tilesetSettings"] : null;
		dominationObject = settingsData["domSettings"] ? settingsData["domSettings"] : null;
		mapValuesDecoration = settingsData["mapValuesDecoration"] ? settingsData["mapValuesDecoration"] : [];

		// if (("mapValues" in settingsData) && settingsData["mapValues"]) {
		// 	mapValues = settingsData["mapValues"];
		// }

		// if (("terrains" in settingsData) && settingsData["terrains"]) {
		// 	terrains = settingsData["terrains"];
		// }

		// if (("tilesetSettings" in settingsData) && settingsData["tilesetSettings"]) {
		// 	tilesetObject = settingsData["tilesetSettings"];
		// }

		// if (("domSettings" in settingsData) && settingsData["domSettings"]) {
		// 	dominationObject = settingsData["domSettings"];
		// }

	}

	edgeHandlerSettings = {
		terrains: terrains,
		domination: dominationObject
	};

	edgeHandler = new ScaledEdgeDetector(edgeHandlerSettings);


	var getAdjacentValues = function (posX, posY) {
		var points = [];
		posX = parseInt(posX);
		posY = parseInt(posY);
		points.push(Commons.tryGetArrayValue(mapValues, posX - 1, posY));
		points.push(Commons.tryGetArrayValue(mapValues, posX, posY + 1));
		points.push(Commons.tryGetArrayValue(mapValues, posX + 1, posY));
		points.push(Commons.tryGetArrayValue(mapValues, posX, posY - 1));
		return points;
	};

	var getDiagonalValues = function (posX, posY) {
		var points = [];
		posX = parseInt(posX);
		posY = parseInt(posY);
		points.push(Commons.tryGetArrayValue(mapValues, posX - 1, posY - 1));
		points.push(Commons.tryGetArrayValue(mapValues, posX - 1, posY + 1));
		points.push(Commons.tryGetArrayValue(mapValues, posX + 1, posY + 1));
		points.push(Commons.tryGetArrayValue(mapValues, posX + 1, posY - 1));

		return points;
	};

	var createEmptyLayer = function () {
		var tempMap = [];
		for (var rowKey in mapValues) {
			var tempRow = [];
			for (var columnKey in mapValues[rowKey]) {
				tempRow.push(BLANK_GID_VALUE);
			}
			tempMap.push(tempRow);
		}

		mapValuesTmx.push(tempMap);
	};


	var initLayeredMap = function () {
		var defautGidValue = Commons.getDefaultTerrain(terrains).getTileData("other-tiles", "all", "fullValue");
		var tempMap = [];
		for (var rowKey in mapValues) {
			var tempRow = [];
			for (var columnKey in mapValues[rowKey]) {
				tempRow.push(defautGidValue);
			}

			tempMap.push(tempRow);
		}

		mapValuesTmx.push(tempMap);
	};

	var valueExists = function (value, posX, posY) {
		for (var layerKey in mapValuesTmx) {
			if (mapValuesTmx[layerKey][posX][posY] == value) {
				return true;
			}
		}

		return false;
	};

	var getLayerLevelForInsert = function (posX, posY) {
		for (var layerKey in mapValuesTmx) {
			if (mapValuesTmx[layerKey][posX][posY] === BLANK_GID_VALUE) {
				return layerKey;
			}
		}

		return -1;
	};


	var insertTilesIntoMap = function (tileValues, posX, posY) {
		if (mapValuesTmx.length === 1) {
			createEmptyLayer();
		}
		posX = parseInt(posX);
		posY = parseInt(posY);

		for (var key in tileValues) {
			var currentValue = tileValues[key];
			if (valueExists(currentValue, posX, posY) === false) {
				var layerLevel = getLayerLevelForInsert(posX, posY);
				if (layerLevel !== -1) {
					mapValuesTmx[layerLevel][posX][posY] = currentValue;
				} else {
					var nextLevel = mapValuesTmx.length;
					createEmptyLayer();
					mapValuesTmx[nextLevel][posX][posY] = currentValue;
				}
			}
		}

	};


	var startNewLayer = function (layerIndex) {
		templateString += '<layer name="layer_' + layerIndex + '" width="' + mapValuesTmx[0].length + '" height="' + mapValuesTmx[0].length + '">';
		templateString += '<data>';
	};


	var endNewLayer = function () {
		templateString += '</data>';
		templateString += '</layer>';
	};

	var appendTileRow = function (gidValue) {
		templateString += "<tile gid=\"" + gidValue + "\" />";
	};

	var decorateMap = function () {
		for (var rowKey in mapValues) {
			for (var columnKey in mapValues[rowKey]) {
				
			}
		}
	};

	this.generateMapTmx = function () {
		Commons.info("TMX - Generating Layered Map");
		this.generateLayeredMap();
		Commons.info("TMX - Decorating Map");
		decorateMap();
		// Commons.warn("TMX - Fixing Layer Borders");
		// this.fixLayerBorders();
		Commons.info("TMX - Generating Map XML");
		this.generateMapXml();
	};

	this.getTmxXml = function () {
		return templateString;
	};


	this.generateLayeredMap = function () {
		initLayeredMap();
		for (var rowKey in mapValues) {
			for (var columnKey in mapValues[rowKey]) {
				Commons.log("Primary Pos", rowKey + ',' + columnKey, Commons.validLogKeys.tmxRenderLogKey);
				var adjacentInfo = getAdjacentValues(rowKey, columnKey);
				var diagonalInfo = getDiagonalValues(rowKey, columnKey);
				var tileValues = edgeHandler.resolveTileValue(mapValues[rowKey][columnKey], adjacentInfo, diagonalInfo);
				insertTilesIntoMap(tileValues, rowKey, columnKey);
			}
		}
	};

	this.fixLayerBorders = function () {
		for (var rowKey in mapValuesTmx[0]) {
			for (var columnKey in mapValuesTmx[0][rowKey]) {
				// Irrespective of Layers
				this.fixBorderAtCell(rowKey, columnKey);
			}
		}
	};

	this.fixBorderAtCell = function (posX, posY) {

	};


	this.generateMapXml = function () {

		templateString += '<?xml version="1.0" encoding="UTF-8"?>';
		templateString += '<map version="1.0" orientation="orthogonal" renderorder="left-up" width="' + mapValuesTmx[0].length + '" height="' + mapValuesTmx[0].length + '" tilewidth="' + tilesetObject.tileWidth + '" tileheight="' + tilesetObject.tileHeight + '" nextobjectid="1">';
		templateString += '<tileset firstgid="1" name="tileset" tilewidth="' + tilesetObject.tileWidth + '" tileheight="' + tilesetObject.tileHeight + '">';
		templateString += '<image source="' + tilesetObject.source + '" trans="ffffff" width="' + tilesetObject.width + '" height="' + tilesetObject.height + '"/>';
		templateString += '</tileset>';

		for (var layerKey in mapValuesTmx) {
			startNewLayer(layerKey);

			for (var rowKey in mapValuesTmx[layerKey]) {
				for (var columnKey in mapValuesTmx[layerKey][rowKey]) {
					appendTileRow(mapValuesTmx[layerKey][rowKey][columnKey]);
				}
			}
			endNewLayer();
		}
		templateString += '</map>';
	};



};