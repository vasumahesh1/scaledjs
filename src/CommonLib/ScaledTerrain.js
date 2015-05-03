var ScaledTerrain = function() {
	this.terrainUpperValue = -1;
	this.terrainLowerValue = -1;
	this.terrainLabel = -1;
	this.terrainKey = -1;
	this.terrainZLevel = -1;
	this.terrainType = "terrain";
	this.terrainDefault = false;
	this.terrainStartCount = 0;
	this.terrainStartPercent = 0;
	this.terrainValidationMinPercent = -1;
	this.terrainValidationMaxPercent = -1;
};

ScaledTerrain.prototype.CreateTerrain = function(terrainLabel, terrainKey, terrainUpperValue, terrainLowerValue, terrainZLevel) {
	this.terrainUpperValue = terrainUpperValue;
	this.terrainLowerValue = terrainLowerValue;
	this.terrainKey = terrainKey;
	this.terrainLabel = terrainLabel;
	this.terrainZLevel = terrainZLevel;
};

ScaledTerrain.prototype.SetStartingCondition = function(terrainStartCount, terrainStartPercent) {
	this.terrainStartPercent = terrainStartPercent;
	this.terrainStartCount = terrainStartCount;
};

ScaledTerrain.prototype.SetDefault = function() {
	this.terrainDefault = true;
};

ScaledTerrain.prototype.SetType = function(terrainType) {
	this.terrainType = terrainType;
};

ScaledTerrain.prototype.GetRandomTerrainValue = function() {
	return Commons.Randomize(this.terrainLowerValue, this.terrainUpperValue);
};

ScaledTerrain.prototype.IsRegularTerrain = function() {
	if (this.terrainType == "terrain") {
		return true;
	}
	return false;
};

ScaledTerrain.prototype.SetValidation = function(minValue, maxValue) {
	this.terrainValidationMinPercent = minValue;
	this.terrainValidationMaxPercent = maxValue;
};