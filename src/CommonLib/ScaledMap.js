var ScaledMap = function() {
	this.terrains = [];
	this.rowSize = 33;
	this.columnSize = 33;
	this.hasDefaultTerrain = false;
	var _topLeft = 0;
	var _topRight = 0;
	var _botLeft = 0;
	var _botRight = 0;
	var _topLeftCondition = -1;
	var _topRightCondition = -1;
	var _botLeftCondition = -1;
	var _botRightCondition = -1;
};

ScaledMap.prototype.SetDimensions = function (rowSize, columnSize) {
	this.rowSize = rowSize;
	this.columnSize = columnSize;
};

ScaledMap.prototype.AddTerrain = function (terrainObject) {
	var currentSize = this.terrains.length;
	var terrainData = new ScaledTerrain();
	if('zLevel' in terrainObject) {
		terrainData.CreateTerrain(currentSize, terrainObject.label, terrainObject.max, terrainObject.min, terrainObject.zLevel);
	}
	else {
		terrainData.CreateTerrain(currentSize, terrainObject.label, terrainObject.max, terrainObject.min, 0);
	}

	if('default' in terrainObject && hasDefaultTerrain == false) {
		this.hasDefaultTerrain = true;
		terrainData.SetDefault();
	}

	this.terrains.push(terrainData);
};

ScaledMap.prototype.Init = function() {
	if(this.hasDefaultTerrain == false) {
		terrains[0].SetDefault();
	}

};

ScaledMap.prototype.GenerateMapValues = function() {

};


var diamondStep = function() {

}

var squareStep = function() {
	
}