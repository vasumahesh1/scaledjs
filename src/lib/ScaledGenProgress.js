var Scaled = (function (Scaled) {

	var ScaledGenProgress = function (terrainKey) {
		this.terrainKey = terrainKey;
		var cellCount = 0;
		var percent = 0;
		var totalCount = 0;

		this.increment = function () {
			cellCount++;
			totalCount++;
			percent = (cellCount / totalCount) * 100;
		};

		this.silentIncrement = function () {
			cellCount++;
			percent = (cellCount / totalCount) * 100;
		};

		this.silentDecrement = function () {
			cellCount--;
			percent = (cellCount / totalCount) * 100;
		};

		this.pass = function () {
			totalCount++;
			percent = (cellCount / totalCount) * 100;
		};


		this.getPercent = function () {
			return percent;
		};
	};

	Scaled.ScaledGenProgress = ScaledGenProgress;
	return Scaled;

}(Scaled || {}));


// var ScaledAutoReview = function (terrainObject, validityReport) {
// 	this.terrain = terrainObject;
// 	this.validityReport = validityReport;
// };