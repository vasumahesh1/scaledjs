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

var ScaledMap = function() {
    this.terrains = [];
    this.mapValues = [];
    this.rowSize = 33;
    this.columnSize = 33;
    this.mapInitValue = -1;
    this.hasDefaultTerrain = false;
    this.startTerrainKeys = [ "", "", "", "" ];
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
    mapValues[posX - halfBoxSize][posY] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX - boxSize, posY) ]);
    Commons.Log("Value of [" + (posX - halfBoxSize) + "][" + posY + "]", mapValues[posX - halfBoxSize][posY], Commons.validLogKeys.diamondSquareLogKey);
    Commons.Log("Getting Avreage of", [ "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX + boxSize) + "],[" + posY + "]" ], Commons.validLogKeys.diamondSquareLogKey);
    mapValues[posX + halfBoxSize][posY] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX + boxSize, posY) ]);
    Commons.Log("Value of [" + (posX + halfBoxSize) + "][" + posY + "]", mapValues[posX + halfBoxSize][posY]);
    Commons.Log("Getting Avreage of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + (posY - boxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
    mapValues[posX][posY - halfBoxSize] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY - boxSize) ]);
    Commons.Log("Value of [" + posX + "][" + (posY - halfBoxSize) + "]", mapValues[posX][posY - halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
    Commons.Log("Getting Avreage of", [ "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + posX + "],[" + (posY + boxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
    mapValues[posX][posY + halfBoxSize] = Commons.GetAverage([ Commons.TryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY), Commons.TryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize), Commons.TryGetArrayValue(mapValues, posX, posY + boxSize) ]);
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

var ScaledGen = function(settingsData) {
    if (settingsData) {
        if ("debug" in settingsData && settingsData["debug"] === true) {
            Commons.debug = true;
        }
        if ("logs" in settingsData) {
            Commons.allowedLogs = settingsData["logs"];
        }
        if ("onProgressUpdate" in settingsData) {
            Commons.showProgressUpdate = settingsData["onProgressUpdate"];
        }
    }
    this.mainMap = new ScaledMap();
};

ScaledGen.prototype.SetMapSize = function(rowSize, columnSize) {
    this.mainMap["rowSize"] = rowSize;
    this.mainMap["columnSize"] = columnSize;
};

ScaledGen.prototype.AddTerrain = function(terrainData) {
    this.mainMap.AddTerrain(terrainData);
};

ScaledGen.prototype.AddStartingCondition = function(conditionData) {
    this.mainMap.AddStartingCondition(conditionData);
};

ScaledGen.prototype.GenerateMap = function() {
    this.mainMap.GenerateMapValues();
};

ScaledGen.prototype.RenderMapValues = function(identifier) {
    var map_element = document.getElementById(identifier);
    var mapValues = this.mainMap.mapValues;
    var mapHtml = "";
    for (var rowKey in mapValues) {
        mapHtml += this.GenerateRow(mapValues[rowKey]);
    }
    map_element.innerHTML = mapHtml;
};

ScaledGen.prototype.GenerateRow = function(rowValues) {
    var rowHtml = "<div class='row'>";
    for (var columnKey in rowValues) {
        rowHtml += this.GenerateCell(rowValues[columnKey]);
    }
    rowHtml += "</div>";
    return rowHtml;
};

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