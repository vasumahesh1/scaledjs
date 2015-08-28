var Scaled = (function (Scaled) {

	var ScaledEdgeDetector = function (edgeSettings) {
		var terrains = edgeSettings.terrains;
		var domination = edgeSettings.domination;
		var domPriority = domination.dominationPriority;

		var getDominationValue = function (terrainKey) {
			return domPriority.indexOf(terrainKey);
		};

		var getDominationKey = function (dominationIndex) {
			return domPriority[dominationIndex];
		};


		var sortDominationAscending = function (a, b) {
			return a - b;
		};


		var getUnique = function (arr) {
			var u = {},
				a = [];
			for (var i = 0, l = arr.length; i < l; ++i) {
				if (u.hasOwnProperty(arr[i])) {
					continue;
				}
				a.push(arr[i]);
				u[arr[i]] = 1;
			}
			return a;
		};

		var normalizeAdjacency = function (primaryValue, arrayValues) {
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

		var getLowestDomination = function (primaryValue, arrayValues) {
			var dominationValues = [];
			var returnValue;

			var primaryDominationValue = getDominationValue(primaryValue);
			for (var key in arrayValues) {
				if (arrayValues[key] !== -1) {
					var dominationValue = getDominationValue(arrayValues[key]);
					dominationValues.push(dominationValue);
				}

			}
			Scaled.Commons.log("Primary Value", primaryValue, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			Scaled.Commons.log("Surroundings", arrayValues, Scaled.Commons.validLogKeys.tmxRenderLogKey);

			Scaled.Commons.log("Before Unique", dominationValues, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			dominationValues = getUnique(dominationValues);
			Scaled.Commons.log("After Unique", dominationValues, Scaled.Commons.validLogKeys.tmxRenderLogKey);

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


			Scaled.Commons.log("Returning", getDominationKey(returnValue), Scaled.Commons.validLogKeys.tmxRenderLogKey);
			return getDominationKey(returnValue);

		};

		this.allSquareSidesSimilar = function (similarity) {
			if (similarity.top === true && similarity.left === true && similarity.right === true && similarity.bottom === true) {
				return true;
			}
			return false;
		};

		this.getDiagonalSimilarity = function (primaryValue, diagonalValues) {
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

		this.getAdjacentSimilarity = function (primaryValue, adjacentValues) {
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

		this.getTilesBasedOnSimilarity = function (primaryValue, adjacentValues, diagonalValues) {
			var finalTiles = [];
			var primaryTerrain = Scaled.Commons.getTerrainByKey(terrains, primaryValue);
			var normalizedAdjacentValues = normalizeAdjacency(primaryValue, adjacentValues);
			var normalizedDiagonalValues = normalizeAdjacency(primaryValue, diagonalValues);

			var similarity = this.getAdjacentSimilarity(primaryValue, normalizedAdjacentValues);
			var diagonalSimilarity = this.getDiagonalSimilarity(primaryValue, normalizedDiagonalValues);
			Scaled.Commons.log("Similarity", similarity, Scaled.Commons.validLogKeys.tmxRenderLogKey);
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
					}
					// Exclose Mode for 2 Side Adjacent Similarity
					else if (similarity.top === true && similarity.left === true) {
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
					}
					// Enclose Mode for 1 Side Similarity
					else if (similarity.top === true) {
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

			return finalTiles;
		};

		this.resolveTileValue = function (primaryValue, adjacentValues, diagonalValues) {
			if (Scaled.Commons.getDefaultTerrain(terrains).terrainKey == primaryValue) {
				return [];
			}

			Scaled.Commons.log("Primary Cell Layer", primaryValue, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			Scaled.Commons.log("Adjacent Values", adjacentValues, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			Scaled.Commons.log("Diagonal Values", diagonalValues, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			var dominationTiles = [];
			var finalTiles = [];

			var lowestDomination = getLowestDomination(primaryValue, adjacentValues);
			Scaled.Commons.log("Lowest Domination", lowestDomination, Scaled.Commons.validLogKeys.test);
			var lowestDominationTiles = this.getTilesBasedOnSimilarity(lowestDomination, adjacentValues, diagonalValues);
			Scaled.Commons.log("Lowest Domination Tiles", lowestDominationTiles, Scaled.Commons.validLogKeys.test);
			Array.prototype.push.apply(dominationTiles, lowestDominationTiles);
			Scaled.Commons.log("dominationTiles", dominationTiles, Scaled.Commons.validLogKeys.test);

			var edgeTiles = this.getTilesBasedOnSimilarity(primaryValue, adjacentValues, diagonalValues);
			finalTiles = dominationTiles.concat(edgeTiles);
			finalTiles = getUnique(finalTiles);
			Scaled.Commons.log("finalTiles", finalTiles, Scaled.Commons.validLogKeys.test);

			Scaled.Commons.log("Final Tiles", finalTiles, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			return finalTiles;
		};
	};

	Scaled.ScaledEdgeDetector = ScaledEdgeDetector;
	return Scaled;

}(Scaled || {}));