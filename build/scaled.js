// The MIT License (MIT)
// Copyright (c) 2015 Vasu Mahesh (vasu.mahesh@[gmail|yahoo|hotmail].com)
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
/*
 * Establish the root object, `window` (`self`) in the browser, `global`
 * on the server, or `this` in some virtual machines. We use `self`
 * instead of `window` for `WebWorker` support.
 */
var root = typeof self === "object" && self.self === self && self || typeof global === "object" && global.global === global && global || this;

/**
 * Main Function for the Generator Object
 * @param {object}	settingsData	Configuring Settings of the Generator
 */
function ScaledGen(settingsData) {
    var maxTries = 10;
    var mainMap = new ScaledMap();
    var scaledTmx = null;
    var domSettings = null;
    var tilesetSettings = null;
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
    this.getMapValues = function() {
        return mainMap.getMapValues();
    };
    /**
	 * Sets the Map Size
	 * @param {integer}	rowSize Size of the Row
	 * @param {integer} columnSize Size of the Column
	 */
    this.setMapSize = function(rowSize, columnSize) {
        mainMap.setDimensions(rowSize, columnSize);
    };
    /**
	 * Adds a Scaled Terrain Object to a Map Instance
	 * @param {object}	terrainData	Object containing information about the terrain
	 */
    this.addTerrain = function(terrainData) {
        mainMap.addTerrain(terrainData);
    };
    /**
	 * Assigns Starting Condition to a Particular Layer
	 * @param {object}	conditionData Object containing information about the starting condition
	 */
    this.addStartingCondition = function(conditionData) {
        mainMap.addStartingCondition(conditionData);
    };
    /**
	 * Assigns a Validation Rule to a Particular Layer
	 * @param {object}	ruleData Object containing information about the rule
	 */
    this.addValidationRule = function(ruleData) {
        mainMap.addValidationRule(ruleData);
    };
    /**
	 * Assigns a Validation Rule to a Particular Layer
	 * @param {object}	dominationData Object containing information about the rule
	 */
    this.addLayerDomination = function(dominationData) {
        domSettings = dominationData;
    };
    /**
	 * Adds TileSet Settings to be Used in TMX XML
	 * @param {object}	tilesetData Object containing information about the rule
	 */
    this.addTileset = function(tilesetData) {
        tilesetSettings = tilesetData;
    };
    this.setTileInfo = function(tileData) {
        mainMap.setTileInfo(tileData);
    };
    /**
	 * Main Function to start the Map Generation Process
	 * Process goes on until a valid map has been generated or the max tries have finished
	 */
    this.generateMapValues = function() {
        var validStatus = false;
        var tries = 0;
        do {
            mainMap.generateMapValues();
            validStatus = mainMap.checkRegularTerrainValidity();
            tries++;
        } while (validStatus === false && tries < maxTries);
        if (validStatus === false) {
            Commons.error("Unable to Validate Map. Perhaps Conditions set are too Strict.");
        }
    };
    /**
	 * Generates the Entire Map from
	 * From 2D Array to 3D Layered Maps to TMX Tiled XML
	 */
    this.generateMap = function() {
        this.generateMapValues();
        if (domSettings && tilesetSettings) {
            var scaledTmxSettings = mainMap.getTmxSettings();
            scaledTmxSettings.domSettings = domSettings;
            scaledTmxSettings.tilesetSettings = tilesetSettings;
            scaledTmx = new ScaledTmxGen(scaledTmxSettings);
            scaledTmx.generateMapTmx();
        } else {
            Commons.warn("No Domination Settings / TileSet Settings provided skipping TMX Generation");
        }
    };
    this.getTmxXml = function() {
        return scaledTmx.getTmxXml();
    };
    /**
	 * Generates an HTML Representation of the 2D Matrix generated by ScaledJS
	 */
    this.renderMapValues = function(identifier) {
        var map_element = document.getElementById(identifier);
        map_element.innerHTML = "";
        var mapValues = mainMap.getMapValues();
        var mapHtml = "";
        for (var rowKey in mapValues) {
            mapHtml += generateRow(mapValues[rowKey]);
        }
        map_element.innerHTML = mapHtml;
    };
    /**
	 * Gets the percentages of all the Regular Terrains in the Map
	 * @return {object} Indexed {terrainKey, percentage}
	 */
    this.getRegularTerrainPercentages = function() {
        return mainMap.getRegularTerrainPercentages();
    };
    /**
	 * Generates an HTML Row for the Map
	 * @param {Array} rowValues	Contains an Array of Values
	 */
    var generateRow = function(rowValues) {
        var rowHtml = "<div class='row'>";
        for (var columnKey in rowValues) {
            rowHtml += generateCell(rowValues[columnKey]);
        }
        rowHtml += "</div>";
        return rowHtml;
    };
    /**
	 * Generates an HTML Cell for the Map
	 * @param {integer} cellValue Cell Value
	 */
    var generateCell = function(cellValue) {
        var responsibleTerrains = mainMap.getLayersFromValue(cellValue);
        Commons.log("Terrains For Cell Value : " + cellValue, responsibleTerrains, Commons.validLogKeys.mapRenderLogKey);
        var terrainKey = "no-cell";
        for (var key in responsibleTerrains) {
            if (responsibleTerrains[key].isRegularTerrain() === true) {
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

/*
 * Export the ScaledGen object for **Node.js**, with
 * backwards-compatibility for their old module API. If we're in
 * the browser, add `ScaledGen` as a global object.
 */
if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
        exports = module.exports = ScaledGen;
    }
    exports.ScaledGen = ScaledGen;
} else {
    root.ScaledGen = ScaledGen;
}

// ----- Construct -----
var Commons = {
    debug: false,
    allowedLogs: [ "all" ],
    validLogKeys: {
        mapInitializeLogKey: "mapInit",
        diamondSquareLogKey: "diamondSquare",
        mapValidationLogKey: "mapValidation",
        mapRenderLogKey: "mapRender",
        tmxRenderLogKey: "tmxRender",
        decorationRenderLogKey: "decorationRender"
    },
    showProgressUpdate: function() {}
};

// ----- Declare Vars Here -----
var PLUS_MINUS_BAR = 4;

/**
 * Wrapper Logging Function over console.log
 * @param {string} message Logs a Message
 * @param {object} object  Prints any Object if Given
 */
Commons.consoleLog = function(message, object) {
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
Commons.log = function(message, logObject, tag) {
    if (this.debug === true && (this.allowedLogs.indexOf(tag) != -1 || this.allowedLogs[0] == "all")) {
        this.consoleLog(message, logObject);
    }
};

/**
 * Wrapper Logging Function over console.warn
 * @param {string} message Message to Warn
 */
Commons.warn = function(message) {
    if (this.debug === true) {
        console.warn("[ScaledGen - Warning] " + message);
    }
};

/**
 * Wrapper Logging Function over console.info
 * @param {string} message Message to provide Information
 */
Commons.info = function(message) {
    if (this.debug === true) {
        console.info("[ScaledGen - Warning] " + message);
    }
};

/**
 * Wrapper Logging Function over console.error
 * @param {string} message Message to print
 */
Commons.error = function(message) {
    if (this.debug === true) {
        console.error("[ScaledGen - Error] " + message);
    }
};

/**
 * Wrapper Function over Math.round
 * @param {float} number Number to round
 */
Commons.roundNumber = function(number) {
    return Math.round(number);
};

/**
 * Common RNG Function to generate random numbers in a given range
 * @param {int} minValue Start Range
 * @param {int} maxValue End Range
 */
Commons.randomize = function(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
};

/**
 * Selects a Random value in the array values
 * @param {array} arrayList Array of Values
 */
Commons.randomizeInArray = function(arrayList) {
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
Commons.randomizeWithException = function(minValue, maxValue, exceptList) {
    var value = -1;
    do {
        value = this.randomize(minValue, maxValue);
    } while (exceptList.indexOf(value) != -1);
    return value;
};

/**
 * Common RNG Function to generate random numbers in a given range
 * with a possibility of Negative
 * @param {int} minValue Start Range
 * @param {int} maxValue End Range
 */
Commons.randomizePlusMinus = function(minValue, maxValue) {
    var barValue = this.randomize(1, 10);
    var randomValue = this.randomize(minValue, maxValue);
    if (barValue <= PLUS_MINUS_BAR) {
        return barValue * -1;
    }
    return barValue;
};

/**
 * Gets the average of an Array. Also makes sure that Invalid entries don't account for the sum
 * @param {[type]} arrayList Array Values
 */
Commons.getAverage = function(arrayList) {
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
Commons.tryGetArrayValue = function(arrayList, posX, posY) {
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
Commons.isPointAtEdge = function(arrayList, posX, posY) {
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
Commons.getDefaultTerrain = function(terrains) {
    for (var key in terrains) {
        if (terrains[key].getData().terrainDefault === true) {
            return terrains[key];
        }
    }
};

/**
 * Gets the Terrains Responsible for Terrain Generation
 * @param {array} terrains Array of Terrains
 */
Commons.getMainTerrains = function(terrains) {
    var regularTerrains = [];
    for (var key in terrains) {
        if (terrains[key].isRegularTerrain() === true) {
            regularTerrains.push(terrains[key].getData());
        }
    }
    return regularTerrains;
};

/**
 * Remove all occurences of a given Value from an Array
 *
 * @param      {array}  array   Array of Values
 * @param      {value}  value   Value to Remove
 */
Commons.removeKeyFromArray = function(array, value) {
    for (var key in array) {
        if (array[key] === value) {
            array.splice(key, 1);
        }
    }
};

/**
 * Gets the Terrains Responsible for Decoration
 * @param {array} terrains Array of Terrains
 */
Commons.getDecorationTerrains = function(terrains) {
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
Commons.getTerrainByKey = function(terrains, terrainKeyValue) {
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
Commons.getTerrainMaximum = function(terrains) {
    var maxValue = -1;
    var responsibleTerrain = null;
    for (var key in terrains) {
        if (terrains[key].isRegularTerrain() === true) {
            if (terrains[key].getData().terrainUpperValue > maxValue) {
                maxValue = terrains[key].getData().terrainUpperValue;
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
Commons.getTerrainMinimum = function(terrains) {
    var minValue = 101;
    var responsibleTerrain = null;
    for (var key in terrains) {
        if (terrains[key].isRegularTerrain() === true) {
            if (terrains[key].getData().terrainLowerValue < minValue) {
                minValue = terrains[key].getData().terrainLowerValue;
                responsibleTerrain = terrains[key];
            }
        }
    }
    return responsibleTerrain;
};

var ScaledEdgeDetector = function(edgeSettings) {
    var terrains = edgeSettings.terrains;
    var domination = edgeSettings.domination;
    var domPriority = domination.dominationPriority;
    var getDominationValue = function(terrainKey) {
        return domPriority.indexOf(terrainKey);
    };
    var getDominationKey = function(dominationIndex) {
        return domPriority[dominationIndex];
    };
    var sortDominationAscending = function(a, b) {
        return a - b;
    };
    var getUnique = function(arr) {
        var u = {}, a = [];
        for (var i = 0, l = arr.length; i < l; ++i) {
            if (u.hasOwnProperty(arr[i])) {
                continue;
            }
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
        return a;
    };
    var normalizeAdjacency = function(primaryValue, arrayValues) {
        var normalizedValues = [];
        for (var key in arrayValues) {
            if (arrayValues[key] !== -1 && getDominationValue(arrayValues[key]) < getDominationValue(primaryValue)) {
                normalizedValues.push(arrayValues[key]);
            } else {
                normalizedValues.push(primaryValue);
            }
        }
        return normalizedValues;
    };
    var getLowestDomination = function(primaryValue, arrayValues) {
        var dominationValues = [];
        var returnValue;
        var primaryDominationValue = getDominationValue(primaryValue);
        for (var key in arrayValues) {
            if (arrayValues[key] !== -1) {
                var dominationValue = getDominationValue(arrayValues[key]);
                dominationValues.push(dominationValue);
            }
        }
        Commons.log("Primary Value", primaryValue, Commons.validLogKeys.tmxRenderLogKey);
        Commons.log("Surroundings", arrayValues, Commons.validLogKeys.tmxRenderLogKey);
        Commons.log("Before Unique", dominationValues, Commons.validLogKeys.tmxRenderLogKey);
        dominationValues = getUnique(dominationValues);
        Commons.log("After Unique", dominationValues, Commons.validLogKeys.tmxRenderLogKey);
        dominationValues.sort(sortDominationAscending);
        var lowestDomination = Math.min.apply(null, dominationValues);
        if (lowestDomination == primaryDominationValue) {
            returnValue = primaryDominationValue;
        } else {
            var primaryDominationIndex = dominationValues.indexOf(primaryDominationValue);
            if (primaryDominationIndex !== 0 && primaryDominationIndex != -1) {
                returnValue = dominationValues[primaryDominationIndex - 1];
            } else {
                returnValue = dominationValues[0];
            }
        }
        Commons.log("Returning", getDominationKey(returnValue), Commons.validLogKeys.tmxRenderLogKey);
        return getDominationKey(returnValue);
    };
    this.allSquareSidesSimilar = function(similarity) {
        if (similarity.top === true && similarity.left === true && similarity.right === true && similarity.bottom === true) {
            return true;
        }
        return false;
    };
    this.getDiagonalSimilarity = function(primaryValue, diagonalValues) {
        var similarity = {
            topLeft: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            count: 0
        };
        if (diagonalValues[0] == primaryValue) {
            similarity.topLeft = true;
            similarity.count++;
        }
        if (diagonalValues[1] == primaryValue) {
            similarity.topRight = true;
            similarity.count++;
        }
        if (diagonalValues[2] == primaryValue) {
            similarity.bottomRight = true;
            similarity.count++;
        }
        if (diagonalValues[3] == primaryValue) {
            similarity.bottomLeft = true;
            similarity.count++;
        }
        return similarity;
    };
    this.getAdjacentSimilarity = function(primaryValue, adjacentValues) {
        var similarity = {
            top: false,
            left: false,
            right: false,
            bottom: false,
            count: 0
        };
        if (adjacentValues[0] == primaryValue) {
            similarity.top = true;
            similarity.count++;
        }
        if (adjacentValues[1] == primaryValue) {
            similarity.right = true;
            similarity.count++;
        }
        if (adjacentValues[2] == primaryValue) {
            similarity.bottom = true;
            similarity.count++;
        }
        if (adjacentValues[3] == primaryValue) {
            similarity.left = true;
            similarity.count++;
        }
        return similarity;
    };
    this.resolveTileValue = function(primaryValue, adjacentValues, diagonalValues) {
        if (Commons.getDefaultTerrain(terrains).terrainKey == primaryValue) {
            return [];
        }
        Commons.log("Primary Cell Layer", primaryValue, Commons.validLogKeys.tmxRenderLogKey);
        Commons.log("Adjacent Values", adjacentValues, Commons.validLogKeys.tmxRenderLogKey);
        Commons.log("Diagonal Values", diagonalValues, Commons.validLogKeys.tmxRenderLogKey);
        var finalTiles = [];
        var primaryTerrain = Commons.getTerrainByKey(terrains, primaryValue);
        var lowestDomination = getLowestDomination(primaryValue, adjacentValues);
        Commons.log("Lowest Domination", lowestDomination, Commons.validLogKeys.tmxRenderLogKey);
        var lowestDominationTile = Commons.getTerrainByKey(terrains, lowestDomination).getTileData("other-tiles", "all", "fullValue");
        finalTiles.push(lowestDominationTile);
        var normalizedAdjacentValues = normalizeAdjacency(primaryValue, adjacentValues);
        var normalizedDiagonalValues = normalizeAdjacency(primaryValue, diagonalValues);
        var similarity = this.getAdjacentSimilarity(primaryValue, normalizedAdjacentValues);
        var diagonalSimilarity = this.getDiagonalSimilarity(primaryValue, normalizedDiagonalValues);
        Commons.log("Similarity", similarity, Commons.validLogKeys.tmxRenderLogKey);
        // All Similar or Not
        if (this.allSquareSidesSimilar(similarity) === true) {
            // All Similar
            finalTiles.push(primaryTerrain.getTileData("other-tiles", "all", "fullValue"));
        } else {
            // Nothing Similar : Calls for Closed Loops
            if (similarity.count === 0) {
                finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "noneValue"));
            } else {
                // All Sides Not Similar
                // Enclose Mode for 3 Side Adjacent Similarity
                if (similarity.top === true && similarity.left === true && similarity.right === true) {
                    finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "top", "topValue"));
                } else if (similarity.bottom === true && similarity.left === true && similarity.right === true) {
                    finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "bottom", "bottomValue"));
                } else if (similarity.top === true && similarity.bottom === true && similarity.right === true) {
                    finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "right", "rightValue"));
                } else if (similarity.top === true && similarity.bottom === true && similarity.left === true) {
                    finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "left", "leftValue"));
                } else if (similarity.top === true && similarity.left === true) {
                    finalTiles.push(primaryTerrain.getTileData("excluding-tiles", "bottom", "rightValue"));
                } else if (similarity.top === true && similarity.right === true) {
                    finalTiles.push(primaryTerrain.getTileData("excluding-tiles", "bottom", "leftValue"));
                } else if (similarity.bottom === true && similarity.left === true) {
                    finalTiles.push(primaryTerrain.getTileData("excluding-tiles", "top", "rightValue"));
                } else if (similarity.bottom === true && similarity.right === true) {
                    finalTiles.push(primaryTerrain.getTileData("excluding-tiles", "top", "leftValue"));
                } else if (similarity.bottom === true && similarity.top === true) {
                    finalTiles.push(primaryTerrain.getTileData("open-tiles", "parallel", "topBottomValue"));
                } else if (similarity.left === true && similarity.right === true) {
                    finalTiles.push(primaryTerrain.getTileData("open-tiles", "parallel", "leftRightValue"));
                } else if (similarity.top === true) {
                    finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "topValue"));
                } else if (similarity.right === true) {
                    finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "rightValue"));
                } else if (similarity.left === true) {
                    finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "leftValue"));
                } else if (similarity.bottom === true) {
                    finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "bottomValue"));
                }
            }
        }
        if (this.allSquareSidesSimilar(similarity) === true && diagonalSimilarity.count !== 4) {
            if (diagonalSimilarity.topLeft === false) {
                finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "bottom", "rightValue"));
            }
            if (diagonalSimilarity.topRight === false) {
                finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "bottom", "leftValue"));
            }
            if (diagonalSimilarity.bottomLeft === false) {
                finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "top", "rightValue"));
            }
            if (diagonalSimilarity.bottomRight === false) {
                finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "top", "leftValue"));
            }
        }
        Commons.log("Final Tiles", finalTiles, Commons.validLogKeys.tmxRenderLogKey);
        return finalTiles;
    };
};

/**
 * Constructor for Main Map Object
 */
var ScaledMap = function() {
    var terrains = [];
    var mapValues = [];
    var mapValuesNormalized = [];
    var mapValuesDecoration = [];
    var mapValidityReports = [];
    var rowSize = 33;
    var columnSize = 33;
    var mapInitValue = -1;
    var hasDefaultTerrain = false;
    var startTerrainKeys = [ "", "", "", "" ];
    var startTerrainValues = [];
    var isInited = false;
    var possibleTerrains = [ "terrain", "decoration" ];
    /**
	 * Gets the Percentage for a Particular Layer
	 * @param {string}	layerKey	Contains the key associated to the layer
	 */
    var getLayerPercentage = function(layerKey) {
        var selectedCount = 0;
        var totalCount = rowSize * columnSize;
        var terrainObject = Commons.getTerrainByKey(terrains, layerKey);
        for (var mapRow in mapValues) {
            for (var mapColumn in mapValues) {
                if (mapValues[mapRow][mapColumn] <= terrainObject.getData().terrainUpperValue && mapValues[mapRow][mapColumn] >= terrainObject.getData().terrainLowerValue) {
                    selectedCount++;
                }
            }
        }
        var percent = selectedCount / totalCount * 100;
        Commons.log(terrainObject.getData().terrainKey + " Percentage of Terrain", percent, Commons.validLogKeys.mapValidationLogKey);
        return percent;
    };
    /**
	 * Initializes the Map
	 */
    var init = function() {
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
            Commons.log("Map Values Empty", mapValues, Commons.validLogKeys.mapInitializeLogKey);
            isInited = true;
        }
    };
    /**
	 * Initializes the Starting Conditions of the Map
	 */
    var initStartingConditions = function() {
        // Init Global Vars - Important If the Generation is Re Done
        startTerrainKeys = [ "", "", "", "" ];
        startTerrainValues = [];
        var minCountArray = [];
        var totalMin = 0;
        // Get Valid Terrains
        // i.e. Main Terrains Only
        var regularTerrains = Commons.getMainTerrains(terrains);
        Commons.log("Regular Terrains", regularTerrains, Commons.validLogKeys.mapInitializeLogKey);
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
        minCountArray.sort(function(itemA, itemB) {
            return itemB["count"] - itemA["count"];
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
                    var value = Commons.randomizeWithException(0, 3, slotsUsed);
                    slotsUsed.push(value);
                    startTerrainKeys[value] = minCountArray[minKey]["terrainKey"];
                }
            }
        } else if (totalMin > 4) {
            console.warn("Cannot have more than 4 starting conditions as a Rectangular map has only 4 vertices");
        }
        Commons.log("Empty Non Optional Slots to Use", remainingSlots, Commons.validLogKeys.mapInitializeLogKey);
        // If free slots left. i.e. User has not given all 4 edge details
        if (remainingSlots !== 0) {
            var optionalKey = 0;
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
                Commons.warn("Optional percentages are not over 100, Normalizing Values to 0 to 100 Range");
                for (optionalKey in optionalArray) {
                    optionalArray[optionalKey]["cumulativePercent"] = optionalArray[optionalKey]["cumulativePercent"] / totalOptional * 100;
                }
            }
            for (i = 0; i < remainingSlots; i++) {
                // Getting a Random Slot from  0 to 3 with Exception of certain slots to Exclude
                var remainingValue = Commons.randomizeWithException(0, 3, slotsUsed);
                slotsUsed.push(remainingValue);
                var randomPercent = Commons.randomize(0, totalOptional);
                var terrainToUse = null;
                var found = false;
                for (optionalKey in optionalArray) {
                    if (randomPercent <= optionalArray[optionalKey]["cumulativePercent"]) {
                        found = true;
                        terrainToUse = optionalArray[optionalKey]["terrainKey"];
                        break;
                    }
                }
                if (found === false) {
                    terrainToUse = Commons.randomizeInArray(nonOptionalArray)["terrainKey"];
                }
                startTerrainKeys[remainingValue] = terrainToUse;
            }
        }
        Commons.log("Start Terrain Keys", startTerrainKeys, Commons.validLogKeys.mapInitializeLogKey);
        for (var startTerrainKey in startTerrainKeys) {
            var terrainObject = Commons.getTerrainByKey(terrains, startTerrainKeys[startTerrainKey]);
            startTerrainValues.push(terrainObject.getRandomTerrainValue());
        }
        Commons.log("Start Terrain Values", startTerrainValues, Commons.validLogKeys.mapInitializeLogKey);
        mapValues[0][0] = startTerrainValues[0];
        mapValues[0][columnSize - 1] = startTerrainValues[1];
        mapValues[rowSize - 1][0] = startTerrainValues[2];
        mapValues[rowSize - 1][columnSize - 1] = startTerrainValues[3];
        Commons.log("Map Values After Starting Values", mapValues, Commons.validLogKeys.mapInitializeLogKey);
    };
    /**
	 * Does a Final Clean up of the map values.
	 */
    var postGenerationCleanUp = function() {
        var maxTerrainValue = Commons.getTerrainMaximum(terrains).getData().terrainUpperValue;
        var minTerrainValue = Commons.getTerrainMinimum(terrains).getData().terrainLowerValue;
        for (var mapRow in mapValues) {
            for (var mapColumn in mapValues) {
                if (mapValues[mapRow][mapColumn] < minTerrainValue) {
                    mapValues[mapRow][mapColumn] = minTerrainValue;
                }
                if (mapValues[mapRow][mapColumn] > maxTerrainValue) {
                    mapValues[mapRow][mapColumn] = maxTerrainValue;
                }
            }
        }
        mapValidityReports = [];
    };
    /**
	 * Does a Clean Up before the Generation
	 */
    var preGenerationCleanUp = function() {
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
        Commons.info("Diamond Step Starting");
        diamondStep(boxSize / 2, boxSize / 2, boxSize, repairSalt);
        Commons.info("Square Step Starting");
        squareStep(boxSize / 2, boxSize / 2, boxSize, repairSalt);
    };
    var diamondStep = function(posX, posY, boxSize, repairSalt) {
        //Commons.log("MAP VALUES BEFORE STEP", mapValues, Commons.validLogKeys.diamondSquareLogKey);
        var halfBoxSize = Math.floor(boxSize / 2);
        var quartBoxSize = Math.floor(halfBoxSize / 2);
        Commons.log("HalfBoxSize", halfBoxSize, Commons.validLogKeys.diamondSquareLogKey);
        Commons.log("QuarterBoxSize", quartBoxSize, Commons.validLogKeys.diamondSquareLogKey);
        Commons.log("Getting Average of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX][posY] = Commons.getAverage([ mapValues[posX - halfBoxSize][posY - halfBoxSize], mapValues[posX - halfBoxSize][posY + halfBoxSize], mapValues[posX + halfBoxSize][posY - halfBoxSize], mapValues[posX + halfBoxSize][posY + halfBoxSize] ]);
        Commons.log("Value of Center [" + posX + "][" + posY + "]", mapValues[posX][posY], Commons.validLogKeys.diamondSquareLogKey);
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
        Commons.log("HalfBoxSize", halfBoxSize, Commons.validLogKeys.diamondSquareLogKey);
        Commons.log("QuarterBoxSize", quartBoxSize, Commons.validLogKeys.diamondSquareLogKey);
        Commons.log("Getting Average of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX - boxSize) + "],[" + posY + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX - halfBoxSize][posY] = Commons.getAverage([ Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize), Commons.tryGetArrayValue(mapValues, posX, posY), Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize), Commons.tryGetArrayValue(mapValues, posX - boxSize, posY) ]) + Commons.randomizePlusMinus(0, 5);
        Commons.log("Value of [" + (posX - halfBoxSize) + "][" + posY + "]", mapValues[posX - halfBoxSize][posY], Commons.validLogKeys.diamondSquareLogKey);
        Commons.log("Getting Average of", [ "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + (posX + boxSize) + "],[" + posY + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX + halfBoxSize][posY] = Commons.getAverage([ Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize), Commons.tryGetArrayValue(mapValues, posX, posY), Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize), Commons.tryGetArrayValue(mapValues, posX + boxSize, posY) ]) + Commons.randomizePlusMinus(0, 5);
        Commons.log("Value of [" + (posX + halfBoxSize) + "][" + posY + "]", mapValues[posX + halfBoxSize][posY]);
        Commons.log("Getting Average of", [ "[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]", "[" + posX + "],[" + (posY - boxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX][posY - halfBoxSize] = Commons.getAverage([ Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize), Commons.tryGetArrayValue(mapValues, posX, posY), Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize), Commons.tryGetArrayValue(mapValues, posX, posY - boxSize) ]) + Commons.randomizePlusMinus(0, 5);
        Commons.log("Value of [" + posX + "][" + (posY - halfBoxSize) + "]", mapValues[posX][posY - halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
        Commons.log("Getting Average of", [ "[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + posX + "],[" + posY + "]", "[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]", "[" + posX + "],[" + (posY + boxSize) + "]" ], Commons.validLogKeys.diamondSquareLogKey);
        mapValues[posX][posY + halfBoxSize] = Commons.getAverage([ Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize), Commons.tryGetArrayValue(mapValues, posX, posY), Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize), Commons.tryGetArrayValue(mapValues, posX, posY + boxSize) ]) + Commons.randomizePlusMinus(0, 5);
        Commons.log("Value of [" + posX + "][" + (posY + halfBoxSize) + "]", mapValues[posX][posY + halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
        //Commons.log("MAP VALUES AFTER STEP", mapValues, Commons.validLogKeys.diamondSquareLogKey);
        if (halfBoxSize >= 2) {
            squareStep(posX - quartBoxSize, posY - quartBoxSize, halfBoxSize, repairSalt);
            squareStep(posX + quartBoxSize, posY - quartBoxSize, halfBoxSize, repairSalt);
            squareStep(posX - quartBoxSize, posY + quartBoxSize, halfBoxSize, repairSalt);
            squareStep(posX + quartBoxSize, posY + quartBoxSize, halfBoxSize, repairSalt);
        }
    };
    /**
	 * Specifies the List of layers to which the particular Cell Value belongs to
	 * @param {double}	terrainValue   Value of the Cell
	 */
    var getLayersFromValue = function(terrainValue) {
        var selectedTerrains = [];
        for (var key in terrains) {
            if (terrains[key].getData().terrainUpperValue >= terrainValue && terrains[key].getData().terrainLowerValue <= terrainValue) {
                selectedTerrains.push(terrains[key]);
            }
        }
        return selectedTerrains;
    };
    /**
	 * Gets a Normalized Version of the Map
	 */
    var getNormalizedMap = function() {
        for (var rowKey in mapValues) {
            var tempRow = [];
            for (var columnKey in mapValues[rowKey]) {
                var responsibleTerrains = getLayersFromValue(mapValues[rowKey][columnKey]);
                for (var key in responsibleTerrains) {
                    if (responsibleTerrains[key].isRegularTerrain() === true) {
                        terrainKey = responsibleTerrains[key].getData().terrainKey;
                        break;
                    }
                }
                tempRow.push(terrainKey);
            }
            mapValuesNormalized.push(tempRow);
        }
        return mapValuesNormalized;
    };
    var sortByZLevel = function(terrainA, terrainB) {
        return terrainA.getDecorationData().zLevel - terrainB.getDecorationData().zLevel;
    };
    /**
	 * Gets a Decoration Mapped Map
	 */
    var getDecorationMap = function() {
        /*
		 * Step 1: Get the Non Overlapping Decorators - within the Range of the Cell's Value 
		 * Step 2: Cumulate the percentages, & Randomize to Select one of the Non Overlapping Decorators
		 * Step 3: Get the Overlappable Terrains
		 * Step 4: Don't Cumulate, Apply the possibility criteria individually over each decorator
		 *
		 */
        var nonOverlapKey;
        var overlapKey;
        for (var rowKey in mapValues) {
            var tempRow = [];
            for (var columnKey in mapValues[rowKey]) {
                var responsibleTerrains = getLayersFromValue(mapValues[rowKey][columnKey]);
                var nonOverlapDecorators = [];
                var overlapDecorators = [];
                var selectedTerrains = [];
                // STEP 1 & 3
                for (var key in responsibleTerrains) {
                    if (responsibleTerrains[key].isDecorationTerrain() === true && responsibleTerrains[key].getDecorationData().overlap === false) {
                        nonOverlapDecorators.push(responsibleTerrains[key]);
                    } else if (responsibleTerrains[key].isDecorationTerrain() === true && responsibleTerrains[key].getDecorationData().overlap === true) {
                        overlapDecorators.push(responsibleTerrains[key]);
                    }
                }
                Commons.log("Before Sort - Overlapping Decoration", overlapDecorators, Commons.validLogKeys.decorationRenderLogKey);
                Commons.log("Before Sort - Non-Overlapping Decoration", nonOverlapDecorators, Commons.validLogKeys.decorationRenderLogKey);
                overlapDecorators.sort(sortByZLevel);
                nonOverlapDecorators.sort(sortByZLevel);
                Commons.log("After Sort - Overlapping Decoration", overlapDecorators, Commons.validLogKeys.decorationRenderLogKey);
                Commons.log("After Sort - Non-Overlapping Decoration", nonOverlapDecorators, Commons.validLogKeys.decorationRenderLogKey);
                // STEP 2
                var totalPercent = 0;
                var maxValuePossible = nonOverlapDecorators.length * 100;
                for (nonOverlapKey in nonOverlapDecorators) {
                    totalPercent += nonOverlapDecorators[nonOverlapKey].getDecorationData().placementPercent;
                }
                if (totalPercent > maxValuePossible) {
                    Commons.warn("Error Adding Placement Percentage of Decoration Terrains - Reverting Terrains to 100% per terrain");
                    totalPercent = nonOverlapDecorators.length * 100;
                    for (nonOverlapKey in nonOverlapDecorators) {
                        nonOverlapDecorators[nonOverlapKey].getDecorationData().placementPercent = 100;
                    }
                }
                Commons.log("totalPercent", totalPercent, Commons.validLogKeys.decorationRenderLogKey);
                // 35% + 35% will be 70/200
                var randomPercent = Commons.randomize(0, maxValuePossible);
                var terrainToUse = null;
                var cumulativePercent = 0;
                Commons.log("maxValuePossible", maxValuePossible, Commons.validLogKeys.decorationRenderLogKey);
                Commons.log("randomPercent", randomPercent, Commons.validLogKeys.decorationRenderLogKey);
                for (nonOverlapKey in nonOverlapDecorators) {
                    cumulativePercent += nonOverlapDecorators[nonOverlapKey].getDecorationData().placementPercent;
                    if (randomPercent <= cumulativePercent) {
                        terrainToUse = nonOverlapDecorators[nonOverlapKey];
                        break;
                    }
                }
                // Push Selected Non Optional Terrain to Selection List
                if (terrainToUse) {
                    selectedTerrains.push(terrainToUse);
                    Commons.log("Pushing", terrainToUse, Commons.validLogKeys.decorationRenderLogKey);
                }
                // STEP 4
                for (overlapKey in overlapDecorators) {
                    randomPercent = Commons.randomize(0, 100);
                    if (randomPercent <= overlapDecorators[overlapKey].getDecorationData().placementPercent) {
                        selectedTerrains.push(overlapDecorators[overlapKey]);
                        Commons.log("Pushing", overlapDecorators[overlapKey], Commons.validLogKeys.decorationRenderLogKey);
                    }
                }
                tempRow.push(selectedTerrains);
            }
            mapValuesDecoration.push(tempRow);
        }
        return mapValuesDecoration;
    };
    /**
	 * Sets the Dimensions received from the generator
	 * @param {integer}	rowSize Size of the Row
	 * @param {integer} columnSize Size of the Column
	 */
    this.setDimensions = function(_rowSize, _columnSize) {
        rowSize = _rowSize;
        columnSize = _columnSize;
    };
    /**
	 * Adds a Scaled Terrain Object to a Map Instance
	 * @param {object}	terrainObject	object containing information about the terrain
	 */
    this.addTerrain = function(terrainObject) {
        var terrainData = new ScaledTerrain();
        terrainData.createTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min);
        if ("type" in terrainObject) {
            if (possibleTerrains.indexOf(terrainObject.type) !== -1) {
                terrainData.setType(terrainObject.type);
            } else {
                Commons.error("Error Adding Terrain Type : " + terrainObject.type);
            }
        }
        if ("default" in terrainObject && hasDefaultTerrain === false) {
            hasDefaultTerrain = true;
            terrainData.setDefault();
        }
        Commons.log("Adding Terrain", terrainData.getData(), Commons.validLogKeys.mapInitializeLogKey);
        terrains.push(terrainData);
    };
    /**
	 * Assigns Starting Condition to a Particular Layer
	 * @param {object}	conditionObject Object containing information about the starting condition
	 */
    this.addStartingCondition = function(conditionObject) {
        var terrainObject = Commons.getTerrainByKey(terrains, conditionObject["terrainKey"]);
        terrainObject.setStartingCondition(conditionObject["minCount"], conditionObject["optionalPercent"]);
    };
    /**
	 * Assigns a Validation Rule to a Particular Layer
	 * @param {object} Object containing information about the rule
	 */
    this.addValidationRule = function(ruleObject) {
        var terrainKey = ruleObject["terrainKey"];
        var minValue = -1;
        var maxValue = -1;
        if ("minPercent" in ruleObject) {
            minValue = ruleObject["minPercent"];
        }
        if ("maxPercent" in ruleObject) {
            maxValue = ruleObject["maxPercent"];
        }
        Commons.getTerrainByKey(terrains, terrainKey).setValidation(minValue, maxValue);
    };
    /**
	 * Adds GID Information about the Specified Terrain
	 * @param {object} Object containing information about GID & Terrain Key
	 */
    this.setTileInfo = function(tileObject) {
        var terrainKey = tileObject["terrainKey"];
        var tiles = tileObject["tiles"];
        var decoration = tileObject["decoration"] ? tileObject["decoration"] : false;
        Commons.getTerrainByKey(terrains, terrainKey).setTileInfo(tiles);
        Commons.getTerrainByKey(terrains, terrainKey).setDecorationData(decoration);
    };
    /**
	 * Checks the Validity of the Main Terrains. Based on the Validation Rules set.
	 */
    this.checkRegularTerrainValidity = function() {
        var regularTerrains = Commons.getMainTerrains(terrains);
        var validStatus = true;
        for (var key in regularTerrains) {
            var percent = getLayerPercentage(regularTerrains[key].terrainKey);
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
        Commons.log("Validity Reports", mapValidityReports, Commons.validLogKeys.mapValidationLogKey);
        return validStatus;
    };
    /**
	 * Gets the percentages of all the Regular Terrains in the Map
	 * @return {object} Indexed {terrainKey, percentage}
	 */
    this.getRegularTerrainPercentages = function() {
        var percentTerrains = {};
        var regularTerrains = Commons.getMainTerrains(terrains);
        for (var key in regularTerrains) {
            var percent = getLayerPercentage(regularTerrains[key].terrainKey);
            percentTerrains[regularTerrains[key].terrainKey] = percent;
        }
        return percentTerrains;
    };
    /**
	 * Main Function invoked to Generate the Map from scratch.
	 */
    this.generateMapValues = function() {
        Commons.info("Map Init Starting");
        Commons.log("Terrains Before Map Generation", terrains, Commons.validLogKeys.mapInitializeLogKey);
        init();
        initStartingConditions();
        Commons.info("Pre Generation Clean Up");
        preGenerationCleanUp();
        Commons.info("Diamond Square Algorithm Starting");
        diamondSquare(rowSize - 1, null);
        Commons.info("Post Generation Clean Up");
        postGenerationCleanUp();
    };
    /**
	 * Alias Function to get terrains
	 * @param {double}	terrainValue   Value of the Cell
	 */
    this.getLayersFromValue = function(terrainValue) {
        return getLayersFromValue(terrainValue);
    };
    /**
	 * Gets Settings Data for ScaledTmx
	 */
    this.getTmxSettings = function() {
        // Get Layered Map with Layer Keys inside the Matrix
        getNormalizedMap();
        // Get Possible Decoration Matrix
        getDecorationMap();
        var returnObject = {
            mapValues: mapValuesNormalized,
            terrains: terrains,
            mapValuesDecoration: mapValuesDecoration
        };
        return returnObject;
    };
    /**
	 * Main Function invoked to Generate the Map from scratch.
	 */
    this.getMapValues = function() {
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
    var terrainTileInfo = -1;
    var terrainDecoration = false;
    this.createTerrain = function(_terrainLabel, _terrainKey, _terrainUpperValue, _terrainLowerValue) {
        this.terrainKey = _terrainKey;
        terrainUpperValue = _terrainUpperValue;
        terrainLowerValue = _terrainLowerValue;
        terrainLabel = _terrainLabel;
    };
    this.setStartingCondition = function(_terrainStartCount, _terrainStartPercent) {
        terrainStartPercent = _terrainStartPercent;
        terrainStartCount = _terrainStartCount;
    };
    this.setDefault = function() {
        terrainDefault = true;
    };
    this.setType = function(_terrainType) {
        terrainType = _terrainType;
    };
    this.getRandomTerrainValue = function() {
        return Commons.randomize(terrainLowerValue, terrainUpperValue);
    };
    this.isRegularTerrain = function() {
        if (terrainType == "terrain") {
            return true;
        }
        return false;
    };
    this.isDecorationTerrain = function() {
        if (terrainType == "decoration") {
            return true;
        }
        return false;
    };
    this.setValidation = function(minValue, maxValue) {
        terrainValidationMinPercent = minValue;
        terrainValidationMaxPercent = maxValue;
    };
    this.setDecorationData = function(terrainDecorationData) {
        terrainDecorationData.placementPercent = terrainDecorationData.placementPercent ? terrainDecorationData.placementPercent : 0;
        terrainDecorationData.overlap = terrainDecorationData.overlap ? terrainDecorationData.overlap : false;
        terrainDecorationData.zLevel = terrainDecorationData.zLevel ? terrainDecorationData.zLevel : 0;
        terrainDecorationData.edgePlacement = terrainDecorationData.edgePlacement ? terrainDecorationData.edgePlacement : false;
        terrainDecoration = terrainDecorationData;
    };
    this.getDecorationData = function() {
        return terrainDecoration;
    };
    this.setTileInfo = function(tileInfo) {
        terrainTileInfo = tileInfo;
    };
    this.getTiles = function() {
        return terrainTileInfo;
    };
    this.getTileData = function(tileType, tilePlacement, tileValue) {
        var tiles = this.getTiles();
        var selectedTile = false;
        for (var key in tiles) {
            if (tiles[key].type == tileType && tiles[key].placement == tilePlacement) {
                selectedTile = tiles[key];
                break;
            }
        }
        if (selectedTile) {
            if (selectedTile[tileValue]) {
                return selectedTile[tileValue];
            }
            Commons.error("Can't Find Tile Information for Layer: " + terrainLabel + ", Tile Data: " + tileType + ", " + tilePlacement + ", " + tileValue);
            return false;
        }
        Commons.error("Can't Find Tile Information for Layer: " + terrainLabel + ", Tile Data: " + tileType + ", " + tilePlacement + ", " + tileValue);
        return false;
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
            terrainValidationMaxPercent: terrainValidationMaxPercent,
            terrainTileInfo: terrainTileInfo
        };
        return returnObject;
    };
};

var ScaledTmxGen = function(settingsData) {
    var BLANK_GID_VALUE = 1;
    var templateString = "";
    var terrains = [];
    var mapValues = [];
    var mapValuesDecoration = [];
    var mapValuesTmx = [];
    var tilesetObject = null;
    var edgeHandler = null;
    var edgeHandlerSettings = null;
    var dominationObject = null;
    if (settingsData) {
        mapValues = settingsData["mapValues"] ? settingsData["mapValues"] : [];
        terrains = settingsData["terrains"] ? settingsData["terrains"] : [];
        tilesetObject = settingsData["tilesetSettings"] ? settingsData["tilesetSettings"] : null;
        dominationObject = settingsData["domSettings"] ? settingsData["domSettings"] : null;
        mapValuesDecoration = settingsData["mapValuesDecoration"] ? settingsData["mapValuesDecoration"] : [];
    }
    edgeHandlerSettings = {
        terrains: terrains,
        domination: dominationObject
    };
    edgeHandler = new ScaledEdgeDetector(edgeHandlerSettings);
    var getAdjacentValues = function(posX, posY) {
        var points = [];
        posX = parseInt(posX);
        posY = parseInt(posY);
        points.push(Commons.tryGetArrayValue(mapValues, posX - 1, posY));
        points.push(Commons.tryGetArrayValue(mapValues, posX, posY + 1));
        points.push(Commons.tryGetArrayValue(mapValues, posX + 1, posY));
        points.push(Commons.tryGetArrayValue(mapValues, posX, posY - 1));
        return points;
    };
    var getDiagonalValues = function(posX, posY) {
        var points = [];
        posX = parseInt(posX);
        posY = parseInt(posY);
        points.push(Commons.tryGetArrayValue(mapValues, posX - 1, posY - 1));
        points.push(Commons.tryGetArrayValue(mapValues, posX - 1, posY + 1));
        points.push(Commons.tryGetArrayValue(mapValues, posX + 1, posY + 1));
        points.push(Commons.tryGetArrayValue(mapValues, posX + 1, posY - 1));
        return points;
    };
    var createEmptyLayer = function() {
        var tempMap = [];
        for (var rowKey in mapValues) {
            var tempRow = [];
            for (var columnKey in mapValues[rowKey]) {
                tempRow.push(BLANK_GID_VALUE);
            }
            tempMap.push(tempRow);
        }
        mapValuesTmx.push(tempMap);
    };
    var initLayeredMap = function() {
        var defautGidValue = Commons.getDefaultTerrain(terrains).getTileData("other-tiles", "all", "fullValue");
        var tempMap = [];
        for (var rowKey in mapValues) {
            var tempRow = [];
            for (var columnKey in mapValues[rowKey]) {
                tempRow.push(defautGidValue);
            }
            tempMap.push(tempRow);
        }
        mapValuesTmx.push(tempMap);
    };
    var valueExists = function(value, posX, posY) {
        for (var layerKey in mapValuesTmx) {
            if (mapValuesTmx[layerKey][posX][posY] == value) {
                return true;
            }
        }
        return false;
    };
    var getLayerLevelForInsert = function(posX, posY) {
        for (var layerKey in mapValuesTmx) {
            if (mapValuesTmx[layerKey][posX][posY] === BLANK_GID_VALUE) {
                return layerKey;
            }
        }
        return -1;
    };
    var insertTilesIntoMap = function(tileValues, posX, posY) {
        if (mapValuesTmx.length === 1) {
            createEmptyLayer();
        }
        posX = parseInt(posX);
        posY = parseInt(posY);
        for (var key in tileValues) {
            var currentValue = tileValues[key];
            if (valueExists(currentValue, posX, posY) === false) {
                var layerLevel = getLayerLevelForInsert(posX, posY);
                if (layerLevel !== -1) {
                    mapValuesTmx[layerLevel][posX][posY] = currentValue;
                } else {
                    var nextLevel = mapValuesTmx.length;
                    createEmptyLayer();
                    mapValuesTmx[nextLevel][posX][posY] = currentValue;
                }
            }
        }
    };
    var startNewLayer = function(layerIndex) {
        templateString += '<layer name="layer_' + layerIndex + '" width="' + mapValuesTmx[0].length + '" height="' + mapValuesTmx[0].length + '">';
        templateString += "<data>";
    };
    var endNewLayer = function() {
        templateString += "</data>";
        templateString += "</layer>";
    };
    var appendTileRow = function(gidValue) {
        templateString += '<tile gid="' + gidValue + '" />';
    };
    var getRandomizedDecorationTile = function(terrain) {
        var tiles = terrain.getData().terrainTileInfo;
        var tileKey;
        var randomPercent;
        var totalWeight = 0;
        var cumulativeWeight = 0;
        var selectedTile = null;
        for (tileKey in tiles) {
            if (tiles[tileKey].weight) {
                totalWeight += tiles[tileKey].weight;
            }
        }
        randomPercent = Commons.randomize(0, totalWeight);
        for (tileKey in tiles) {
            cumulativeWeight += tiles[tileKey].weight;
            if (randomPercent <= cumulativeWeight) {
                selectedTile = tiles[tileKey];
                break;
            }
        }
        if (selectedTile) {
            if (!selectedTile.dimensions) {
                return selectedTile.value;
            }
        }
        return -1;
    };
    var canPlaceDecorationLayer = function(rowKey, columnKey) {
        var primaryCell = mapValues[rowKey][columnKey];
        var similarity = edgeHandler.getAdjacentSimilarity(primaryCell, getAdjacentValues(rowKey, columnKey));
        if (edgeHandler.allSquareSidesSimilar(similarity) === true) {
            return true;
        }
        return false;
    };
    var decorateMap = function() {
        for (var rowKey in mapValues) {
            for (var columnKey in mapValues[rowKey]) {
                if (mapValuesDecoration[rowKey]) {
                    var selectedTerrains = mapValuesDecoration[rowKey][columnKey];
                    var tiles = [];
                    var tilePlacement = canPlaceDecorationLayer(rowKey, columnKey);
                    if (selectedTerrains && selectedTerrains.length !== 0) {
                        for (var terrainKey in selectedTerrains) {
                            if (tilePlacement || selectedTerrains[terrainKey].getDecorationData().edgePlacement) {
                                tiles.push(getRandomizedDecorationTile(selectedTerrains[terrainKey]));
                            }
                        }
                        Commons.removeKeyFromArray(tiles, -1);
                    }
                    if (tiles && tiles.length > 0) {
                        insertTilesIntoMap(tiles, rowKey, columnKey);
                    }
                }
            }
        }
    };
    this.generateMapTmx = function() {
        Commons.info("TMX - Generating Layered Map");
        this.generateLayeredMap();
        Commons.info("TMX - Decorating Map");
        decorateMap();
        Commons.info("TMX - Generating Map XML");
        this.generateMapXml();
    };
    this.getTmxXml = function() {
        return templateString;
    };
    this.generateLayeredMap = function() {
        initLayeredMap();
        for (var rowKey in mapValues) {
            for (var columnKey in mapValues[rowKey]) {
                Commons.log("Primary Pos", rowKey + "," + columnKey, Commons.validLogKeys.tmxRenderLogKey);
                var adjacentInfo = getAdjacentValues(rowKey, columnKey);
                var diagonalInfo = getDiagonalValues(rowKey, columnKey);
                var tileValues = edgeHandler.resolveTileValue(mapValues[rowKey][columnKey], adjacentInfo, diagonalInfo);
                insertTilesIntoMap(tileValues, rowKey, columnKey);
            }
        }
    };
    this.generateMapXml = function() {
        templateString += '<?xml version="1.0" encoding="UTF-8"?>';
        templateString += '<map version="1.0" orientation="orthogonal" renderorder="left-up" width="' + mapValuesTmx[0].length + '" height="' + mapValuesTmx[0].length + '" tilewidth="' + tilesetObject.tileWidth + '" tileheight="' + tilesetObject.tileHeight + '" nextobjectid="1">';
        templateString += '<tileset firstgid="1" name="tileset" tilewidth="' + tilesetObject.tileWidth + '" tileheight="' + tilesetObject.tileHeight + '">';
        templateString += '<image source="' + tilesetObject.source + '" trans="ffffff" width="' + tilesetObject.width + '" height="' + tilesetObject.height + '"/>';
        templateString += "</tileset>";
        for (var layerKey in mapValuesTmx) {
            startNewLayer(layerKey);
            for (var rowKey in mapValuesTmx[layerKey]) {
                for (var columnKey in mapValuesTmx[layerKey][rowKey]) {
                    appendTileRow(mapValuesTmx[layerKey][rowKey][columnKey]);
                }
            }
            endNewLayer();
        }
        templateString += "</map>";
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