var ScaledGen = function(settingsData) {
	if (settingsData) {
		if (("debug" in settingsData) && settingsData["debug"] === true) {
			Commons.debug = true;
		}

		if (("logs" in settingsData)) {
			Commons.allowedLogs = settingsData["logs"];
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
		mapHtml += GenerateRow(mapValues[rowKey]);
	}
	map_element.innerHTML = mapHtml;
};



function GenerateRow(rowValues) {
	var rowHtml = "<div class='row'>";
	for (var columnKey in rowValues) {
		rowHtml += GenerateCell(rowValues[columnKey]);
	}
	rowHtml += "</div>";
	return rowHtml;
}

function GenerateCell(cellValue) {
	var html = "";
	html += "<div class='cell'>";
	html += cellValue;
	html += "</div>";
	return html;
}