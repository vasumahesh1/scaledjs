var ScaledTmxGen = function (settingsData) {

	var BLANK_GID_VALUE = 1;
	var templateString = "";

	var terrains = [];
	var mapValues = [];
	var mapValuesTmx = [];
	var tilesetObject = null;
	var edgeHandler = null;
	var edgeHandlerSettings = null;
	var dominationObject = null;

	if (settingsData) {
		if (("mapValues" in settingsData) && settingsData["mapValues"]) {
			mapValues = settingsData["mapValues"];
		}

		if (("terrains" in settingsData) && settingsData["terrains"]) {
			terrains = settingsData["terrains"];
		}

		if (("tilesetSettings" in settingsData) && settingsData["tilesetSettings"]) {
			tilesetObject = settingsData["tilesetSettings"];
		}

		if (("domSettings" in settingsData) && settingsData["domSettings"]) {
			dominationObject = settingsData["domSettings"];
		}

	}

	edgeHandlerSettings = {
		terrains: terrains,
		domination: dominationObject
	};

	edgeHandler = new ScaledEdgeDetector(edgeHandlerSettings);


	var GetAdjacentValues = function (posX, posY) {
		var points = [];
		posX = parseInt(posX);
		posY = parseInt(posY);
		points.push(Commons.TryGetArrayValue(mapValues, posX - 1, posY));
		points.push(Commons.TryGetArrayValue(mapValues, posX, posY + 1));
		points.push(Commons.TryGetArrayValue(mapValues, posX + 1, posY));
		points.push(Commons.TryGetArrayValue(mapValues, posX, posY - 1));
		return points;
	};

	var GetDiagonalValues = function (posX, posY) {
		var points = [];
		posX = parseInt(posX);
		posY = parseInt(posY);
		points.push(Commons.TryGetArrayValue(mapValues, posX - 1, posY - 1));
		points.push(Commons.TryGetArrayValue(mapValues, posX - 1, posY + 1));
		points.push(Commons.TryGetArrayValue(mapValues, posX + 1, posY + 1));
		points.push(Commons.TryGetArrayValue(mapValues, posX + 1, posY - 1));

		return points;
	};

	var CreateEmptyLayer = function () {
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


	var InitLayeredMap = function () {
		var defautGidValue = Commons.GetDefaultTerrain(terrains).getGidInfo().other.full;
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

	var ValueExists = function (value, posX, posY) {
		for (var layerKey in mapValuesTmx) {
			if (mapValuesTmx[layerKey][posX][posY] == value) {
				return true;
			}
		}

		return false;
	};

	var GetLayerLevelForInsert = function (posX, posY) {
		for (var layerKey in mapValuesTmx) {
			if (mapValuesTmx[layerKey][posX][posY] === BLANK_GID_VALUE) {
				return layerKey;
			}
		}

		return -1;
	};


	var InsertTilesIntoMap = function (tileValues, posX, posY) {
		if (mapValuesTmx.length === 1) {
			CreateEmptyLayer();
		}
		posX = parseInt(posX);
		posY = parseInt(posY);

		for (var key in tileValues) {
			var currentValue = tileValues[key];
			if (ValueExists(currentValue, posX, posY) === false) {
				var layerLevel = GetLayerLevelForInsert(posX, posY);
				if (layerLevel !== -1) {
					mapValuesTmx[layerLevel][posX][posY] = currentValue;
				} else {
					var nextLevel = mapValuesTmx.length;
					CreateEmptyLayer();
					mapValuesTmx[nextLevel][posX][posY] = currentValue;
				}
			}
		}

	};


	var StartNewLayer = function (layerIndex) {
		templateString += '<layer name="layer_' + layerIndex + '" width="' + mapValuesTmx[0].length + '" height="' + mapValuesTmx[0].length + '">';
		templateString += '<data>';
	};


	var EndNewLayer = function () {
		templateString += '</data>';
		templateString += '</layer>';
	};

	var AppendTileRow = function (gidValue) {
		templateString += "<tile gid=\"" + gidValue + "\" />";
	};

	this.GenerateMapTmx = function () {
		Commons.Warn("TMX - Generating Layered Map");
		this.GenerateLayeredMap();
		Commons.Warn("TMX - Generating Map XML");
		this.GenerateMapXml();
	};

	this.GetTmxXml = function () {
		return templateString;
	};


	this.GenerateLayeredMap = function () {
		InitLayeredMap();
		for (var rowKey in mapValues) {
			for (var columnKey in mapValues[rowKey]) {
				Commons.Log("Primary Pos", rowKey + ',' + columnKey, Commons.validLogKeys.tmxRenderLogKey);
				var adjacentInfo = GetAdjacentValues(rowKey, columnKey);
				var diagonalInfo = GetDiagonalValues(rowKey, columnKey);
				var tileValues = edgeHandler.ResolveTileValue(mapValues[rowKey][columnKey], adjacentInfo, diagonalInfo);
				InsertTilesIntoMap(tileValues, rowKey, columnKey);
			}
		}
	};


	this.GenerateMapXml = function () {

		templateString += '<?xml version="1.0" encoding="UTF-8"?>';
		templateString += '<map version="1.0" orientation="orthogonal" renderorder="left-up" width="' + mapValuesTmx[0].length + '" height="' + mapValuesTmx[0].length + '" tilewidth="' + tilesetObject.tileWidth + '" tileheight="' + tilesetObject.tileHeight + '" nextobjectid="1">';
		templateString += '<tileset firstgid="1" name="tileset" tilewidth="' + tilesetObject.tileWidth + '" tileheight="' + tilesetObject.tileHeight + '">';
		templateString += '<image source="' + tilesetObject.source + '" trans="ffffff" width="' + tilesetObject.width + '" height="' + tilesetObject.height + '"/>';
		templateString += '</tileset>';

		for (var layerKey in mapValuesTmx) {
			StartNewLayer(layerKey);

			for (var rowKey in mapValuesTmx[layerKey]) {
				for (var columnKey in mapValuesTmx[layerKey][rowKey]) {
					AppendTileRow(mapValuesTmx[layerKey][rowKey][columnKey]);
				}
			}
			EndNewLayer();
		}
		templateString += '</map>';
	};



};