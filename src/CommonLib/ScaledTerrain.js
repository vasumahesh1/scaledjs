var ScaledTerrain = function() {
	this.terrainUpperValue = -1;
	this.terrainLowerValue = -1;
	this.terrainLabel = -1;
	this.terrainKey = -1;
	this.terrainId = -1;
	this.terrainZLevel = -1;
	this.terrainType = "terrain";
	this.terrainDefault = false;
	this.terrainStartCount = 0;
	this.terrainStartPercent = 0;
};

ScaledTerrain.prototype.CreateTerrain = function (terrainId, terrainLabel, terrainKey, terrainUpperValue, terrainLowerValue, terrainZLevel) {
	this.terrainUpperValue = terrainUpperValue;
	this.terrainLowerValue = terrainLowerValue;
	this.terrainKey = terrainKey;
	this.terrainLabel = terrainLabel;
	this.terrainId = terrainId;
	this.terrainZLevel = terrainZLevel;
};

ScaledTerrain.prototype.SetStartingCondition = function (terrainStartCount, terrainStartPercent) {
	this.terrainStartPercent = terrainStartPercent;
	this.terrainStartCount = terrainStartCount;
};

ScaledTerrain.prototype.SetDefault = function () {
	this.terrainDefault = true;
};

ScaledTerrain.prototype.SetType = function (terrainType) {
	this.terrainType = terrainType;
};