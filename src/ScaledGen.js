var ScaledGen = function() {
	this.mainMap = new ScaledMap();
};

ScaledGen.prototype.SetMapSize = function(rowSize, columnSize) {
	this.mainMap['rowSize'] = rowSize;
	this.mainMap['columnSize'] = columnSize;
};

ScaledGen.prototype.AddTerrain = function(terrainData) {
	this.mainMap.AddTerrain(terrainData);
};


ScaledGen.prototype.GenerateMap = function() {
	console.log(Commons.RandomizePlusMinus(35,55));
	console.log(this.mainMap['rowSize']);
};