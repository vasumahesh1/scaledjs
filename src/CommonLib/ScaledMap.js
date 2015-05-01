var ScaledMap = function() {
	this.terrains = [];
	this.mapValues = [];
	this.rowSize = 33;
	this.columnSize = 33;
	this.mapInitValue = -1;
	this.hasDefaultTerrain = false;
	this.startValues = [-1, -1, -1, -1];
	this.startValuesTerrainKey = ["", "", "", ""];

	this.GetDefaultTerrain = function() {
		for (var key in this.terrains) {
			if (this.terrains[key].terrainDefault === true) {
				return this.terrains[key];
			}
		}
	};


	this.GetMainTerrains = function() {
		var regularTerrains = [];
		for (var key in this.terrains) {
			if (this.terrains[key].terrainType == "terrain") {
				regularTerrains.push(this.terrains[key]);
			}
		}
		return regularTerrains;
	};

	this.GetTerrainByKey = function(terrainKeyValue) {
		for (var key in this.terrains) {
			if (this.terrains[key].terrainKey == terrainKeyValue) {
				return this.terrains[key];
			}
		}
	};

	this.GetTerrainById = function(terrainId) {
		for (var key in this.terrains) {
			if (this.terrains[key].terrainId == terrainId) {
				return this.terrains[key];
			}
		}
	};

};

ScaledMap.prototype.SetDimensions = function(rowSize, columnSize) {
	this.rowSize = rowSize;
	this.columnSize = columnSize;
};

ScaledMap.prototype.AddTerrain = function(terrainObject) {
	var terrainId = this.terrains.length;
	var terrainData = new ScaledTerrain();
	if ('zLevel' in terrainObject) {
		terrainData.CreateTerrain(terrainId, terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min, terrainObject.zLevel);
	} else {
		terrainData.CreateTerrain(terrainId, terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min, 0);
	}

	if ('type' in terrainObject) {
		terrainData.SetType(terrainObject.type);
	}

	if ('default' in terrainObject && this.hasDefaultTerrain === false) {
		this.hasDefaultTerrain = true;
		terrainData.SetDefault();
	}

	this.terrains.push(terrainData);
};


ScaledMap.prototype.AddStartingCondition = function(conditionObject) {
	var terrainObject = this.GetTerrainByKey(conditionObject["layerKey"]);
	terrainObject.terrainStartCount = conditionObject["minCount"];
	terrainObject.terrainStartPercent = conditionObject["optionalPercent"];
};

ScaledMap.prototype.Init = function() {
	if (this.hasDefaultTerrain === false) {
		terrains[0].SetDefault();
	}

	for (i = 0; i < this.rowSize; i++) {
		var tempArray = [];
		for (j = 0; j < this.columnSize; j++) {
			tempArray.push(this.mapInitValue);
		}
		this.mapValues.push(tempArray);
	}

	var minCountArray = [];
	var totalMin = 0;

	var regularTerrains = this.GetMainTerrains();
	console.log(regularTerrains);

	for (var key in regularTerrains) {
		if (regularTerrains[key].terrainStartCount > 0) {
			var tempObject = {};
			tempObject["id"] = regularTerrains[key].terrainId;
			tempObject["count"] = regularTerrains[key].terrainStartCount;
			tempObject["nextPercent"] = regularTerrains[key].terrainStartPercent;
			totalMin += regularTerrains[key].terrainStartCount;
			minCountArray.push(tempObject);
		}
	}

	minCountArray.sort(function(a, b) {
		return b["count"] - a["count"];
	});

	var remainingSlots = 4;
	var slotsUsed = [];
	if (totalMin <= 4) {
		remainingSlots = 4 - totalMin;
		for (var minKey in minCountArray) {
			for(j=0;j<minCountArray[minKey]["count"];j++) {
				var value = Commons.RandomizeWithException(0, 3, slotsUsed);
				slotsUsed.push(value);
				this.startValues[value] = minCountArray[minKey]["id"];
			}
		}

	} else if (totalMin > 4) {
		console.warn("LOL");
	}

	if (remainingSlots !== 0) {
		for (i = 0; i < remainingSlots; i++) {
			var remainingValue = Commons.RandomizeWithException(0, 3, slotsUsed);
			slotsUsed.push(remainingValue);
			var terrainToUse = Commons.RandomizeInArray(regularTerrains)["terrainId"];
			this.startValues[remainingValue] = terrainToUse;
		}
	}

	console.log(this.startValues);

};

ScaledMap.prototype.GenerateMapValues = function() {
	this.Init();
	//var defaultTerrain = this.GetDefaultTerrain();
};

var diamondStep = function(mapValues, posX, posY, boxSize) {

};

var squareStep = function(mapValues, posX, posY, boxSize) {

};