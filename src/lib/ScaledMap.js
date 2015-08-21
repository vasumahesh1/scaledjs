/**
 * Constructor for Main Map Object
 */
var ScaledMap = function () {
	var terrains = [];
	var mapValues = [];
	var mapValuesNormalized = [];
	var mapValuesDecoration = [];
	var mapValidityReports = [];
	var rowSize = 33;
	var columnSize = 33;
	var mapInitValue = -1;
	var hasDefaultTerrain = false;
	var startTerrainKeys = ["", "", "", ""];
	var startTerrainValues = [];
	var isInited = false;
	var possibleTerrains = ["terrain", "decoration"];

	/**
	 * Gets the Percentage for a Particular Layer
	 * @param {string}	layerKey	Contains the key associated to the layer
	 */
	var getLayerPercentage = function (layerKey) {
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

		var percent = (selectedCount / totalCount) * 100;

		Commons.log(terrainObject.getData().terrainKey + " Percentage of Terrain", percent, Commons.validLogKeys.mapValidationLogKey);

		return percent;
	};

	/**
	 * Initializes the Map
	 */
	var init = function () {
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
	var initStartingConditions = function () {

		// Init Global Vars - Important If the Generation is Re Done
		startTerrainKeys = ["", "", "", ""];
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
		minCountArray.sort(function (itemA, itemB) {
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
					optionalArray[optionalKey]["cumulativePercent"] = (optionalArray[optionalKey]["cumulativePercent"] / totalOptional) * 100;
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
	var postGenerationCleanUp = function () {
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
	var preGenerationCleanUp = function () {
		if (mapValidityReports.length !== 0) {

		}
	};


	/**
	 * Modified Version of a Diamond Square Algorithm with extra Variation Added
	 * @param  {Array}		mapValues   Map on which Diamond Square to be applied
	 * @param  {integer}	boxSize 	Size of the Box. (Last Index of the box)
	 * @param  {Array}		repairSalt 	Contains information regarding the Repair needed
	 * @return {Array}		mapValues 	Final Modified Map
	 */
	var diamondSquare = function (boxSize, repairSalt) {
		Commons.info("Diamond Step Starting");
		diamondStep(boxSize / 2, boxSize / 2, boxSize, repairSalt);
		Commons.info("Square Step Starting");
		squareStep(boxSize / 2, boxSize / 2, boxSize, repairSalt);
	};

	var diamondStep = function (posX, posY, boxSize, repairSalt) {

		//Commons.log("MAP VALUES BEFORE STEP", mapValues, Commons.validLogKeys.diamondSquareLogKey);


		var halfBoxSize = Math.floor(boxSize / 2);
		var quartBoxSize = Math.floor(halfBoxSize / 2);

		Commons.log("HalfBoxSize", halfBoxSize, Commons.validLogKeys.diamondSquareLogKey);
		Commons.log("QuarterBoxSize", quartBoxSize, Commons.validLogKeys.diamondSquareLogKey);

		Commons.log(
			"Getting Average of", [
				"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
				"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
				"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
				"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]"
			],
			Commons.validLogKeys.diamondSquareLogKey
		);



		mapValues[posX][posY] = Commons.getAverage([
			mapValues[posX - halfBoxSize][posY - halfBoxSize],
			mapValues[posX - halfBoxSize][posY + halfBoxSize],
			mapValues[posX + halfBoxSize][posY - halfBoxSize],
			mapValues[posX + halfBoxSize][posY + halfBoxSize],
		]);

		Commons.log("Value of Center [" + posX + "][" + posY + "]", mapValues[posX][posY], Commons.validLogKeys.diamondSquareLogKey);
		if (halfBoxSize >= 2) {
			diamondStep(posX - quartBoxSize, posY - quartBoxSize, halfBoxSize, repairSalt);
			diamondStep(posX + quartBoxSize, posY - quartBoxSize, halfBoxSize, repairSalt);
			diamondStep(posX - quartBoxSize, posY + quartBoxSize, halfBoxSize, repairSalt);
			diamondStep(posX + quartBoxSize, posY + quartBoxSize, halfBoxSize, repairSalt);
		}
	};

	var squareStep = function (posX, posY, boxSize, repairSalt) {
		var halfBoxSize = Math.floor(boxSize / 2);
		var quartBoxSize = Math.floor(halfBoxSize / 2);

		Commons.log("HalfBoxSize", halfBoxSize, Commons.validLogKeys.diamondSquareLogKey);
		Commons.log("QuarterBoxSize", quartBoxSize, Commons.validLogKeys.diamondSquareLogKey);

		Commons.log(
			"Getting Average of", [
				"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
				"[" + (posX) + "],[" + (posY) + "]",
				"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
				"[" + (posX - boxSize) + "],[" + (posY) + "]"
			],
			Commons.validLogKeys.diamondSquareLogKey
		);

		mapValues[posX - halfBoxSize][posY] = Commons.getAverage([
			Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize),
			Commons.tryGetArrayValue(mapValues, posX, posY),
			Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize),
			Commons.tryGetArrayValue(mapValues, posX - boxSize, posY)
		]) + Commons.randomizePlusMinus(0, 5);

		Commons.log("Value of [" + (posX - halfBoxSize) + "][" + posY + "]", mapValues[posX - halfBoxSize][posY], Commons.validLogKeys.diamondSquareLogKey);
		Commons.log(
			"Getting Average of", [
				"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
				"[" + (posX) + "],[" + (posY) + "]",
				"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
				"[" + (posX + boxSize) + "],[" + (posY) + "]"
			],
			Commons.validLogKeys.diamondSquareLogKey
		);

		mapValues[posX + halfBoxSize][posY] = Commons.getAverage([
			Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize),
			Commons.tryGetArrayValue(mapValues, posX, posY),
			Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize),
			Commons.tryGetArrayValue(mapValues, posX + boxSize, posY)
		]) + Commons.randomizePlusMinus(0, 5);

		Commons.log("Value of [" + (posX + halfBoxSize) + "][" + posY + "]", mapValues[posX + halfBoxSize][posY]);
		Commons.log(
			"Getting Average of", [
				"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
				"[" + (posX) + "],[" + (posY) + "]",
				"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
				"[" + (posX) + "],[" + (posY - boxSize) + "]"
			],
			Commons.validLogKeys.diamondSquareLogKey);

		mapValues[posX][posY - halfBoxSize] = Commons.getAverage([
			Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize),
			Commons.tryGetArrayValue(mapValues, posX, posY),
			Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize),
			Commons.tryGetArrayValue(mapValues, posX, posY - boxSize)
		]) + Commons.randomizePlusMinus(0, 5);

		Commons.log("Value of [" + (posX) + "][" + (posY - halfBoxSize) + "]", mapValues[posX][posY - halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
		Commons.log(
			"Getting Average of", [
				"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
				"[" + (posX) + "],[" + (posY) + "]",
				"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
				"[" + (posX) + "],[" + (posY + boxSize) + "]"
			],
			Commons.validLogKeys.diamondSquareLogKey
		);

		mapValues[posX][posY + halfBoxSize] = Commons.getAverage([
			Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize),
			Commons.tryGetArrayValue(mapValues, posX, posY),
			Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize),
			Commons.tryGetArrayValue(mapValues, posX, posY + boxSize)
		]) + Commons.randomizePlusMinus(0, 5);

		Commons.log("Value of [" + (posX) + "][" + (posY + halfBoxSize) + "]", mapValues[posX][posY + halfBoxSize], Commons.validLogKeys.diamondSquareLogKey);
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
	var getLayersFromValue = function (terrainValue) {
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
	var getNormalizedMap = function () {
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


	var sortByZLevel = function (terrainA, terrainB) {
		return terrainA.getDecorationData().zLevel - terrainB.getDecorationData().zLevel;
	};



	/**
	 * Gets a Decoration Mapped Map
	 */
	var getDecorationMap = function () {
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

				if(totalPercent > maxValuePossible) {
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
				if(terrainToUse) {
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
	this.setDimensions = function (_rowSize, _columnSize) {
		rowSize = _rowSize;
		columnSize = _columnSize;
	};

	/**
	 * Adds a Scaled Terrain Object to a Map Instance
	 * @param {object}	terrainObject	object containing information about the terrain
	 */
	this.addTerrain = function (terrainObject) {
		var terrainData = new ScaledTerrain();

		terrainData.createTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min);

		if ('type' in terrainObject) {
			if (possibleTerrains.indexOf(terrainObject.type) !== -1) {
				terrainData.setType(terrainObject.type);
			} else {
				Commons.error("Error Adding Terrain Type : " + terrainObject.type);
			}
		}

		if ('default' in terrainObject && hasDefaultTerrain === false) {
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
	this.addStartingCondition = function (conditionObject) {
		var terrainObject = Commons.getTerrainByKey(terrains, conditionObject["terrainKey"]);
		terrainObject.setStartingCondition(conditionObject["minCount"], conditionObject["optionalPercent"]);
	};


	/**
	 * Assigns a Validation Rule to a Particular Layer
	 * @param {object} Object containing information about the rule
	 */
	this.addValidationRule = function (ruleObject) {
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
	this.setTileInfo = function (tileObject) {
		var terrainKey = tileObject["terrainKey"];
		var tiles = tileObject["tiles"];
		var decoration = tileObject["decoration"] ? tileObject["decoration"] : false;

		Commons.getTerrainByKey(terrains, terrainKey).setTileInfo(tiles);
		Commons.getTerrainByKey(terrains, terrainKey).setDecorationData(decoration);
	};

	/**
	 * Checks the Validity of the Main Terrains. Based on the Validation Rules set.
	 */
	this.checkRegularTerrainValidity = function () {
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
	this.getRegularTerrainPercentages = function () {
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
	this.generateMapValues = function () {
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
	this.getLayersFromValue = function (terrainValue) {
		return getLayersFromValue(terrainValue);
	};

	/**
	 * Gets Settings Data for ScaledTmx
	 */
	this.getTmxSettings = function () {
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
	this.getMapValues = function () {
		return mapValues;
	};


};