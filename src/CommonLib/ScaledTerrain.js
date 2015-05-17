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
	var terrainGidInfo = -1;


	this.CreateTerrain = function (_terrainLabel, _terrainKey, _terrainUpperValue, _terrainLowerValue, _terrainZLevel) {
		this.terrainKey = _terrainKey;
		terrainUpperValue = _terrainUpperValue;
		terrainLowerValue = _terrainLowerValue;
		terrainLabel = _terrainLabel;
		terrainZLevel = _terrainZLevel;
	};

	this.SetStartingCondition = function (_terrainStartCount, _terrainStartPercent) {
		terrainStartPercent = _terrainStartPercent;
		terrainStartCount = _terrainStartCount;
	};

	this.SetDefault = function () {
		terrainDefault = true;
	};

	this.SetType = function (_terrainType) {
		terrainType = _terrainType;
	};

	this.GetRandomTerrainValue = function () {
		return Commons.Randomize(terrainLowerValue, terrainUpperValue);
	};

	this.IsRegularTerrain = function () {
		if (terrainType == "terrain") {
			return true;
		}
		return false;
	};

	this.SetValidation = function (minValue, maxValue) {
		terrainValidationMinPercent = minValue;
		terrainValidationMaxPercent = maxValue;
	};


	this.SetGidInfo = function (gidInfo) {
		terrainGidInfo = gidInfo;
	};

	this.getGidInfo = function () {
		return terrainGidInfo;
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
			terrainGidInfo: terrainGidInfo
		};

		return returnObject;
	};
};