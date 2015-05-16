// ----- Construct -----
var Commons = {
    debug: false,
    allowedLogs: [ "all" ],
    validLogKeys: {
        mapInitializeLogKey: "mapInit",
        diamondSquareLogKey: "diamondSquare",
        mapValidationLogKey: "mapValidation",
        mapRenderLogKey: "mapRender"
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
    var terrains = [];
    var mapValues = [];
    var mapValidityReports = [];
    var rowSize = 33;
    var columnSize = 33;
    var mapInitValue = -1;
    var hasDefaultTerrain = false;
    var startTerrainKeys = [ "", "", "", "" ];
    var startTerrainValues = [];
    var isInited = false;
    var GetDefaultTerrain = function() {
        for (var key in terrains) {
            if (terrains[key].terrainDefault === true) {
                return terrains[key];
            }
        }
    };
    var GetMainTerrains = function() {
        var regularTerrains = [];
        for (var key in terrains) {
            if (terrains[key].getData().terrainType == "terrain") {
                regularTerrains.push(terrains[key].getData());
            }
        }
        return regularTerrains;
    };
    var GetTerrainByKey = function(terrainKeyValue) {
        for (var key in terrains) {
            if (terrains[key].terrainKey == terrainKeyValue) {
                return terrains[key];
            }
        }
    };
    /**
	 * Gets the Percentage for a Particular Layer
	 * @param {string}	layerKey	Contains the key associated to the layer
	 */
    var GetLayerPercentage = function(layerKey) {
        var selectedCount = 0;
        var totalCount = rowSize * columnSize;
        var terrainObject = GetTerrainByKey(layerKey);
        for (var mapRow in mapValues) {
            for (var mapColumn in mapValues) {
                if (mapValues[mapRow][mapColumn] <= terrainObject.terrainUpperValue && mapValues[mapRow][mapColumn] >= terrainObject.terrainLowerValue) {
                    selectedCount++;
                }
            }
        }
        var percent = selectedCount / totalCount * 100;
        Commons.Log(terrainObject.terrainKey + " Percentage of Terrain", percent, Commons.validLogKeys.mapValidationLogKey);
        return percent;
    };
    /**
	 * Initializes the Map
	 */
    var Init = function() {
        if (isInited === false) {
            if (hasDefaultTerrain === false) {
                terrains[0].SetDefault();
            }
            for (i = 0; i < rowSize; i++) {
                var tempArray = [];
                for (j = 0; j < columnSize; j++) {
                    tempArray.push(mapInitValue);
                }
                mapValues.push(tempArray);
            }
            Commons.Log("Map Values Empty", mapValues, Commons.validLogKeys.mapInitializeLogKey);
            isInited = true;
        }
    };
    /**
	 * Initializes the Starting Conditions of the Map
	 */
    var InitStartingConditions = function() {
        // Init Global Vars - Important If the Generation is Re Done
        startTerrainKeys = [ "", "", "", "" ];
        startTerrainValues = [];
        var minCountArray = [];
        var totalMin = 0;
        // Get Valid Terrains
        // i.e. Main Terrains Only
        var regularTerrains = GetMainTerrains();
        Commons.Log("Regular Terrains", regularTerrains, Commons.validLogKeys.mapInitializeLogKey);
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
                    startTerrainKeys[value] = minCountArray[minKey]["terrainKey"];
                }
            }
        } else if (totalMin > 4) {
            console.warn("Cannot have more than 4 starting conditions as a Rectangular map has only 4 vertices");
        }
        Commons.Log("Empty Non Optional Slots to Use", remainingSlots, Commons.validLogKeys.mapInitializeLogKey);
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
                    startTerrainKeys[remainingValue] = terrainToUse;
                }
            }
        }
        Commons.Log("Start Terrain Keys", startTerrainKeys, Commons.validLogKeys.mapInitializeLogKey);
        for (var startTerrainKey in startTerrainKeys) {
            var terrainObject = GetTerrainByKey(startTerrainKeys[startTerrainKey]);
            startTerrainValues.push(terrainObject.GetRandomTerrainValue());
        }
        Commons.Log("Start Terrain Values", startTerrainValues, Commons.validLogKeys.mapInitializeLogKey);
        mapValues[0][0] = startTerrainValues[0];
        mapValues[0][columnSize - 1] = startTerrainValues[1];
        mapValues[rowSize - 1][0] = startTerrainValues[2];
        mapValues[rowSize - 1][columnSize - 1] = startTerrainValues[3];
        Commons.Log("Map Values After Starting Values", mapValues, Commons.validLogKeys.mapInitializeLogKey);
    };
    /**
	 * Does a Final Clean up of the map values.
	 */
    var PostGenerationCleanUp = function() {
        for (var mapRow in mapValues) {
            for (var mapColumn in mapValues) {
                if (mapValues[mapRow][mapColumn] < 0) {
                    mapValues[mapRow][mapColumn] = 0;
                }
                if (mapValues[mapRow][mapColumn] > 100) {
                    mapValues[mapRow][mapColumn] = 100;
                }
            }
        }
        mapValidityReports = [];
    };
    /**
	 * Does a Clean Up before the Generation
	 */
    var PreGenerationCleanUp = function() {
        if (mapValidityReports.length !== 0) {}
    };
    /**
	 * Modified Version of a Diamond Square Algorithm with extra Variation Added
	 * @param  {Array}		mapValues   Map on which Diamond Square to be applied
	 * @param  {integer}	boxSize 	Size of the Box. (Last Index of the box)
	 * @param  {Array}		repairSalt 	Contains information regarding the Repair needed
	 * @return {Array}		mapValues 	Final Modified Map
	 */
    var diamondSquare = function(boxSize, repairSalt) {
        Commons.Warn("Diamond Step Starting");
        diamondStep(boxSize / 2, boxSize / 2, boxSize, repairSalt);
        Commons.Warn("Square Step Starting");
        squareStep(boxSize / 2, boxSize / 2, boxSize, repairSalt);
    };
    var diamondStep = function(posX, posY, boxSize, repairSalt) {
        //Commons.Log("MAP VALUES BEFORE STEP", mapValues, Commons.validLogKeys.diamondSquareLogKey);
        var halfBoxSize = Math.floor(boxSize / 2);
        var quartBoxSize = Math.floor(halfBoxSize / 2);
        Commons.Log("HalfBoxSize", halfBoxSize, Commons.validLogKeys.diamondSquareLogKey);
        Commons.Log("QuarterBoxSize", quartBoxSize, Commons.validLogKeys.diamondSquareLogKey);
        Commons.Log("Getting Average of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX][posY] = Commons.GetAverage([ mapValues[posX - halfBoxSize][posY - halfBoxSize], mapValues[posX - halfBoxSize][posY + halfBoxSize], mapValues[posX + halfBoxSize][posY - halfBoxSize], mapValues[posX + halfBoxSize][posY + halfBoxSize] ]);
        Commons.Log("Value of Center [" + posX + "][" + posY + "]", mapValues[posX][posY], Commons.validLogKeys.diamondSquareLogKey);
        if (halfBoxSize >= 2) {
            diamondStep(posX - quartBoxSize, posY - quartBoxSize, halfBoxSize, repairSalt);
            diamondStep(posX + quartBoxSize, posY - quartBoxSize, halfBoxSize, repairSalt);
            diamondStep(posX - quartBoxSize, posY + quartBoxSize, halfBoxSize, repairSalt);
            diamondStep(posX + quartBoxSize, posY + quartBoxSize, halfBoxSize, repairSalt);
        }
    };
    var squareStep = function(posX, posY, boxSize, repairSalt) {
        var halfBoxSize = Math.floor(boxSize / 2);
        var quartBoxSize = Math.floor(halfBoxSize / 2);
        Commons.Log("HalfBoxSize", halfBoxSize, Commons.validLogKeys.diamondSquareLogKey);
        Commons.Log("QuarterBoxSize", quartBoxSize, Commons.validLogKeys.diamondSquareLogKey);
        Commons.Log("Getting Average of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX - boxSize) + "],[" + posY + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX - halfBoxSize][posY] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX - boxSize, posY) ]) + Commons.RandomizePlusMinus(0, 5);
        Commons.Log("Value of [" + (posX - halfBoxSize) + "][" + posY + "]", mapValues[posX - halfBoxSize][posY], Commons.validLogKeys.diamondSquareLogKey);
        Commons.Log("Getting Average of", [ "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX + boxSize) + "],[" + posY + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX + halfBoxSize][posY] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX + boxSize, posY) ]) + Commons.RandomizePlusMinus(0, 5);
        Commons.Log("Value of [" + (posX + halfBoxSize) + "][" + posY + "]", mapValues[posX + halfBoxSize][posY]);
        Commons.Log("Getting Average of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + (posY - boxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX][posY - halfBoxSize] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY - boxSize) ]) + Commons.RandomizePlusMinus(0, 5);
        Commons.Log("Value of [" + posX + "][" + (posY - halfBoxSize) + "]", mapValues[posX][posY - halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
        Commons.Log("Getting Average of", [ "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + posX + "],[" + (posY + boxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX][posY + halfBoxSize] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY + boxSize) ]) + Commons.RandomizePlusMinus(0, 5);
        Commons.Log("Value of [" + posX + "][" + (posY + halfBoxSize) + "]", mapValues[posX][posY + halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
        //Commons.Log("MAP VALUES AFTER STEP", mapValues, Commons.validLogKeys.diamondSquareLogKey);
        if (halfBoxSize >= 2) {
            squareStep(posX - quartBoxSize, posY - quartBoxSize, halfBoxSize, repairSalt);
            squareStep(posX + quartBoxSize, posY - quartBoxSize, halfBoxSize, repairSalt);
            squareStep(posX - quartBoxSize, posY + quartBoxSize, halfBoxSize, repairSalt);
            squareStep(posX + quartBoxSize, posY + quartBoxSize, halfBoxSize, repairSalt);
        }
    };
    /**
	 * Sets the Dimensions received from the generator
	 * @param {integer}	rowSize Size of the Row
	 * @param {integer} columnSize Size of the Column
	 */
    this.SetDimensions = function(_rowSize, _columnSize) {
        rowSize = _rowSize;
        columnSize = _columnSize;
    };
    /**
	 * Adds a Scaled Terrain Object to a Map Instance
	 * @param {object}	terrainObject	Object containing information about the terrain
	 */
    this.AddTerrain = function(terrainObject) {
        var terrainData = new ScaledTerrain();
        if ("zLevel" in terrainObject) {
            terrainData.CreateTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min, terrainObject.zLevel);
        } else {
            terrainData.CreateTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min, 0);
        }
        if ("type" in terrainObject) {
            terrainData.SetType(terrainObject.type);
        }
        if ("default" in terrainObject && hasDefaultTerrain === false) {
            hasDefaultTerrain = true;
            terrainData.SetDefault();
        }
        Commons.Log("Adding Terrain", terrainData.getData(), Commons.validLogKeys.mapInitializeLogKey);
        terrains.push(terrainData);
    };
    /**
	 * Assigns Starting Condition to a Particular Layer
	 * @param {object}	conditionObject Object containing information about the starting condition
	 */
    this.AddStartingCondition = function(conditionObject) {
        var terrainObject = GetTerrainByKey(conditionObject["terrainKey"]);
        terrainObject.SetStartingCondition(conditionObject["minCount"], conditionObject["optionalPercent"]);
    };
    /**
	 * Assigns a Validation Rule to a Particular Layer
	 * @param {object} Object containing information about the rule
	 */
    this.AddValidationRule = function(ruleObject) {
        var terrainKey = ruleObject["terrainKey"];
        var minValue = -1;
        var maxValue = -1;
        if ("minPercent" in ruleObject) {
            minValue = ruleObject["minPercent"];
        }
        if ("maxPercent" in ruleObject) {
            maxValue = ruleObject["maxPercent"];
        }
        GetTerrainByKey(terrainKey).SetValidation(minValue, maxValue);
    };
    /**
	 * Checks the Validity of the Main Terrains. Based on the Validation Rules set.
	 */
    this.CheckRegularTerrainValidity = function() {
        var regularTerrains = GetMainTerrains();
        var validStatus = true;
        for (var key in regularTerrains) {
            var percent = GetLayerPercentage(regularTerrains[key].terrainKey);
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
                mapValidityReports.push(validityReport);
            }
        }
        Commons.Log("Validity Reports", mapValidityReports, Commons.validLogKeys.mapValidationLogKey);
        return validStatus;
    };
    /**
	 * Main Function invoked to Generate the Map from scratch.
	 */
    this.GenerateMapValues = function() {
        Commons.Warn("Map Init Starting");
        Commons.Log("Terrains Before Map Generation", terrains, Commons.validLogKeys.mapInitializeLogKey);
        Init();
        InitStartingConditions();
        PreGenerationCleanUp();
        Commons.Warn("Diamond Square Algorithm Starting");
        diamondSquare(rowSize - 1, null);
        PostGenerationCleanUp();
    };
    /**
	 * Specifies the List of layers to which the particular Cell Value belongs to
	 * @param {double}	terrainValue   Value of the Cell
	 */
    this.GetLayersFromValue = function(terrainValue) {
        var selectedTerrains = [];
        for (var key in terrains) {
            if (terrains[key].getData().terrainUpperValue >= terrainValue && terrains[key].getData().terrainLowerValue <= terrainValue) {
                selectedTerrains.push(terrains[key]);
            }
        }
        return selectedTerrains;
    };
    /**
	 * Main Function invoked to Generate the Map from scratch.
	 */
    this.GetMapValues = function() {
        return mapValues;
    };
};

var ScaledTerrain = function() {
    this.terrainKey = -1;
    var terrainUpperValue = -1;
    var terrainLowerValue = -1;
    var terrainLabel = -1;
    var terrainZLevel = -1;
    var terrainType = "terrain";
    var terrainDefault = false;
    var terrainStartCount = 0;
    var terrainStartPercent = 0;
    var terrainValidationMinPercent = -1;
    var terrainValidationMaxPercent = -1;
    this.CreateTerrain = function(_terrainLabel, _terrainKey, _terrainUpperValue, _terrainLowerValue, _terrainZLevel) {
        this.terrainKey = _terrainKey;
        terrainUpperValue = _terrainUpperValue;
        terrainLowerValue = _terrainLowerValue;
        terrainLabel = _terrainLabel;
        terrainZLevel = _terrainZLevel;
    };
    this.SetStartingCondition = function(_terrainStartCount, _terrainStartPercent) {
        terrainStartPercent = _terrainStartPercent;
        terrainStartCount = _terrainStartCount;
    };
    this.SetDefault = function() {
        terrainDefault = true;
    };
    this.SetType = function(_terrainType) {
        terrainType = _terrainType;
    };
    this.GetRandomTerrainValue = function() {
        return Commons.Randomize(terrainLowerValue, terrainUpperValue);
    };
    this.IsRegularTerrain = function() {
        if (terrainType == "terrain") {
            return true;
        }
        return false;
    };
    this.SetValidation = function(minValue, maxValue) {
        this.terrainValidationMinPercent = minValue;
        this.terrainValidationMaxPercent = maxValue;
    };
    this.getData = function() {
        var returnObject = {
            terrainKey: this.terrainKey,
            terrainUpperValue: terrainUpperValue,
            terrainLowerValue: terrainLowerValue,
            terrainLabel: terrainLabel,
            terrainZLevel: terrainZLevel,
            terrainType: terrainType,
            terrainDefault: terrainDefault,
            terrainStartCount: terrainStartCount,
            terrainStartPercent: terrainStartPercent,
            terrainValidationMinPercent: terrainValidationMinPercent,
            terrainValidationMaxPercent: terrainValidationMaxPercent
        };
        return returnObject;
    };
};

var ScaledValidityReport = function(terrainKey, magnitude, isPositive) {
    this.terrainKey = terrainKey;
    this.repairMagnitude = magnitude;
    this.positiveIncrease = isPositive;
};

var ScaledAutoReview = function(terrainObject, validityReport) {
    this.terrain = terrainObject;
    this.validityReport = validityReport;
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
 * Main Function for the Generator Object
 * @param {object}	settingsData	Configuring Settings of the Generator
 */
function ScaledGen(settingsData) {
    var maxTries = 10;
    var mainMap = new ScaledMap();
    if (settingsData) {
        if ("debug" in settingsData && settingsData["debug"] === true) {
            Commons.debug = true;
        }
        if ("logs" in settingsData) {
            Commons.allowedLogs = settingsData["logs"];
        }
        if ("maxTries" in settingsData) {
            maxTries = settingsData["maxTries"];
        }
        if ("onProgressUpdate" in settingsData) {
            Commons.showProgressUpdate = settingsData["onProgressUpdate"];
        }
    }
    /**
	 * Gets the Map Values (2D Array) for the User
	 */
    this.GetMapValues = function() {
        return mainMap.mapValues;
    };
    /**
	 * Sets the Map Size
	 * @param {integer}	rowSize Size of the Row
	 * @param {integer} columnSize Size of the Column
	 */
    this.SetMapSize = function(rowSize, columnSize) {
        mainMap["rowSize"] = rowSize;
        mainMap["columnSize"] = columnSize;
    };
    /**
	 * Adds a Scaled Terrain Object to a Map Instance
	 * @param {object}	terrainData	Object containing information about the terrain
	 */
    this.AddTerrain = function(terrainData) {
        mainMap.AddTerrain(terrainData);
    };
    /**
	 * Assigns Starting Condition to a Particular Layer
	 * @param {object}	conditionData Object containing information about the starting condition
	 */
    this.AddStartingCondition = function(conditionData) {
        mainMap.AddStartingCondition(conditionData);
    };
    /**
	 * Assigns a Validation Rule to a Particular Layer
	 * @param {object}	ruleData Object containing information about the rule
	 */
    this.AddValidationRule = function(ruleData) {
        mainMap.AddValidationRule(ruleData);
    };
    /**
	 * Main Function to start the Map Generation Process
	 * Process goes on until a valid map has been generated or the max tries have finished
	 */
    this.GenerateMap = function() {
        var validStatus = false;
        var tries = 0;
        do {
            mainMap.GenerateMapValues();
            validStatus = mainMap.CheckRegularTerrainValidity();
            tries++;
        } while (validStatus === false && tries < maxTries);
        if (validStatus === false) {
            Commons.Error("Unable to Validate Map. Perhaps Conditions set are too Strict.");
        }
    };
    /**
	 * Generates an HTML Representation of the 2D Matrix generated by ScaledJS
	 */
    this.RenderMapValues = function(identifier) {
        var map_element = document.getElementById(identifier);
        map_element.innerHTML = "";
        var mapValues = mainMap.GetMapValues();
        var mapHtml = "";
        for (var rowKey in mapValues) {
            mapHtml += GenerateRow(mapValues[rowKey]);
        }
        map_element.innerHTML = mapHtml;
    };
    /**
	 * Generates an HTML Row for the Map
	 * @param {Array} rowValues	Contains an Array of Values
	 */
    var GenerateRow = function(rowValues) {
        var rowHtml = "<div class='row'>";
        for (var columnKey in rowValues) {
            rowHtml += GenerateCell(rowValues[columnKey]);
        }
        rowHtml += "</div>";
        return rowHtml;
    };
    /**
	 * Generates an HTML Cell for the Map
	 * @param {integer} cellValue Cell Value
	 */
    var GenerateCell = function(cellValue) {
        var responsibleTerrains = mainMap.GetLayersFromValue(cellValue);
        Commons.Log("Terrains For Cell Value : " + cellValue, responsibleTerrains, Commons.validLogKeys.mapRenderLogKey);
        var terrainKey = "no-cell";
        for (var key in responsibleTerrains) {
            if (responsibleTerrains[key].IsRegularTerrain() === true) {
                terrainKey = responsibleTerrains[key].getData().terrainKey;
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
}