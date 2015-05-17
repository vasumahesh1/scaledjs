var ScaledValidityReport = function (terrainKey, magnitude, isPositive) {
	this.terrainKey = terrainKey;
	this.repairMagnitude = magnitude;
	this.positiveIncrease = isPositive;
};


var ScaledAutoReview = function (terrainObject, validityReport) {
	this.terrain = terrainObject;
	this.validityReport = validityReport;
};