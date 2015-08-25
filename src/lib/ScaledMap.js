/**
 * Constructor for Main Map Object
 */
var Scaled = (function (Scaled) {

	var ScaledMap = function () {
		var terrains = [];
		var mapValues = [];
		var mapValuesNormalized = [];
		var mapValuesDecoration = [];
		var mapValidityReports = [];
		var positiveReports = [];
		var negativeReports = [];
		var mapProgress = [];
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
			var terrainObject = Scaled.Commons.getTerrainByKey(terrains, layerKey);
			for (var mapRow in mapValues) {
				for (var mapColumn in mapValues) {
					if (mapValues[mapRow][mapColumn] <= terrainObject.getData().terrainUpperValue && mapValues[mapRow][mapColumn] >= terrainObject.getData().terrainLowerValue) {
						selectedCount++;
					}
				}
			}

			var percent = (selectedCount / totalCount) * 100;

			Scaled.Commons.log(terrainObject.getData().terrainKey + " Percentage of Terrain", percent, Scaled.Commons.validLogKeys.mapValidationLogKey);

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
				Scaled.Commons.log("Map Values Empty", mapValues, Scaled.Commons.validLogKeys.mapInitializeLogKey);
				isInited = true;
			}
		};

		/**
		 * Descending Order of sorting of Validity Reports
		 * @param  {object} reportA Scaled Validity Report
		 * @param  {object} reportB Scaled Validity Report
		 * @return {int}         Difference of the Repair Magnitude
		 */
		var sortMapValidityReports = function (reportA, reportB) {
			return reportB.repairMagnitude - reportA.repairMagnitude;
		};


		/**
		 * Initializes the Starting Conditions of the Map
		 */
		var initStartingConditions = function () {

			// Init Global Vars - Important If the Generation is Re Done
			startTerrainKeys = ["", "", "", ""];
			startTerrainValues = [];

			var terrainKey;
			var terrainsWithStartPercent = [];
			var slotsRequested = 0;

			// Get Valid Terrains
			// i.e. Main Terrains Only
			var regularTerrains = Scaled.Commons.getMainTerrains(terrains);
			Scaled.Commons.log("Regular Terrains", regularTerrains, Scaled.Commons.validLogKeys.mapInitializeLogKey);

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
					slotsRequested += regularTerrains[key].terrainStartCount;
					terrainsWithStartPercent.push(tempObject);
				}
			}

			// Descending Order Sort - based on the Count
			terrainsWithStartPercent.sort(function (itemA, itemB) {
				return itemB["count"] - itemA["count"];
			});

			var remainingSlots = 4;
			var slotsUsed = [];
			if (slotsRequested <= 4) {
				// Free Slots Left
				remainingSlots = 4 - slotsRequested;

				/*
				 * Below Code Assigns a Random Edge of the Map to the Above calculated Terrains
				 * The Choice of slot is random(0,3)
				 */
				for (var minKey in terrainsWithStartPercent) {
					for (j = 0; j < terrainsWithStartPercent[minKey]["count"]; j++) {
						var value = Scaled.Commons.randomizeWithException(0, 3, slotsUsed);
						slotsUsed.push(value);
						startTerrainKeys[value] = terrainsWithStartPercent[minKey]["terrainKey"];
					}
				}

			} else if (slotsRequested > 4) {
				console.warn("Cannot have more than 4 starting conditions as a Rectangular map has only 4 vertices");
			}

			Scaled.Commons.log("Empty Non Optional Slots to Use", remainingSlots, Scaled.Commons.validLogKeys.mapInitializeLogKey);

			// if (mapValidityReports.length !== 0) {
			// 	Scaled.Commons.log("Validation Errored, Trying to Optimize Map", mapValidityReports, Scaled.Commons.validLogKeys.mapValidationLogKey);
			// 	// Validity Reports are Already unique per Terrain
			// 	var validityKey;
			// 	var validitySlots;
			// 	var positiveReports = [];
			// 	var negativeReports = [];

			// 	for (validityKey in mapValidityReports) {
			// 		if (mapValidityReports[validityKey].positiveIncrease) {
			// 			positiveReports.push(mapValidityReports[validityKey]);
			// 		} else {
			// 			negativeReports.push(mapValidityReports[validityKey]);
			// 		}
			// 	}

			// 	positiveReports.sort(sortMapValidityReports);

			// 	Scaled.Commons.log("Selected Reports", positiveReports, Scaled.Commons.validLogKeys.mapValidationLogKey);

			// 	if (positiveReports.length > 4) {
			// 		// 4 or More Layers errored Last Time & need Positive Increase
			// 		console.warn("Validation too Strict. Trying to Optimize Map as much as Possible");
			// 	}

			// 	for (validityKey in positiveReports) {
			// 		for (terrainKey in regularTerrains) {
			// 			if (regularTerrains[terrainKey].terrainKey === positiveReports[validityKey].terrainKey) {
			// 				validitySlots = Scaled.Commons.randomizeWithException(0, 3, slotsUsed);
			// 				slotsUsed.push(validitySlots);
			// 				startTerrainKeys[validitySlots] = positiveReports[validityKey].terrainKey;
			// 			}
			// 		}
			// 	}
			// 	Scaled.Commons.log("Selected Starting Conditions", startTerrainKeys, Scaled.Commons.validLogKeys.mapValidationLogKey);

			// 	remainingSlots -= positiveReports.length;

			// 	if (remainingSlots > 0) {
			// 		for (validityKey in positiveReports) {
			// 			for (terrainKey in regularTerrains) {
			// 				if (regularTerrains[terrainKey].terrainKey === positiveReports[validityKey].terrainKey && positiveReports[validityKey].repairMagnitude >= 5 && remainingSlots > 0) {
			// 					validitySlots = Scaled.Commons.randomizeWithException(0, 3, slotsUsed);
			// 					slotsUsed.push(validitySlots);
			// 					startTerrainKeys[validitySlots] = positiveReports[validityKey].terrainKey;
			// 					remainingSlots--;
			// 				}
			// 			}
			// 		}
			// 	}

			// 	Scaled.Commons.log("Final Selected Starting Conditions", startTerrainKeys, Scaled.Commons.validLogKeys.mapValidationLogKey);

			// }

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
				for (terrainKey in regularTerrains) {
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
					Scaled.Commons.warn("Optional percentages are not over 100, Normalizing Values to 0 to 100 Range");

					for (optionalKey in optionalArray) {
						optionalArray[optionalKey]["cumulativePercent"] = (optionalArray[optionalKey]["cumulativePercent"] / totalOptional) * 100;
					}

				}

				for (i = 0; i < remainingSlots; i++) {
					// Getting a Random Slot from  0 to 3 with Exception of certain slots to Exclude
					var remainingValue = Scaled.Commons.randomizeWithException(0, 3, slotsUsed);
					slotsUsed.push(remainingValue);

					var randomPercent = Scaled.Commons.randomize(0, totalOptional);
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
						terrainToUse = Scaled.Commons.randomizeInArray(nonOptionalArray)["terrainKey"];
					}

					startTerrainKeys[remainingValue] = terrainToUse;
				}
			}

			Scaled.Commons.log("Start Terrain Keys", startTerrainKeys, Scaled.Commons.validLogKeys.mapInitializeLogKey);

			for (var startTerrainKey in startTerrainKeys) {
				var terrainObject = Scaled.Commons.getTerrainByKey(terrains, startTerrainKeys[startTerrainKey]);
				startTerrainValues.push(terrainObject.getRandomTerrainValue());
			}

			Scaled.Commons.log("Start Terrain Values", startTerrainValues, Scaled.Commons.validLogKeys.mapInitializeLogKey);

			mapValues[0][0] = startTerrainValues[0];
			mapValues[0][columnSize - 1] = startTerrainValues[1];
			mapValues[rowSize - 1][0] = startTerrainValues[2];
			mapValues[rowSize - 1][columnSize - 1] = startTerrainValues[3];

			Scaled.Commons.log("Map Values After Starting Values", mapValues, Scaled.Commons.validLogKeys.mapInitializeLogKey);

		};


		/**
		 * Does a Final Clean up of the map values.
		 */
		var postGenerationCleanUp = function () {
			var maxTerrainValue = Scaled.Commons.getTerrainMaximum(terrains).getData().terrainUpperValue;
			var minTerrainValue = Scaled.Commons.getTerrainMinimum(terrains).getData().terrainLowerValue;

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
				for (var validityKey in mapValidityReports) {
					if (mapValidityReports[validityKey].positiveIncrease) {
						positiveReports.push(mapValidityReports[validityKey]);
					} else {
						negativeReports.push(mapValidityReports[validityKey]);
					}
				}

				positiveReports.sort(sortMapValidityReports);

			}

			// Normalizing the Validation Rules
			var key;
			var totalMinPercent = 0;
			var totalMaxPercent = 0;
			var totalMinCount = 0;
			var totalMaxCount = 0;
			var normalizeBase = 0;

			var regularTerrains = Scaled.Commons.getMainTerrains(terrains);

			mapProgress = [];

			for (key in regularTerrains) {
				// Reset Map Progress
				mapProgress.push(new Scaled.ScaledGenProgress(regularTerrains[key].terrainKey));

				// Normalizing Values of Validation
				if (regularTerrains[key].terrainValidationMinPercent >= 0) {
					totalMinPercent += regularTerrains[key].terrainValidationMinPercent;
					totalMinCount++;
				}

				if (regularTerrains[key].terrainValidationMaxPercent >= 0) {
					totalMaxPercent += regularTerrains[key].terrainValidationMaxPercent;
					totalMaxCount++;
				}
			}

			if (totalMinPercent > 100) {
				normalizeBase = totalMinCount * 100;
				for (key in terrains) {
					if (terrains[key].isRegularTerrain() && terrains[key].getData().terrainValidationMinPercent >= 0) {
						Scaled.Commons.warn("Before" + terrains[key].terrainKey + " " + terrains[key].getData().terrainValidationMinPercent);
						var possibleMinPercent = (terrains[key].getData().terrainValidationMinPercent / normalizeBase) * 100;
						var currentMaxPercent = terrains[key].getData().terrainValidationMaxPercent;
						terrains[key].setValidation(possibleMinPercent, currentMaxPercent);
					}
				}
			}

			if (totalMaxPercent > 100) {
				Scaled.Commons.warn("Max Percent Validation Rules are Above 100% - Normalizing Values to range [0,100]");
				normalizeBase = totalMaxCount * 100;
				for (key in terrains) {
					if (terrains[key].isRegularTerrain() && terrains[key].getData().terrainValidationMaxPercent >= 0) {
						var possibleMaxPercent = (terrains[key].getData().terrainValidationMaxPercent / normalizeBase) * 100;
						var currentMinPercent = terrains[key].getData().terrainValidationMinPercent;
						terrains[key].setValidation(currentMinPercent, possibleMaxPercent);
					}
				}
			}
		};


		var analyzeCorrection = function (cellValue, selectedTerrain, selectedProgress) {
			if (mapValidityReports.length !== 0) {
				var dynamicRepairMagnitude = 0;
				var selectedReport = false;
				for (var key in mapValidityReports) {
					if (mapValidityReports[key].terrainKey === selectedTerrain.terrainKey) {
						dynamicRepairMagnitude = mapValidityReports[key].repairMagnitude - selectedProgress.getPercent();
						selectedReport = mapValidityReports[key];
					}
				}

				if (selectedReport) {
					Scaled.Commons.log("Correcting Values for " + selectedTerrain.terrainKey + " Current Percent: " + selectedProgress.getPercent() + " Repair Percent Needed: ", selectedReport.repairMagnitude, Scaled.Commons.validLogKeys.correctionLogKey);
					var shouldIncrease = true;
					var bufferChange = 0;
					if (selectedReport.positiveIncrease) {
						// Need some less of the Stuff
						if (dynamicRepairMagnitude < 0) {
							shouldIncrease = false;
						}

					} else {
						// Need some less of the Stuff
						if (dynamicRepairMagnitude > 0) {
							shouldIncrease = false;
						}
					}
					var basicRepairValue = 15;
					basicRepairValue += Math.abs(dynamicRepairMagnitude);
					// Scaled.Commons.randomizePlusMinusControlled(minValue, maxValue, barMinimum, barMaximum, barMargin);
					if (shouldIncrease) {
						// Always Positive between 1,basicRepairValue
						bufferChange = Scaled.Commons.randomizePlusMinusControlled(1, basicRepairValue, 1, 10, 0);
						Scaled.Commons.log("Increasing Value of Cell By", bufferChange, Scaled.Commons.validLogKeys.correctionLogKey);
					} else {
						// Always Negative betweem 1,basicRepairValue
						bufferChange = Scaled.Commons.randomizePlusMinusControlled(1, basicRepairValue, 1, 10, 15);
						Scaled.Commons.log("Decreasing Value of Cell By", bufferChange, Scaled.Commons.validLogKeys.correctionLogKey);
					}

					cellValue += bufferChange;

					// cellValue = cellValue > selectedTerrain.terrainUpperValue ? selectedTerrain.terrainUpperValue : cellValue;
					// cellValue = cellValue < selectedTerrain.terrainLowerValue ? selectedTerrain.terrainLowerValue : cellValue; 
				}
			}

			return cellValue;
		};

		/**
		 * Correction Buffer to determine value per cell
		 * @param  {int} cellValue Cell's current Value
		 * @return {int}           Corrected Cell Value
		 */
		var correctionBuffer = function (cellValue) {
			var key;
			var responsibleTerrains = getLayersFromValue(cellValue);
			var regularTerrains = Scaled.Commons.getMainTerrains(terrains);

			for (key in responsibleTerrains) {
				if (responsibleTerrains[key].isRegularTerrain() === true) {
					terrainKey = responsibleTerrains[key].getData().terrainKey;
					break;
				}
			}

			var selectedTerrain = Scaled.Commons.getTerrainByKey(regularTerrains, terrainKey);
			if (selectedTerrain) {
				var selectedProgress = false;
				for (key in mapProgress) {
					if (mapProgress[key].terrainKey === selectedTerrain.terrainKey) {
						mapProgress[key].increment();
						selectedProgress = mapProgress[key];
					} else {
						mapProgress[key].pass();
					}
					// Scaled.Commons.log(mapProgress[key].terrainKey, mapProgress[key].getPercent() + "%", Scaled.Commons.validLogKeys.correctionLogKey);
				}

				if (selectedProgress) {
					return analyzeCorrection(cellValue, selectedTerrain, selectedProgress);
				}
			}
			Scaled.Commons.warn("Unable to find Regular Terrain for the Given Cell Value");
			return cellValue;
		};


		/**
		 * Modified Version of a Diamond Square Algorithm with extra Variation Added
		 * @param  {Array}		mapValues   Map on which Diamond Square to be applied
		 * @param  {integer}	boxSize 	Size of the Box. (Last Index of the box)
		 * @param  {Array}		repairSalt 	Contains information regarding the Repair needed
		 * @return {Array}		mapValues 	Final Modified Map
		 */
		var diamondSquare = function (boxSize, repairSalt) {
			Scaled.Commons.info("Diamond Step Starting");
			diamondStep(boxSize / 2, boxSize / 2, boxSize, repairSalt);
			Scaled.Commons.info("Square Step Starting");
			squareStep(boxSize / 2, boxSize / 2, boxSize, repairSalt);
		};

		var diamondStep = function (posX, posY, boxSize, repairSalt) {

			//Scaled.Commons.log("MAP VALUES BEFORE STEP", mapValues, Scaled.Commons.validLogKeys.diamondSquareLogKey);


			var halfBoxSize = Math.floor(boxSize / 2);
			var quartBoxSize = Math.floor(halfBoxSize / 2);

			Scaled.Commons.log("HalfBoxSize", halfBoxSize, Scaled.Commons.validLogKeys.diamondSquareLogKey);
			Scaled.Commons.log("QuarterBoxSize", quartBoxSize, Scaled.Commons.validLogKeys.diamondSquareLogKey);

			Scaled.Commons.log(
				"Getting Average of", [
					"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
					"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
					"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
					"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]"
				],
				Scaled.Commons.validLogKeys.diamondSquareLogKey
			);



			mapValues[posX][posY] = Scaled.Commons.getAverage([
				mapValues[posX - halfBoxSize][posY - halfBoxSize],
				mapValues[posX - halfBoxSize][posY + halfBoxSize],
				mapValues[posX + halfBoxSize][posY - halfBoxSize],
				mapValues[posX + halfBoxSize][posY + halfBoxSize],
			]);


			mapValues[posX][posY] = correctionBuffer(mapValues[posX][posY]);

			Scaled.Commons.log("Value of Center [" + posX + "][" + posY + "]", mapValues[posX][posY], Scaled.Commons.validLogKeys.diamondSquareLogKey);
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

			Scaled.Commons.log("HalfBoxSize", halfBoxSize, Scaled.Commons.validLogKeys.diamondSquareLogKey);
			Scaled.Commons.log("QuarterBoxSize", quartBoxSize, Scaled.Commons.validLogKeys.diamondSquareLogKey);

			Scaled.Commons.log(
				"Getting Average of", [
					"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
					"[" + (posX) + "],[" + (posY) + "]",
					"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
					"[" + (posX - boxSize) + "],[" + (posY) + "]"
				],
				Scaled.Commons.validLogKeys.diamondSquareLogKey
			);

			mapValues[posX - halfBoxSize][posY] = Scaled.Commons.getAverage([
				Scaled.Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize),
				Scaled.Commons.tryGetArrayValue(mapValues, posX, posY),
				Scaled.Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize),
				Scaled.Commons.tryGetArrayValue(mapValues, posX - boxSize, posY)
			]) + Scaled.Commons.randomizePlusMinus(0, 5);


			mapValues[posX - halfBoxSize][posY] = correctionBuffer(mapValues[posX - halfBoxSize][posY]);

			Scaled.Commons.log("Value of [" + (posX - halfBoxSize) + "][" + posY + "]", mapValues[posX - halfBoxSize][posY], Scaled.Commons.validLogKeys.diamondSquareLogKey);
			Scaled.Commons.log(
				"Getting Average of", [
					"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
					"[" + (posX) + "],[" + (posY) + "]",
					"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
					"[" + (posX + boxSize) + "],[" + (posY) + "]"
				],
				Scaled.Commons.validLogKeys.diamondSquareLogKey
			);

			mapValues[posX + halfBoxSize][posY] = Scaled.Commons.getAverage([
				Scaled.Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize),
				Scaled.Commons.tryGetArrayValue(mapValues, posX, posY),
				Scaled.Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize),
				Scaled.Commons.tryGetArrayValue(mapValues, posX + boxSize, posY)
			]) + Scaled.Commons.randomizePlusMinus(0, 5);

			mapValues[posX + halfBoxSize][posY] = correctionBuffer(mapValues[posX + halfBoxSize][posY]);

			Scaled.Commons.log("Value of [" + (posX + halfBoxSize) + "][" + posY + "]", mapValues[posX + halfBoxSize][posY]);
			Scaled.Commons.log(
				"Getting Average of", [
					"[" + (posX - halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
					"[" + (posX) + "],[" + (posY) + "]",
					"[" + (posX + halfBoxSize) + "],[" + (posY - halfBoxSize) + "]",
					"[" + (posX) + "],[" + (posY - boxSize) + "]"
				],
				Scaled.Commons.validLogKeys.diamondSquareLogKey);

			mapValues[posX][posY - halfBoxSize] = Scaled.Commons.getAverage([
				Scaled.Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY - halfBoxSize),
				Scaled.Commons.tryGetArrayValue(mapValues, posX, posY),
				Scaled.Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY - halfBoxSize),
				Scaled.Commons.tryGetArrayValue(mapValues, posX, posY - boxSize)
			]) + Scaled.Commons.randomizePlusMinus(0, 5);

			mapValues[posX][posY - halfBoxSize] = correctionBuffer(mapValues[posX][posY - halfBoxSize]);

			Scaled.Commons.log("Value of [" + (posX) + "][" + (posY - halfBoxSize) + "]", mapValues[posX][posY - halfBoxSize], Scaled.Commons.validLogKeys.diamondSquareLogKey);
			Scaled.Commons.log(
				"Getting Average of", [
					"[" + (posX - halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
					"[" + (posX) + "],[" + (posY) + "]",
					"[" + (posX + halfBoxSize) + "],[" + (posY + halfBoxSize) + "]",
					"[" + (posX) + "],[" + (posY + boxSize) + "]"
				],
				Scaled.Commons.validLogKeys.diamondSquareLogKey
			);

			mapValues[posX][posY + halfBoxSize] = Scaled.Commons.getAverage([
				Scaled.Commons.tryGetArrayValue(mapValues, posX - halfBoxSize, posY + halfBoxSize),
				Scaled.Commons.tryGetArrayValue(mapValues, posX, posY),
				Scaled.Commons.tryGetArrayValue(mapValues, posX + halfBoxSize, posY + halfBoxSize),
				Scaled.Commons.tryGetArrayValue(mapValues, posX, posY + boxSize)
			]) + Scaled.Commons.randomizePlusMinus(0, 5);

			mapValues[posX][posY + halfBoxSize] = correctionBuffer(mapValues[posX][posY + halfBoxSize]);

			Scaled.Commons.log("Value of [" + (posX) + "][" + (posY + halfBoxSize) + "]", mapValues[posX][posY + halfBoxSize], Scaled.Commons.validLogKeys.diamondSquareLogKey);
			//Scaled.Commons.log("MAP VALUES AFTER STEP", mapValues, Scaled.Commons.validLogKeys.diamondSquareLogKey);

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

					Scaled.Commons.log("Before Sort - Overlapping Decoration", overlapDecorators, Scaled.Commons.validLogKeys.decorationRenderLogKey);
					Scaled.Commons.log("Before Sort - Non-Overlapping Decoration", nonOverlapDecorators, Scaled.Commons.validLogKeys.decorationRenderLogKey);
					overlapDecorators.sort(sortByZLevel);
					nonOverlapDecorators.sort(sortByZLevel);
					Scaled.Commons.log("After Sort - Overlapping Decoration", overlapDecorators, Scaled.Commons.validLogKeys.decorationRenderLogKey);
					Scaled.Commons.log("After Sort - Non-Overlapping Decoration", nonOverlapDecorators, Scaled.Commons.validLogKeys.decorationRenderLogKey);

					// STEP 2
					var totalPercent = 0;
					var maxValuePossible = nonOverlapDecorators.length * 100;
					for (nonOverlapKey in nonOverlapDecorators) {
						totalPercent += nonOverlapDecorators[nonOverlapKey].getDecorationData().placementPercent;
					}

					if (totalPercent > maxValuePossible) {
						Scaled.Commons.warn("Error Adding Placement Percentage of Decoration Terrains - Reverting Terrains to 100% per terrain");
						totalPercent = nonOverlapDecorators.length * 100;
						for (nonOverlapKey in nonOverlapDecorators) {
							nonOverlapDecorators[nonOverlapKey].getDecorationData().placementPercent = 100;
						}
					}

					Scaled.Commons.log("totalPercent", totalPercent, Scaled.Commons.validLogKeys.decorationRenderLogKey);

					// 35% + 35% will be 70/200
					var randomPercent = Scaled.Commons.randomize(0, maxValuePossible);
					var terrainToUse = null;
					var cumulativePercent = 0;
					Scaled.Commons.log("maxValuePossible", maxValuePossible, Scaled.Commons.validLogKeys.decorationRenderLogKey);
					Scaled.Commons.log("randomPercent", randomPercent, Scaled.Commons.validLogKeys.decorationRenderLogKey);
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
						Scaled.Commons.log("Pushing", terrainToUse, Scaled.Commons.validLogKeys.decorationRenderLogKey);
					}

					// STEP 4
					for (overlapKey in overlapDecorators) {
						randomPercent = Scaled.Commons.randomize(0, 100);
						if (randomPercent <= overlapDecorators[overlapKey].getDecorationData().placementPercent) {
							selectedTerrains.push(overlapDecorators[overlapKey]);
							Scaled.Commons.log("Pushing", overlapDecorators[overlapKey], Scaled.Commons.validLogKeys.decorationRenderLogKey);
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
			var terrainData = new Scaled.ScaledTerrain();

			terrainData.createTerrain(terrainObject.label, terrainObject.key, terrainObject.max, terrainObject.min);

			if ('type' in terrainObject) {
				if (possibleTerrains.indexOf(terrainObject.type) !== -1) {
					terrainData.setType(terrainObject.type);
				} else {
					Scaled.Commons.error("Error Adding Terrain Type : " + terrainObject.type);
				}
			}

			if ('default' in terrainObject && hasDefaultTerrain === false) {
				hasDefaultTerrain = true;
				terrainData.setDefault();
			}
			Scaled.Commons.log("Adding Terrain", terrainData.getData(), Scaled.Commons.validLogKeys.mapInitializeLogKey);
			terrains.push(terrainData);
		};

		/**
		 * Assigns Starting Condition to a Particular Layer
		 * @param {object}	conditionObject Object containing information about the starting condition
		 */
		this.addStartingCondition = function (conditionObject) {
			var terrainObject = Scaled.Commons.getTerrainByKey(terrains, conditionObject["terrainKey"]);
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

			maxValue = maxValue < 0 ? -1 : maxValue;
			minValue = minValue < 0 ? -1 : minValue;

			// Swapping in case of Opposite
			if (maxValue < minValue && maxValue !== -1 && minValue !== -1) {
				Scaled.Commons.warn("Terrain (" + terrainKey + ") Validation minPercent is more than its maxPercent, Swapping Values");
				var tempValue = minValue;
				minValue = maxValue;
				maxValue = tempValue;
			}


			Scaled.Commons.getTerrainByKey(terrains, terrainKey).setValidation(minValue, maxValue);
		};


		/**
		 * Adds GID Information about the Specified Terrain
		 * @param {object} Object containing information about GID & Terrain Key
		 */
		this.setTileInfo = function (tileObject) {
			var terrainKey = tileObject["terrainKey"];
			var tiles = tileObject["tiles"];
			var decoration = tileObject["decoration"] ? tileObject["decoration"] : false;

			Scaled.Commons.getTerrainByKey(terrains, terrainKey).setTileInfo(tiles);
			Scaled.Commons.getTerrainByKey(terrains, terrainKey).setDecorationData(decoration);
		};

		/**
		 * Checks the Validity of the Main Terrains. Based on the Validation Rules set.
		 */
		this.checkRegularTerrainValidity = function () {
			var regularTerrains = Scaled.Commons.getMainTerrains(terrains);
			var validStatus = true;
			for (var key in regularTerrains) {
				var percent = getLayerPercentage(regularTerrains[key].terrainKey);
				var validityReport = null;
				if (regularTerrains[key].terrainValidationMinPercent != -1) {
					if (percent < regularTerrains[key].terrainValidationMinPercent) {
						validStatus = false;
						validityReport = new Scaled.ScaledValidityReport(regularTerrains[key].terrainKey, Math.abs(percent - regularTerrains[key].terrainValidationMinPercent), true);
					}
				}

				if (regularTerrains[key].terrainValidationMaxPercent != -1) {
					if (percent > regularTerrains[key].terrainValidationMaxPercent) {
						validStatus = false;
						validityReport = new Scaled.ScaledValidityReport(regularTerrains[key].terrainKey, Math.abs(percent - regularTerrains[key].terrainValidationMaxPercent), false);
					}
				}

				if (validityReport !== null) {
					mapValidityReports.push(validityReport);
				}
			}

			Scaled.Commons.log("Validity Reports", mapValidityReports, Scaled.Commons.validLogKeys.mapValidationLogKey);

			return validStatus;
		};

		/**
		 * Gets the percentages of all the Regular Terrains in the Map
		 * @return {object} Indexed {terrainKey, percentage}
		 */
		this.getRegularTerrainPercentages = function () {
			var percentTerrains = {};
			var regularTerrains = Scaled.Commons.getMainTerrains(terrains);

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
			Scaled.Commons.info("Map Init Starting");
			Scaled.Commons.log("Terrains Before Map Generation", terrains, Scaled.Commons.validLogKeys.mapInitializeLogKey);
			init();
			initStartingConditions();
			Scaled.Commons.info("Pre Generation Clean Up");
			preGenerationCleanUp();
			Scaled.Commons.info("Diamond Square Algorithm Starting");
			diamondSquare(rowSize - 1, null);
			Scaled.Commons.info("Post Generation Clean Up");
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

	Scaled.ScaledMap = ScaledMap;
	return Scaled;

}(Scaled || {}));