var ScaledGen = function(settingsData) {
	if (settingsData) {
		if (("debug" in settingsData) && settingsData["debug"] === true) {
			Commons.debug = true;
		}

		if (("logs" in settingsData)) {
			Commons.allowedLogs = settingsData["logs"];
		}

		if (("onProgressUpdate" in settingsData)) {
			Commons.showProgressUpdate = settingsData["onProgressUpdate"];
		}
	}

	this.mainMap = new ScaledMap();
};

ScaledGen.prototype.SetMapSize = function(rowSize, columnSize) {
	this.mainMap['rowSize'] = rowSize;
	this.mainMap['columnSize'] = columnSize;
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