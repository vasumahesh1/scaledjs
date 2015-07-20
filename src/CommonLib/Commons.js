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


Commons.ConsoleLog = function (message, object) {
	if (this.debug === true) {
		console.log("[ScaledGen] " + message + " : ", object);
	}
};


Commons.Log = function (message, object, tag) {
	if (this.debug === true && (this.allowedLogs.indexOf(tag) != -1 || this.allowedLogs[0] == 'all')) {
		this.ConsoleLog(message, object);
	}
};


Commons.Warn = function (message) {
	if (this.debug === true) {
		console.warn("[ScaledGen - Stage Change] " + message);
	}
};

Commons.Error = function (message) {
	if (this.debug === true) {
		console.error("[ScaledGen - Stage Change] " + message);
	}
};

Commons.RoundNumber = function (number) {
	return Math.round(number);
};

Commons.Randomize = function (minValue, maxValue) {
	return Math.floor((Math.random() * (maxValue - minValue + 1)) + minValue);
};

Commons.RandomizeInArray = function (arrayList) {
	var minValue = 0;
	var maxValue = arrayList.length - 1;
	var index = this.Randomize(minValue, maxValue);
	return arrayList[index];
};

Commons.RandomizeWithException = function (minValue, maxValue, exceptList) {
	var value = -1;
	do {
		value = this.Randomize(minValue, maxValue);
	}
	while (exceptList.indexOf(value) != -1);
	return value;

};

Commons.RandomizePlusMinus = function (minValue, maxValue) {
	var barValue = this.Randomize(1, 10);
	var randomValue = this.Randomize(minValue, maxValue);
	if (barValue <= PLUS_MINUS_BAR) {
		return (barValue * -1);
	}
	return barValue;
};


Commons.GetAverage = function (arrayList) {
	this.Log("Array Came", arrayList);
	var sum = 0;
	var count = 0;
	for (var key in arrayList) {
		if (arrayList[key] != -1) {
			sum += arrayList[key];
			count++;
		}
	}
	var avg = sum / count;
	this.Log("Avg", avg);
	return avg;
};


Commons.TryGetArrayValue = function (arrayList, posX, posY) {
	if (posX in arrayList) {
		if (posY in arrayList[posX]) {
			return arrayList[posX][posY];
		}
	}
	return -1;
};

Commons.IsPointAtEdge = function (arrayList, posX, posY) {
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



Commons.GetDefaultTerrain = function (terrains) {
	for (var key in terrains) {
		if (terrains[key].getData()
			.terrainDefault === true) {
			return terrains[key];
		}
	}
};


Commons.GetMainTerrains = function (terrains) {
	var regularTerrains = [];
	for (var key in terrains) {
		if (terrains[key].getData()
			.terrainType == "terrain") {
			regularTerrains.push(terrains[key].getData());
		}
	}
	return regularTerrains;
};


Commons.GetTerrainByKey = function (terrains, terrainKeyValue) {
	for (var key in terrains) {
		if (terrains[key].terrainKey == terrainKeyValue) {
			return terrains[key];
		}
	}
};


Commons.GetTerrainMaximum = function (terrains) {
	var maxValue = -1;
	var responsibleTerrain = null;
	for (var key in terrains) {
		if (terrains[key].IsRegularTerrain() === true) {
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


Commons.GetTerrainMinimum = function (terrains) {
	var minValue = 101;
	var responsibleTerrain = null;
	for (var key in terrains) {
		if (terrains[key].IsRegularTerrain() === true) {
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