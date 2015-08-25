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

		this.resolveTileValue = function (primaryValue, adjacentValues, diagonalValues) {
			if (Scaled.Commons.getDefaultTerrain(terrains)
				.terrainKey == primaryValue) {
				return [];
			}

			Scaled.Commons.log("Primary Cell Layer", primaryValue, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			Scaled.Commons.log("Adjacent Values", adjacentValues, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			Scaled.Commons.log("Diagonal Values", diagonalValues, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			var finalTiles = [];
			var primaryTerrain = Scaled.Commons.getTerrainByKey(terrains, primaryValue);


			var lowestDomination = getLowestDomination(primaryValue, adjacentValues);
			Scaled.Commons.log("Lowest Domination", lowestDomination, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			var lowestDominationTile = Scaled.Commons.getTerrainByKey(terrains, lowestDomination).getTileData("other-tiles", "all", "fullValue");
			finalTiles.push(lowestDominationTile);


			var normalizedAdjacentValues = normalizeAdjacency(primaryValue, adjacentValues);
			var normalizedDiagonalValues = normalizeAdjacency(primaryValue, diagonalValues);

			var similarity = this.getAdjacentSimilarity(primaryValue, normalizedAdjacentValues);
			var diagonalSimilarity = this.getDiagonalSimilarity(primaryValue, normalizedDiagonalValues);
			Scaled.Commons.log("Similarity", similarity, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			// All Similar or Not
			if (this.allSquareSidesSimilar(similarity) === true) {
				// All Similar
				finalTiles.push(primaryTerrain.getTileData("other-tiles", "all", "fullValue")); // .other.full);

			} else {
				// Nothing Similar : Calls for Closed Loops
				if (similarity.count === 0) {
					finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "noneValue")); // .other.openLoops.openEnds.none);
				} else {
					// All Sides Not Similar
					// Enclose Mode for 3 Side Adjacent Similarity
					if (similarity.top === true && similarity.left === true && similarity.right === true) {
						finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "top", "topValue")); // .enclosing.top.topValue);
					} else if (similarity.bottom === true && similarity.left === true && similarity.right === true) {
						finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "bottom", "bottomValue")); // .enclosing.bottom.bottomValue);
					} else if (similarity.top === true && similarity.bottom === true && similarity.right === true) {
						finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "right", "rightValue")); // .enclosing.right.rightValue);
					} else if (similarity.top === true && similarity.bottom === true && similarity.left === true) {
						finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "left", "leftValue")); // .enclosing.left.leftValue);
					}
					// Exclose Mode for 2 Side Adjacent Similarity
					else if (similarity.top === true && similarity.left === true) {
						finalTiles.push(primaryTerrain.getTileData("excluding-tiles", "bottom", "rightValue")); // .excluding.bottom.rightValue);
					} else if (similarity.top === true && similarity.right === true) {
						finalTiles.push(primaryTerrain.getTileData("excluding-tiles", "bottom", "leftValue")); // .excluding.bottom.leftValue);
					} else if (similarity.bottom === true && similarity.left === true) {
						finalTiles.push(primaryTerrain.getTileData("excluding-tiles", "top", "rightValue")); // .excluding.top.rightValue);
					} else if (similarity.bottom === true && similarity.right === true) {
						finalTiles.push(primaryTerrain.getTileData("excluding-tiles", "top", "leftValue")); // .excluding.top.leftValue);
					} else if (similarity.bottom === true && similarity.top === true) {
						finalTiles.push(primaryTerrain.getTileData("open-tiles", "parallel", "topBottomValue")); // .other.openLoops.twoWay.topBottom);
					} else if (similarity.left === true && similarity.right === true) {
						finalTiles.push(primaryTerrain.getTileData("open-tiles", "parallel", "leftRightValue")); // .other.openLoops.twoWay.leftRight);
					}
					// Enclose Mode for 1 Side Similarity
					else if (similarity.top === true) {
						finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "topValue")); // .other.openLoops.openEnds.top);
					} else if (similarity.right === true) {
						finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "rightValue")); // .other.openLoops.openEnds.right);
					} else if (similarity.left === true) {
						finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "leftValue")); // .other.openLoops.openEnds.left);
					} else if (similarity.bottom === true) {
						finalTiles.push(primaryTerrain.getTileData("open-tiles", "open", "bottomValue")); // .other.openLoops.openEnds.bottom);
					}
				}



			}

			if (this.allSquareSidesSimilar(similarity) === true && diagonalSimilarity.count !== 4) {
				if (diagonalSimilarity.topLeft === false) {
					finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "bottom", "rightValue")); // .enclosing.bottom.rightValue);
				}
				if (diagonalSimilarity.topRight === false) {
					finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "bottom", "leftValue")); // .enclosing.bottom.leftValue);
				}
				if (diagonalSimilarity.bottomLeft === false) {
					finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "top", "rightValue")); // .enclosing.top.rightValue);
				}
				if (diagonalSimilarity.bottomRight === false) {
					finalTiles.push(primaryTerrain.getTileData("enclosing-tiles", "top", "leftValue")); // .enclosing.top.leftValue);
				}
			}





			Scaled.Commons.log("Final Tiles", finalTiles, Scaled.Commons.validLogKeys.tmxRenderLogKey);
			return finalTiles;
		};
	};

	Scaled.ScaledEdgeDetector = ScaledEdgeDetector;
	return Scaled;

}(Scaled || {}));