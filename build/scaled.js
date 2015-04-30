// ----- Construct -----    
var Commons = {};

// ----- Declare Vars Here -----
var PLUS_MINUS_BAR = 4;

Commons.RoundNumber = function(number) {
    return Math.round(number);
};

Commons.Randomize = function(minValue, maxValue) {
    return Math.floor(Math.random() * maxValue + minValue);
};

Commons.RandomizePlusMinus = function(minValue, maxValue) {
    var barValue = this.Randomize(1, 10);
    var randomValue = this.Randomize(minValue, maxValue);
    if (barValue <= PLUS_MINUS_BAR) {
        return barValue * -1;
    }
    return barValue;
};

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

ScaledMap.prototype.SetDimensions = function(rowSize, columnSize) {
    this.rowSize = rowSize;
    this.columnSize = columnSize;
};

ScaledMap.prototype.AddTerrain = function(terrainObject) {
    var currentSize = this.terrains.length;
    var terrainData = new ScaledTerrain();
    if ("zLevel" in terrainObject) {
        terrainData.CreateTerrain(currentSize, terrainObject.label, terrainObject.max, terrainObject.min, terrainObject.zLevel);
    } else {
        terrainData.CreateTerrain(currentSize, terrainObject.label, terrainObject.max, terrainObject.min, 0);
    }
    if ("default" in terrainObject) {
        this.hasDefaultTerrain = true;
        terrainData.SetDefault();
    }
    this.terrains.push(terrainData);
};

ScaledMap.prototype.Init = function() {};

var ScaledTerrain = function() {
    this.terrainUpperValue = -1;
    this.terrainLowerValue = -1;
    this.terrainLabel = -1;
    this.terrainId = -1;
    this.terrainZLevel = -1;
    this.terrainDefault = false;
};

ScaledTerrain.prototype.CreateTerrain = function(terrainId, terrainLabel, terrainUpperValue, terrainLowerValue, terrainZLevel) {
    this.terrainUpperValue = terrainUpperValue;
    this.terrainLowerValue = terrainLowerValue;
    this.terrainLabel = terrainLabel;
    this.terrainId = terrainId;
    this.terrainZLevel = terrainZLevel;
};

ScaledTerrain.prototype.SetDefault = function() {
    this.terrainDefault = true;
};

var ScaledGen = function() {
    this.mainMap = new ScaledMap();
};

ScaledGen.prototype.SetMapSize = function(rowSize, columnSize) {
    this.mainMap["rowSize"] = rowSize;
    this.mainMap["columnSize"] = columnSize;
};

ScaledGen.prototype.AddTerrain = function(terrainData) {
    this.mainMap.AddTerrain(terrainData);
};

ScaledGen.prototype.GenerateMap = function() {
    console.log(Commons.RandomizePlusMinus(35, 55));
    console.log(this.mainMap["rowSize"]);
};