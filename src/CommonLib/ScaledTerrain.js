var ScaledTerrain = function() {
	this.terrainUpperValue = -1;
	this.terrainLowerValue = -1;
	this.terrainLabel = -1;
	this.terrainId = -1;
	this.terrainZLevel = -1;
	this.terrainDefault = false;
};

ScaledTerrain.prototype.CreateTerrain = function (terrainId, terrainLabel, terrainUpperValue, terrainLowerValue, terrainZLevel) {
	this.terrainUpperValue = terrainUpperValue;
	this.terrainLowerValue = terrainLowerValue;
	this.terrainLabel = terrainLabel;
	this.terrainId = terrainId;
	this.terrainZLevel = terrainZLevel;
};

ScaledTerrain.prototype.SetDefault = function () {
	this.terrainDefault = true;
};