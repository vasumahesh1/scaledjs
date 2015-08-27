var Scaled = (function (Scaled) {

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
		var terrainDecoration = false;


		this.createTerrain = function (_terrainLabel, _terrainKey, _terrainUpperValue, _terrainLowerValue) {
			this.terrainKey = _terrainKey;
			terrainUpperValue = _terrainUpperValue;
			terrainLowerValue = _terrainLowerValue;
			terrainLabel = _terrainLabel;
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
			return Scaled.Commons.randomize(terrainLowerValue, terrainUpperValue);
		};

		this.isRegularTerrain = function () {
			if (terrainType == "terrain") {
				return true;
			}
			return false;
		};

		this.isDecorationTerrain = function () {
			if (terrainType == "decoration") {
				return true;
			}
			return false;
		};

		this.setValidation = function (minValue, maxValue) {
			terrainValidationMinPercent = minValue;
			terrainValidationMaxPercent = maxValue;
		};


		this.getValidation = function () {
			return {
				minValue: terrainValidationMinPercent,
				maxValue: terrainValidationMaxPercent
			};
		};

		this.setDecorationData = function (terrainDecorationData) {
			terrainDecorationData.placementPercent = terrainDecorationData.placementPercent ? terrainDecorationData.placementPercent : 0;
			terrainDecorationData.overlap = terrainDecorationData.overlap ? terrainDecorationData.overlap : false;
			terrainDecorationData.zLevel = terrainDecorationData.zLevel ? terrainDecorationData.zLevel : 0;
			terrainDecorationData.edgePlacement = terrainDecorationData.edgePlacement ? terrainDecorationData.edgePlacement : false;
			terrainDecoration = terrainDecorationData;
		};

		this.getDecorationData = function () {
			return terrainDecoration;
		};

		this.setTileInfo = function (tileInfo) {
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

				Scaled.Commons.error("Can't Find Tile Information for Layer: " + terrainLabel + ", Tile Data: " + tileType + ", " + tilePlacement + ", " + tileValue);
				return false;
			}

			Scaled.Commons.error("Can't Find Tile Information for Layer: " + terrainLabel + ", Tile Data: " + tileType + ", " + tilePlacement + ", " + tileValue);
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

	Scaled.ScaledTerrain = ScaledTerrain;
	return Scaled;

}(Scaled || {}));