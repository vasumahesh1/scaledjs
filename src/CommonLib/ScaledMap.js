var ScaledMap = function() {
	this.terrains = [];
	this.mapValues = [];
	this.rowSize = 33;
	this.columnSize = 33;
	this.mapInitValue = -1;
	this.hasDefaultTerrain = false;
	this.startTerrainKeys = ["", "", "", ""];
	this.startTerrainValues = [];

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

};

ScaledMap.prototype.SetDimensions = function(rowSize, columnSize) {
	this.rowSize = rowSize;
	this.columnSize = columnSize;
};

ScaledMap.prototype.AddTerrain = function(terrainObject) {
	var terrainData = new ScaledTerrain();
	if ('zLevel' in terrainObject) {
		terrainData.CreateTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min, terrainObject.zLevel);
	} else {
		terrainData.CreateTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min, 0);
	}

	if ('type' in terrainObject) {
		terrainData.SetType(terrainObject.type);
	}

	if ('default' in terrainObject && this.hasDefaultTerrain === false) {
		this.hasDefaultTerrain = true;
		terrainData.SetDefault();
	}
	Commons.Log("Adding Terrain", terrainData);
	this.terrains.push(terrainData);
};


ScaledMap.prototype.AddStartingCondition = function(conditionObject) {
	var terrainObject = this.GetTerrainByKey(conditionObject["layerKey"]);
	terrainObject.terrainStartCount = conditionObject["minCount"];
	terrainObject.terrainStartPercent = conditionObject["optionalPercent"];
};

ScaledMap.prototype.GetLayersFromValue = function(terrainValue) {
	var selectedTerrains = [];
	for (var key in this.terrains) {
		if (this.terrains[key].terrainUpperValue >= terrainValue && this.terrains[key].terrainLowerValue <= terrainValue) {
			selectedTerrains.push(this.terrains[key]);
		}
	}
	return selectedTerrains;
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
	Commons.Log("Regular Terrains", regularTerrains);

	for (var key in regularTerrains) {
		if (regularTerrains[key].terrainStartCount > 0) {
			var tempObject = {};
			tempObject["terrainKey"] = regularTerrains[key].terrainKey;
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
			for (j = 0; j < minCountArray[minKey]["count"]; j++) {
				var value = Commons.RandomizeWithException(0, 3, slotsUsed);
				slotsUsed.push(value);
				this.startTerrainKeys[value] = minCountArray[minKey]["terrainKey"];
			}
		}

	} else if (totalMin > 4) {
		console.warn("Cannot have more than 4 starting conditions as a Rectangular map has only 4 vertices");
	}

	if (remainingSlots !== 0) {

		var totalOptional = 0;
		var optionalArray = [];
		var nonOptionalArray = [];

		for (var terrainKey in regularTerrains) {
			var tempTerrain = {};
			if (regularTerrains[terrainKey].terrainStartPercent > 0) {
				totalOptional += regularTerrains[terrainKey].terrainStartPercent;
				tempTerrain["terrainKey"] = regularTerrains[terrainKey].terrainKey;
				tempTerrain["cumulativePercent"] = totalOptional;
				optionalArray.push(tempTerrain);
			} else {
				tempTerrain["terrainKey"] = regularTerrains[terrainKey].terrainKey;
				nonOptionalArray.push(tempTerrain);
			}
		}

		if (totalOptional > 100) {
			console.warn("Please make sure your optional percentages are not over 100");
		} else {
			for (i = 0; i < remainingSlots; i++) {
				var remainingValue = Commons.RandomizeWithException(0, 3, slotsUsed);
				slotsUsed.push(remainingValue);

				var randomPercent = Commons.Randomize(0, 100);
				var terrainToUse = null;
				var found = false;
				for (var optionalKey in optionalArray) {
					if (randomPercent <= optionalArray[optionalKey]["cumulativePercent"]) {
						found = true;
						terrainToUse = optionalArray[optionalKey]["terrainKey"];
						break;
					}

				}

				if (found === false) {
					terrainToUse = Commons.RandomizeInArray(nonOptionalArray)["terrainKey"];
				}

				this.startTerrainKeys[remainingValue] = terrainToUse;
			}
		}
	}

	Commons.Log("Start Terrain Keys", this.startTerrainKeys);

	for (var startTerrainKey in this.startTerrainKeys) {
		var terrainObject = this.GetTerrainByKey(this.startTerrainKeys[startTerrainKey]);
		this.startTerrainValues.push(terrainObject.GetRandomTerrainValue());
	}

	Commons.Log("Start Terrain Values", this.startTerrainValues);

	this.mapValues[0][0] = this.startTerrainValues[0];
	this.mapValues[0][this.columnSize - 1] = this.startTerrainValues[1];
	this.mapValues[this.rowSize - 1][0] = this.startTerrainValues[2];
	this.mapValues[this.rowSize - 1][this.columnSize - 1] = this.startTerrainValues[3];

};

ScaledMap.prototype.GenerateMapValues = function() {
	Commons.Warn("Map Init Starting");
	this.Init();
	Commons.Warn("Diamond Square Algorithm Starting");
	this.mapValues = diamondSquare(this.mapValues, this.rowSize - 1);
	//var defaultTerrain = this.GetDefaultTerrain();
};


var diamondSquare = function(mapValues, boxSize) {
	Commons.Warn("Diamond Step Starting");
	diamondStep(mapValues, boxSize / 2, boxSize / 2, boxSize);
	Commons.Warn("Square Step Starting");
	squareStep(mapValues, boxSize / 2, boxSize / 2, boxSize);
	return mapValues;
};

function diamondStep(mapValues, posX, posY, boxSize) {
	var halfBoxSize = Math.floor(boxSize / 2);
	var quartBoxSize = Math.floor(halfBoxSize / 2);

	Commons.Log("HalfBoxSize", halfBoxSize, Commons.validLogKeys.diamondSquareLogKey);
	Commons.Log("QuarterBoxSize", quartBoxSize, Commons.validLogKeys.diamondSquareLogKey);

	Commons.Log(
		"Getting Avreage of", [
			"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
			"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
			"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
			"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]"
		],
		Commons.validLogKeys.diamondSquareLogKey
	);



	mapValues[posX][posY] = Commons.GetAverage([
		mapValues[posX - halfBoxSize][posY - halfBoxSize],
		mapValues[posX - halfBoxSize][posY + halfBoxSize],
		mapValues[posX + halfBoxSize][posY - halfBoxSize],
		mapValues[posX + halfBoxSize][posY + halfBoxSize],
	]);

	Commons.Log("Value of Center [" + posX + "][" + posY + "]", mapValues[posX][posY], Commons.validLogKeys.diamondSquareLogKey);
	if (halfBoxSize >= 2) {
		diamondStep(mapValues, posX - quartBoxSize, posY - quartBoxSize, halfBoxSize);
		diamondStep(mapValues, posX + quartBoxSize, posY - quartBoxSize, halfBoxSize);
		diamondStep(mapValues, posX - quartBoxSize, posY + quartBoxSize, halfBoxSize);
		diamondStep(mapValues, posX + quartBoxSize, posY + quartBoxSize, halfBoxSize);
	}
}

function squareStep(mapValues, posX, posY, boxSize) {
	var halfBoxSize = Math.floor(boxSize / 2);
	var quartBoxSize = Math.floor(halfBoxSize / 2);

	Commons.Log("HalfBoxSize", halfBoxSize, Commons.validLogKeys.diamondSquareLogKey);
	Commons.Log("QuarterBoxSize", quartBoxSize, Commons.validLogKeys.diamondSquareLogKey);

	Commons.Log(
		"Getting Avreage of", [
			"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
			"[" + (posX) + "],[" + (posY) + "]",
			"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
			"[" + (posX - boxSize) + "],[" + (posY) + "]"
		],
		Commons.validLogKeys.diamondSquareLogKey
	);
	mapValues[posX - halfBoxSize][posY] = Commons.GetAverage([
		Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize),
		Commons.TryGetArrayValue(mapValues, posX, posY),
		Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize),
		Commons.TryGetArrayValue(mapValues, posX - boxSize, posY)
	]);
	Commons.Log("Value of [" + (posX - halfBoxSize) + "][" + posY + "]", mapValues[posX - halfBoxSize][posY], Commons.validLogKeys.diamondSquareLogKey);


	Commons.Log(
		"Getting Avreage of", [
			"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
			"[" + (posX) + "],[" + (posY) + "]",
			"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
			"[" + (posX + boxSize) + "],[" + (posY) + "]"
		],
		Commons.validLogKeys.diamondSquareLogKey
	);
	mapValues[posX + halfBoxSize][posY] = Commons.GetAverage([
		Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize),
		Commons.TryGetArrayValue(mapValues, posX, posY),
		Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize),
		Commons.TryGetArrayValue(mapValues, posX + boxSize, posY)
	]);
	Commons.Log("Value of [" + (posX + halfBoxSize) + "][" + posY + "]", mapValues[posX + halfBoxSize][posY]);


	Commons.Log(
		"Getting Avreage of", [
			"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
			"[" + (posX) + "],[" + (posY) + "]",
			"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
			"[" + (posX) + "],[" + (posY - boxSize) + "]"
		],
		Commons.validLogKeys.diamondSquareLogKey);
	mapValues[posX][posY - halfBoxSize] = Commons.GetAverage([
		Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize),
		Commons.TryGetArrayValue(mapValues, posX, posY),
		Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize),
		Commons.TryGetArrayValue(mapValues, posX, posY - boxSize)
	]);
	Commons.Log("Value of [" + (posX) + "][" + (posY - halfBoxSize) + "]", mapValues[posX][posY - halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);


	Commons.Log(
		"Getting Avreage of", [
			"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
			"[" + (posX) + "],[" + (posY) + "]",
			"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
			"[" + (posX) + "],[" + (posY + boxSize) + "]"
		],
		Commons.validLogKeys.diamondSquareLogKey
	);
	mapValues[posX][posY + halfBoxSize] = Commons.GetAverage([
		Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize),
		Commons.TryGetArrayValue(mapValues, posX, posY),
		Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize),
		Commons.TryGetArrayValue(mapValues, posX, posY + boxSize)
	]);
	Commons.Log("Value of [" + (posX) + "][" + (posY + halfBoxSize) + "]", mapValues[posX][posY + halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);


	if (halfBoxSize >= 2) {
		squareStep(mapValues, posX - quartBoxSize, posY - quartBoxSize, halfBoxSize);
		squareStep(mapValues, posX + quartBoxSize, posY - quartBoxSize, halfBoxSize);
		squareStep(mapValues, posX - quartBoxSize, posY + quartBoxSize, halfBoxSize);
		squareStep(mapValues, posX + quartBoxSize, posY + quartBoxSize, halfBoxSize);
	}
}