// ----- Construct -----
var Commons = {
    debug: false,
    allowedLogs: [ "all" ],
    validLogKeys: {
        mapInitializeLogKey: "mapInit",
        diamondSquareLogKey: "diamondSquare",
        mapValidationLogKey: "mapValidation"
    },
    showProgressUpdate: function() {}
};

// ----- Declare Vars Here -----
var PLUS_MINUS_BAR = 4;

Commons.ConsoleLog = function(message, object) {
    if (this.debug === true) {
        console.log("[ScaledGen] " + message + " : " + JSON.stringify(object));
    }
};

Commons.Log = function(message, object, tag) {
    if (this.debug === true && (this.allowedLogs.indexOf(tag) != -1 || this.allowedLogs[0] == "all")) {
        this.ConsoleLog(message, object);
    }
};

Commons.Warn = function(message) {
    if (this.debug === true) {
        console.warn("[ScaledGen - Stage Change] " + message);
    }
};

Commons.Error = function(message) {
    if (this.debug === true) {
        console.error("[ScaledGen - Stage Change] " + message);
    }
};

Commons.RoundNumber = function(number) {
    return Math.round(number);
};

Commons.Randomize = function(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
};

Commons.RandomizeInArray = function(arrayList) {
    var minValue = 0;
    var maxValue = arrayList.length - 1;
    var index = this.Randomize(minValue, maxValue);
    return arrayList[index];
};

Commons.RandomizeWithException = function(minValue, maxValue, exceptList) {
    var value = -1;
    do {
        value = this.Randomize(minValue, maxValue);
    } while (exceptList.indexOf(value) != -1);
    return value;
};

Commons.RandomizePlusMinus = function(minValue, maxValue) {
    var barValue = this.Randomize(1, 10);
    var randomValue = this.Randomize(minValue, maxValue);
    if (barValue <= PLUS_MINUS_BAR) {
        return barValue * -1;
    }
    return barValue;
};

Commons.GetAverage = function(arrayList) {
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

Commons.TryGetArrayValue = function(arrayList, posX, posY) {
    if (posX in arrayList) {
        if (posY in arrayList[posX]) {
            return arrayList[posX][posY];
        }
    }
    return -1;
};

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
    this.startTerrainKeys = [ "", "", "", "" ];
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
    if ("zLevel" in terrainObject) {
        terrainData.CreateTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min, terrainObject.zLevel);
    } else {
        terrainData.CreateTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min, 0);
    }
    if ("type" in terrainObject) {
        terrainData.SetType(terrainObject.type);
    }
    if ("default" in terrainObject && this.hasDefaultTerrain === false) {
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
    var percent = selectedCount / totalCount * 100;
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
    this.startTerrainKeys = [ "", "", "", "" ];
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
    Commons.Log("Getting Avreage of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
    mapValues[posX][posY] = Commons.GetAverage([ mapValues[posX - halfBoxSize][posY - halfBoxSize], mapValues[posX - halfBoxSize][posY + halfBoxSize], mapValues[posX + halfBoxSize][posY - halfBoxSize], mapValues[posX + halfBoxSize][posY + halfBoxSize] ]);
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
    Commons.Log("Getting Avreage of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX - boxSize) + "],[" + posY + "]" ], Commons.validLogKeys.diamondSquareLogKey);
    mapValues[posX - halfBoxSize][posY] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX - boxSize, posY) ]) + Commons.RandomizePlusMinus(0, 5);
    Commons.Log("Value of [" + (posX - halfBoxSize) + "][" + posY + "]", mapValues[posX - halfBoxSize][posY], Commons.validLogKeys.diamondSquareLogKey);
    Commons.Log("Getting Avreage of", [ "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX + boxSize) + "],[" + posY + "]" ], Commons.validLogKeys.diamondSquareLogKey);
    mapValues[posX + halfBoxSize][posY] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX + boxSize, posY) ]) + Commons.RandomizePlusMinus(0, 5);
    Commons.Log("Value of [" + (posX + halfBoxSize) + "][" + posY + "]", mapValues[posX + halfBoxSize][posY]);
    Commons.Log("Getting Avreage of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + (posY - boxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
    mapValues[posX][posY - halfBoxSize] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY - boxSize) ]) + Commons.RandomizePlusMinus(0, 5);
    Commons.Log("Value of [" + posX + "][" + (posY - halfBoxSize) + "]", mapValues[posX][posY - halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
    Commons.Log("Getting Avreage of", [ "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + posX + "],[" + (posY + boxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
    mapValues[posX][posY + halfBoxSize] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY + boxSize) ]) + Commons.RandomizePlusMinus(0, 5);
    Commons.Log("Value of [" + posX + "][" + (posY + halfBoxSize) + "]", mapValues[posX][posY + halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
    if (halfBoxSize >= 2) {
        squareStep(mapValues, posX - quartBoxSize, posY - quartBoxSize, halfBoxSize);
        squareStep(mapValues, posX + quartBoxSize, posY - quartBoxSize, halfBoxSize);
        squareStep(mapValues, posX - quartBoxSize, posY + quartBoxSize, halfBoxSize);
        squareStep(mapValues, posX + quartBoxSize, posY + quartBoxSize, halfBoxSize);
    }
}

var ScaledTerrain = function() {
    this.terrainUpperValue = -1;
    this.terrainLowerValue = -1;
    this.terrainLabel = -1;
    this.terrainKey = -1;
    this.terrainZLevel = -1;
    this.terrainType = "terrain";
    this.terrainDefault = false;
    this.terrainStartCount = 0;
    this.terrainStartPercent = 0;
    this.terrainValidationMinPercent = -1;
    this.terrainValidationMaxPercent = -1;
};

ScaledTerrain.prototype.CreateTerrain = function(terrainLabel, terrainKey, terrainUpperValue, terrainLowerValue, terrainZLevel) {
    this.terrainUpperValue = terrainUpperValue;
    this.terrainLowerValue = terrainLowerValue;
    this.terrainKey = terrainKey;
    this.terrainLabel = terrainLabel;
    this.terrainZLevel = terrainZLevel;
};

ScaledTerrain.prototype.SetStartingCondition = function(terrainStartCount, terrainStartPercent) {
    this.terrainStartPercent = terrainStartPercent;
    this.terrainStartCount = terrainStartCount;
};

ScaledTerrain.prototype.SetDefault = function() {
    this.terrainDefault = true;
};

ScaledTerrain.prototype.SetType = function(terrainType) {
    this.terrainType = terrainType;
};

ScaledTerrain.prototype.GetRandomTerrainValue = function() {
    return Commons.Randomize(this.terrainLowerValue, this.terrainUpperValue);
};

ScaledTerrain.prototype.IsRegularTerrain = function() {
    if (this.terrainType == "terrain") {
        return true;
    }
    return false;
};

ScaledTerrain.prototype.SetValidation = function(minValue, maxValue) {
    this.terrainValidationMinPercent = minValue;
    this.terrainValidationMaxPercent = maxValue;
};

var ScaledValidityReport = function(terrainKey, magnitude, isPositive) {
    this.terrainKey = terrainKey;
    this.repairMagnitude = magnitude;
    this.positiveIncrease = isPositive;
};

// The MIT License (MIT)
// Copyright (c) 2015 Vasu Mahesh (vasu.mahesh@[yahoo|hotmail|gmail].com)
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// 
// 
/**
 * Main Constructor for the Generator Object
 * @param {object}	settingsData	Configuring Settings of the Generator
 */
var ScaledGen = function(settingsData) {
    this.maxTries = 10;
    if (settingsData) {
        if ("debug" in settingsData && settingsData["debug"] === true) {
            Commons.debug = true;
        }
        if ("logs" in settingsData) {
            Commons.allowedLogs = settingsData["logs"];
        }
        if ("maxTries" in settingsData) {
            this.maxTries = settingsData["maxTries"];
        }
        if ("onProgressUpdate" in settingsData) {
            Commons.showProgressUpdate = settingsData["onProgressUpdate"];
        }
    }
    this.mainMap = new ScaledMap();
};

/**
 * Gets the Map Values (2D Array) for the User
 */
ScaledGen.prototype.GetMapValues = function() {
    return this.mainMap.mapValues;
};

/**
 * Sets the Map Size
 * @param {integer}	rowSize Size of the Row
 * @param {integer} columnSize Size of the Column
 */
ScaledGen.prototype.SetMapSize = function(rowSize, columnSize) {
    this.mainMap["rowSize"] = rowSize;
    this.mainMap["columnSize"] = columnSize;
};

/**
 * Adds a Scaled Terrain Object to a Map Instance
 * @param {object}	terrainData	Object containing information about the terrain
 */
ScaledGen.prototype.AddTerrain = function(terrainData) {
    this.mainMap.AddTerrain(terrainData);
};

/**
 * Assigns Starting Condition to a Particular Layer
 * @param {object}	conditionData Object containing information about the starting condition
 */
ScaledGen.prototype.AddStartingCondition = function(conditionData) {
    this.mainMap.AddStartingCondition(conditionData);
};

/**
 * Assigns a Validation Rule to a Particular Layer
 * @param {object}	ruleData Object containing information about the rule
 */
ScaledGen.prototype.AddValidationRule = function(ruleData) {
    this.mainMap.AddValidationRule(ruleData);
};

/**
 * Main Function to start the Map Generation Process
 * Process goes on until a valid map has been generated or the max tries have finished
 */
ScaledGen.prototype.GenerateMap = function() {
    var validStatus = false;
    var tries = 0;
    do {
        this.mainMap.GenerateMapValues();
        validStatus = this.mainMap.CheckRegularTerrainValidity();
        tries++;
    } while (validStatus === false && tries < this.maxTries);
    if (validStatus === false) {
        Commons.Error("Unable to Validate Map. Perhaps Conditions set are too Strict.");
    }
};

/**
 * Generates an HTML Representation of the 2D Matrix generated by ScaledJS
 */
ScaledGen.prototype.RenderMapValues = function(identifier) {
    var map_element = document.getElementById(identifier);
    map_element.innerHTML = "";
    var mapValues = this.mainMap.mapValues;
    var mapHtml = "";
    for (var rowKey in mapValues) {
        mapHtml += this.GenerateRow(mapValues[rowKey]);
    }
    map_element.innerHTML = mapHtml;
};

/**
 * Generates an HTML Row for the Map
 * @param {Array} rowValues	Contains an Array of Values
 */
ScaledGen.prototype.GenerateRow = function(rowValues) {
    var rowHtml = "<div class='row'>";
    for (var columnKey in rowValues) {
        rowHtml += this.GenerateCell(rowValues[columnKey]);
    }
    rowHtml += "</div>";
    return rowHtml;
};

/**
 * Generates an HTML Cell for the Map
 * @param {integer} cellValue Cell Value
 */
ScaledGen.prototype.GenerateCell = function(cellValue) {
    var responsibleTerrains = this.mainMap.GetLayersFromValue(cellValue);
    var terrainKey = "no-cell";
    for (var key in responsibleTerrains) {
        if (responsibleTerrains[key].IsRegularTerrain() === true) {
            terrainKey = responsibleTerrains[key].terrainKey;
            break;
        }
    }
    var html = "";
    html += "<div class='cell " + terrainKey + " ";
    html += "data-value='" + cellValue + "' ";
    html += "'>";
    html += "</div>";
    return html;
};