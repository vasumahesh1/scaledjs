var Scaled = (function (Scaled) {

	var ScaledValidityReport = function (terrainKey, magnitude, actualPercent, isPositive) {
		this.terrainKey = terrainKey;
		this.repairMagnitude = magnitude;
		this.positiveIncrease = isPositive;
		this.actualPercent = actualPercent;
	};

	Scaled.ScaledValidityReport = ScaledValidityReport;
	return Scaled;

}(Scaled || {}));


// var ScaledAutoReview = function (terrainObject, validityReport) {
// 	this.terrain = terrainObject;
// 	this.validityReport = validityReport;
// };