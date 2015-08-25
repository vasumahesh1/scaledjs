var Scaled = (function (Scaled) {

	var ScaledValidityReport = function (terrainKey, magnitude, isPositive) {
		this.terrainKey = terrainKey;
		this.repairMagnitude = magnitude;
		this.positiveIncrease = isPositive;
	};

	Scaled.ScaledValidityReport = ScaledValidityReport;
	return Scaled;

}(Scaled || {}));


// var ScaledAutoReview = function (terrainObject, validityReport) {
// 	this.terrain = terrainObject;
// 	this.validityReport = validityReport;
// };