/**
 * Constructor for Main Map Object
 */
var ScaledMap = function() {
	this.terrains = [];
	this.mapValues = [];
	this.mapValidityReports = [];
	this.rowSize = 33;
	this.columnSize = 33;
	this.mapInitValue = -1;
	this.hasDefaultTerrain = false;
	this.startTerrainKeys = ["", "", "", ""];
	this.startTerrainValues = [];
	this.isInited = false;

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

/**
 * Sets the Dimensions received from the generator
 * @param {integer}	rowSize Size of the Row
 * @param {integer} columnSize Size of the Column
 */
ScaledMap.prototype.SetDimensions = function(rowSize, columnSize) {
	this.rowSize = rowSize;
	this.columnSize = columnSize;
};

/**
 * Adds a Scaled Terrain Object to a Map Instance
 * @param {object}	terrainObject	Object containing information about the terrain
 */
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

/**
 * Assigns Starting Condition to a Particular Layer
 * @param {object}	conditionObject Object containing information about the starting condition
 */
ScaledMap.prototype.AddStartingCondition = function(conditionObject) {
	var terrainObject = this.GetTerrainByKey(conditionObject["terrainKey"]);
	terrainObject.terrainStartCount = conditionObject["minCount"];
	terrainObject.terrainStartPercent = conditionObject["optionalPercent"];
};

/**
 * Assigns a Validation Rule to a Particular Layer
 * @param {object} Object containing information about the rule
 */
ScaledMap.prototype.AddValidationRule = function(ruleObject) {
	var terrainKey = ruleObject["terrainKey"];
	var minValue = -1;
	var maxValue = -1;

	if ("minPercent" in ruleObject) {
		minValue = ruleObject["minPercent"];
	}

	if ("maxPercent" in ruleObject) {
		maxValue = ruleObject["maxPercent"];
	}

	this.GetTerrainByKey(terrainKey).SetValidation(minValue, maxValue);
};

/**
 * Checks the Validity of the Main Terrains. Based on the Validation Rules set.
 */
ScaledMap.prototype.CheckRegularTerrainValidity = function() {
	var regularTerrains = this.GetMainTerrains();
	var validStatus = true;
	for (var key in regularTerrains) {
		var percent = this.GetLayerPercentage(regularTerrains[key].terrainKey);
		var validityReport = null;
		if (regularTerrains[key].terrainValidationMinPercent != -1) {
			if (percent < regularTerrains[key].terrainValidationMinPercent) {
				validStatus = false;
				validityReport = new ScaledValidityReport(regularTerrains[key].terrainKey, Math.abs(percent - regularTerrains[key].terrainValidationMinPercent), true);
			}
		}

		if (regularTerrains[key].terrainValidationMaxPercent != -1) {
			if (percent > regularTerrains[key].terrainValidationMaxPercent) {
				validStatus = false;
				validityReport = new ScaledValidityReport(regularTerrains[key].terrainKey, Math.abs(percent - regularTerrains[key].terrainValidationMaxPercent), false);
			}
		}

		if (validityReport !== null) {
			this.mapValidityReports.push(validityReport);
		}
	}

	Commons.Log("Validity Reports", this.mapValidityReports, Commons.validLogKeys.mapValidationLogKey);

	return validStatus;
};

/**
 * Gets the Percentage for a Particular Layer
 * @param {string}	layerKey	Contains the key associated to the layer
 */
ScaledMap.prototype.GetLayerPercentage = function(layerKey) {
	var selectedCount = 0;
	var totalCount = this.rowSize * this.columnSize;
	var terrainObject = this.GetTerrainByKey(layerKey);
	for (var mapRow in this.mapValues) {
		for (var mapColumn in this.mapValues) {
			if (this.mapValues[mapRow][mapColumn] <= terrainObject.terrainUpperValue && this.mapValues[mapRow][mapColumn] >= terrainObject.terrainLowerValue) {
				selectedCount++;
			}
		}
	}

	var percent = (selectedCount / totalCount) * 100;

	Commons.Log(terrainObject.terrainKey + " Percentage of Terrain", percent, Commons.validLogKeys.mapValidationLogKey);

	return percent;
};

/**
 * Specifies the List of layers to which the particular Cell Value belongs to
 * @param {double}	terrainValue   Value of the Cell
 */
ScaledMap.prototype.GetLayersFromValue = function(terrainValue) {
	var selectedTerrains = [];
	for (var key in this.terrains) {
		if (this.terrains[key].terrainUpperValue >= terrainValue && this.terrains[key].terrainLowerValue <= terrainValue) {
			selectedTerrains.push(this.terrains[key]);
		}
	}
	return selectedTerrains;
};

/**
 * Initializes the Map
 */
ScaledMap.prototype.Init = function() {
	if (this.isInited === false) {
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
		this.isInited = true;
	}
};

/**
 * Initializes the Starting Conditions of the Map
 */
ScaledMap.prototype.InitStartingConditions = function() {

	// Init Global Vars - Important If the Generation is Re Done
	this.startTerrainKeys = ["", "", "", ""];
	this.startTerrainValues = [];

	var minCountArray = [];
	var totalMin = 0;

	// Get Valid Terrains
	// i.e. Main Terrains Only
	var regularTerrains = this.GetMainTerrains();
	Commons.Log("Regular Terrains", regularTerrains);

	/* 
	 * Store Terrains whose 'minCount' has been specified
	 * Basically all the terrains that user has specified to be a 'must have'
	 */
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

	// Descending Order Sort - based on the Count
	minCountArray.sort(function(a, b) {
		return b["count"] - a["count"];
	});

	var remainingSlots = 4;
	var slotsUsed = [];
	if (totalMin <= 4) {
		// Free Slots Left
		remainingSlots = 4 - totalMin;

		/*
		 * Below Code Assigns a Random Edge of the Map to the Above calculated Terrains
		 * The Choice of slot is random(0,3)
		 */
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

	// If free slots left. i.e. User has not given all 4 edge details
	if (remainingSlots !== 0) {

		var totalOptional = 0;
		var optionalArray = [];
		var nonOptionalArray = [];

		/*
		 * Below code calculates the Cumulative Percentage so that
		 * later on a random(0,100) will give a random percent
		 * which can be used to determine which  Terrain to be selected
		 * (Selected Layer will have Cumulative Percentage just above the random value)
		 */
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
				// Getting a Random Slot from  0 to 3 with Exception of certain slots to Exclude
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

/**
 * Main Function invoked to Generate the Map from scratch.
 */
ScaledMap.prototype.GenerateMapValues = function() {
	Commons.Warn("Map Init Starting");
	this.Init();
	this.InitStartingConditions();
	this.mapValidityReports = [];
	Commons.Warn("Diamond Square Algorithm Starting");
	this.mapValues = diamondSquare(this.mapValues, this.rowSize - 1);
	this.CleanMap();
};

/**
 * Does a Final Clean up of the map values.
 */
ScaledMap.prototype.CleanMap = function() {
	for (var mapRow in this.mapValues) {
		for (var mapColumn in this.mapValues) {
			if (this.mapValues[mapRow][mapColumn] < 0) {
				this.mapValues[mapRow][mapColumn] = 0;
			}

			if (this.mapValues[mapRow][mapColumn] > 100) {
				this.mapValues[mapRow][mapColumn] = 100;
			}
		}
	}
};

/**
 * Modified Version of a Diamond Square Algorithm with extra Variation Added
 * @param  {Array}		mapValues   Map on which Diamond Square to be applied
 * @param  {integer}	boxSize 	Size of the Box. (Last Index of the box)
 * @return {Array}		Final Modified Map
 */
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
	]) + Commons.RandomizePlusMinus(0, 5);
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
	]) + Commons.RandomizePlusMinus(0, 5);
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
	]) + Commons.RandomizePlusMinus(0, 5);
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
	]) + Commons.RandomizePlusMinus(0, 5);
	Commons.Log("Value of [" + (posX) + "][" + (posY + halfBoxSize) + "]", mapValues[posX][posY + halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);


	if (halfBoxSize >= 2) {
		squareStep(mapValues, posX - quartBoxSize, posY - quartBoxSize, halfBoxSize);
		squareStep(mapValues, posX + quartBoxSize, posY - quartBoxSize, halfBoxSize);
		squareStep(mapValues, posX - quartBoxSize, posY + quartBoxSize, halfBoxSize);
		squareStep(mapValues, posX + quartBoxSize, posY + quartBoxSize, halfBoxSize);
	}
}