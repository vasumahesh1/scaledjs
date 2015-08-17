// ----- Construct -----
var Commons = {
	debug: false,
	allowedLogs: ['all'],
	validLogKeys: {
		mapInitializeLogKey: 'mapInit',
		diamondSquareLogKey: 'diamondSquare',
		mapValidationLogKey: 'mapValidation',
		mapRenderLogKey: 'mapRender',
		tmxRenderLogKey: 'tmxRender',
	},
	showProgressUpdate: function () {}
};

// ----- Declare Vars Here -----
var PLUS_MINUS_BAR = 4;

/**
 * Wrapper Logging Function over console.log
 * @param {string} message Logs a Message
 * @param {object} object  Prints any Object if Given
 */
Commons.consoleLog = function (message, object) {
	if (this.debug === true) {
		console.log("[ScaledGen] " + message + " : ", object);
	}
};

/**
 * Actual Global Logging function that checks if the given tag is active.
 * If Not it doesn't process the Log.
 * @param {string} message Message to Log
 * @param {object} logObject  Object to Log
 * @param {string} tag     Tag of the Logging Request
 */
Commons.log = function (message, logObject, tag) {
	if (this.debug === true && (this.allowedLogs.indexOf(tag) != -1 || this.allowedLogs[0] == 'all')) {
		this.consoleLog(message, logObject);
	}
};

/**
 * Wrapper Logging Function over console.warn
 * @param {string} message Message to Warn
 */
Commons.warn = function (message) {
	if (this.debug === true) {
		console.warn("[ScaledGen - Warning] " + message);
	}
};

/**
 * Wrapper Logging Function over console.info
 * @param {string} message Message to provide Information
 */
Commons.info = function (message) {
	if (this.debug === true) {
		console.info("[ScaledGen - Warning] " + message);
	}
};

/**
 * Wrapper Logging Function over console.error
 * @param {string} message Message to print
 */
Commons.error = function (message) {
	if (this.debug === true) {
		console.error("[ScaledGen - Error] " + message);
	}
};

/**
 * Wrapper Function over Math.round
 * @param {float} number Number to round
 */
Commons.roundNumber = function (number) {
	return Math.round(number);
};

/**
 * Common RNG Function to generate random numbers in a given range
 * @param {int} minValue Start Range
 * @param {int} maxValue End Range
 */
Commons.randomize = function (minValue, maxValue) {
	return Math.floor((Math.random() * (maxValue - minValue + 1)) + minValue);
};

/**
 * Selects a Random value in the array values
 * @param {array} arrayList Array of Values
 */
Commons.randomizeInArray = function (arrayList) {
	var minValue = 0;
	var maxValue = arrayList.length - 1;
	var index = this.randomize(minValue, maxValue);
	return arrayList[index];
};

/**
 * Randomizes a value from a given Array but makes sure the 
 * value doesn't come from the Exception list
 * @param {int} minValue   Start Range
 * @param {int} maxValue   End Range
 * @param {array} exceptList Exception Array Values
 */
Commons.randomizeWithException = function (minValue, maxValue, exceptList) {
	var value = -1;
	do {
		value = this.randomize(minValue, maxValue);
	}
	while (exceptList.indexOf(value) != -1);
	return value;

};

/**
 * Common RNG Function to generate random numbers in a given range
 * with a possibility of Negative
 * @param {int} minValue Start Range
 * @param {int} maxValue End Range
 */
Commons.randomizePlusMinus = function (minValue, maxValue) {
	var barValue = this.randomize(1, 10);
	var randomValue = this.randomize(minValue, maxValue);
	if (barValue <= PLUS_MINUS_BAR) {
		return (barValue * -1);
	}
	return barValue;
};

/**
 * Gets the average of an Array. Also makes sure that Invalid entries don't account for the sum
 * @param {[type]} arrayList Array Values
 */
Commons.getAverage = function (arrayList) {
	this.log("Array Came", arrayList);
	var sum = 0;
	var count = 0;
	for (var key in arrayList) {
		if (arrayList[key] != -1) {
			sum += arrayList[key];
			count++;
		}
	}
	var avg = sum / count;
	this.log("Avg", avg);
	return avg;
};

/**
 * Tries to get the array value for a given position
 * @param {array} arrayList Map Array Values(2D)
 * @param {int} posX      X coordinate
 * @param {int} posY      Y coordinate
 */
Commons.tryGetArrayValue = function (arrayList, posX, posY) {
	if (posX in arrayList) {
		if (posY in arrayList[posX]) {
			return arrayList[posX][posY];
		}
	}
	return -1;
};

/**
 * Checks if the given point is at the Edge of the Map
 * (0,y) (x,0) (x,Y) (X,y) are the possible values 
 * @param {array} arrayList Map Array Values(2D)
 * @param {int} posX      X coordinate
 * @param {int} posY      Y coordinate
 */
Commons.isPointAtEdge = function (arrayList, posX, posY) {
	posX = parseInt(posX);
	posY = parseInt(posY);
	if (posX === 0 || posY === 0) {
		return true;
	}

	if (posX == arrayList.length || posY == arrayList[0].length) {
		return true;
	}

	return false;
};


/**
 * Gets the default terrain from the set of Terrains
 * @param {array} terrains Array of Terrains
 */
Commons.getDefaultTerrain = function (terrains) {
	for (var key in terrains) {
		if (terrains[key].getData()
			.terrainDefault === true) {
			return terrains[key];
		}
	}
};

/**
 * Gets the Terrains Responsible for Terrain Generation
 * @param {array} terrains Array of Terrains
 */
Commons.getMainTerrains = function (terrains) {
	var regularTerrains = [];
	for (var key in terrains) {
		if (terrains[key].isRegularTerrain() === true) {
			regularTerrains.push(terrains[key].getData());
		}
	}
	return regularTerrains;
};


/**
 * Gets the Terrains Responsible for Decoration
 * @param {array} terrains Array of Terrains
 */
Commons.getDecorationTerrains = function (terrains) {
	var selectedTerrains = [];
	for (var key in terrains) {
		if (terrains[key].isDecorationTerrain() === true) {
			selectedTerrains.push(terrains[key].getData());
		}
	}
	return selectedTerrains;
};

/**
 * Gets the Terrain through the specified Key
 * @param {array} terrains        Array of Terrains
 * @param {string} terrainKeyValue Terrain Key of the terrain
 */
Commons.getTerrainByKey = function (terrains, terrainKeyValue) {
	for (var key in terrains) {
		if (terrains[key].terrainKey == terrainKeyValue) {
			return terrains[key];
		}
	}
};

/**
 * Gets the Maximum Value Among Regular Terrains
 * i.e. Terrains which participate in terrain generation
 * @param {array} terrains Array of Terrains
 */
Commons.getTerrainMaximum = function (terrains) {
	var maxValue = -1;
	var responsibleTerrain = null;
	for (var key in terrains) {
		if (terrains[key].isRegularTerrain() === true) {
			if (terrains[key].getData()
				.terrainUpperValue > maxValue) {
				maxValue = terrains[key].getData()
					.terrainUpperValue;
				responsibleTerrain = terrains[key];
			}
		}
	}
	return responsibleTerrain;
};

/**
 * Gets the Minimum Value Among Regular Terrains
 * i.e. Terrains which participate in terrain generation
 * @param {array} terrains Array of Terrains
 */
Commons.getTerrainMinimum = function (terrains) {
	var minValue = 101;
	var responsibleTerrain = null;
	for (var key in terrains) {
		if (terrains[key].isRegularTerrain() === true) {
			if (terrains[key].getData()
				.terrainLowerValue < minValue) {
				minValue = terrains[key].getData()
					.terrainLowerValue;
				responsibleTerrain = terrains[key];
			}
		}
	}
	return responsibleTerrain;
};