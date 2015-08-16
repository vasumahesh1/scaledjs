var ScaledTerrain = function () {
	this.terrainKey = -1;
	var terrainUpperValue = -1;
	var terrainLowerValue = -1;
	var terrainLabel = -1;
	var terrainZLevel = -1;
	var terrainType = "terrain";
	var terrainDefault = false;
	var terrainStartCount = 0;
	var terrainStartPercent = 0;
	var terrainValidationMinPercent = -1;
	var terrainValidationMaxPercent = -1;
	var terrainTileInfo = -1;


	this.createTerrain = function (_terrainLabel, _terrainKey, _terrainUpperValue, _terrainLowerValue, _terrainZLevel) {
		this.terrainKey = _terrainKey;
		terrainUpperValue = _terrainUpperValue;
		terrainLowerValue = _terrainLowerValue;
		terrainLabel = _terrainLabel;
		terrainZLevel = _terrainZLevel;
	};

	this.setStartingCondition = function (_terrainStartCount, _terrainStartPercent) {
		terrainStartPercent = _terrainStartPercent;
		terrainStartCount = _terrainStartCount;
	};

	this.setDefault = function () {
		terrainDefault = true;
	};

	this.setType = function (_terrainType) {
		terrainType = _terrainType;
	};

	this.getRandomTerrainValue = function () {
		return Commons.randomize(terrainLowerValue, terrainUpperValue);
	};

	this.isRegularTerrain = function () {
		if (terrainType == "terrain") {
			return true;
		}
		return false;
	};

	this.setValidation = function (minValue, maxValue) {
		terrainValidationMinPercent = minValue;
		terrainValidationMaxPercent = maxValue;
	};


	this.addTileInfo = function (tileInfo) {
		terrainTileInfo = tileInfo;
	};

	this.getTiles = function () {
		return terrainTileInfo;
	};

	this.getTileData = function (tileType, tilePlacement, tileValue) {
		var tiles = this.getTiles();
		var selectedTile = false;

		for (var key in tiles) {
			if (tiles[key].type == tileType && tiles[key].placement == tilePlacement) {
				selectedTile = tiles[key];
				break;
			}
		}

		if (selectedTile) {
			if (selectedTile[tileValue]) {
				return selectedTile[tileValue];
			}

			Commons.error("Can't Find Tile Information for Layer: " + terrainLabel + ", Tile Data: " + tileType + ", " + tilePlacement + ", " + tileValue);
			return false;
		}

		Commons.error("Can't Find Tile Information for Layer: " + terrainLabel + ", Tile Data: " + tileType + ", " + tilePlacement + ", " + tileValue);
		return false;
	};


	this.getData = function () {
		var returnObject = {
			terrainKey: this.terrainKey,
			terrainUpperValue: terrainUpperValue,
			terrainLowerValue: terrainLowerValue,
			terrainLabel: terrainLabel,
			terrainZLevel: terrainZLevel,
			terrainType: terrainType,
			terrainDefault: terrainDefault,
			terrainStartCount: terrainStartCount,
			terrainStartPercent: terrainStartPercent,
			terrainValidationMinPercent: terrainValidationMinPercent,
			terrainValidationMaxPercent: terrainValidationMaxPercent,
			terrainTileInfo: terrainTileInfo
		};

		return returnObject;
	};
};