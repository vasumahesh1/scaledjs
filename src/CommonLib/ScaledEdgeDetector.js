var ScaledEdgeDetector = function (edgeSettings) {
	var terrains = edgeSettings.terrains;
	var domination = edgeSettings.domination;
	var domPriority = domination.dominationPriority;

	var GetDominationValue = function (terrainKey) {
		return domPriority.indexOf(terrainKey);
	};

	var GetLowestDomination = function (primaryValue, arrayValues) {
		var primaryDomination = primaryValue;
		var primaryDominationValue = GetDominationValue(primaryValue);
		for (var key in arrayValues) {
			if (arrayValues[key] !== -1) {
				var dominationValue = GetDominationValue(arrayValues[key]);
				if (dominationValue < primaryDominationValue) {
					primaryDominationValue = dominationValue;
					primaryDomination = arrayValues[key];
				}
			}

		}
		return primaryDomination;

	};


	var GetAdjacentSimilarity = function (primaryValue, adjacentValues) {
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


	var GetDiagonalSimilarity = function (primaryValue, diagonalValues) {
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

	var AllSquareSidesSimilar = function (similarity) {
		if (similarity.top === true && similarity.left === true && similarity.right === true && similarity.bottom === true) {
			return true;
		}
		return false;
	};

	this.ResolveTileValue = function (primaryValue, adjacentValues, diagonalValues) {
		if (Commons.GetDefaultTerrain(terrains).terrainKey == primaryValue) {
			return [];
		}
		Commons.Log("Primary Cell Layer", primaryValue, Commons.validLogKeys.tmxRenderLogKey);
		Commons.Log("Adjacent Values", adjacentValues, Commons.validLogKeys.tmxRenderLogKey);
		Commons.Log("Diagonal Values", diagonalValues, Commons.validLogKeys.tmxRenderLogKey);
		var finalTiles = [];
		var primaryTileInfo = Commons.GetTerrainByKey(terrains, primaryValue).getGidInfo();
		var lowestDomination = GetLowestDomination(primaryValue, adjacentValues);
		if (lowestDomination != primaryValue) {
			Commons.Log("Lowest Domination", lowestDomination, Commons.validLogKeys.tmxRenderLogKey);
			var lowestDominationTile = Commons.GetTerrainByKey(terrains, lowestDomination).getGidInfo().other.full;
			finalTiles.push(lowestDominationTile);
		}

		var similarity = GetAdjacentSimilarity(primaryValue, adjacentValues);
		var diagonalSimilarity = GetDiagonalSimilarity(primaryValue, diagonalValues);
		Commons.Log("Similarity", similarity, Commons.validLogKeys.tmxRenderLogKey);
		// All Similar or Not
		if (AllSquareSidesSimilar(similarity) === true) {
			// All Similar
			// 
			finalTiles.push(primaryTileInfo.other.full);

		} else {
			// Nothing Similar : Calls for Closed Loops
			if (similarity.count === 0) {
				finalTiles.push(primaryTileInfo.other.openLoops.openEnds.none);
			} else {
				// All Sides Not Similar
				// Enclose Mode for 3 Side Adjacent Similarity
				if (similarity.top === true && similarity.left === true && similarity.right === true) {
					finalTiles.push(primaryTileInfo.enclosing.top.topValue);
				} else if (similarity.bottom === true && similarity.left === true && similarity.right === true) {
					finalTiles.push(primaryTileInfo.enclosing.bottom.bottomValue);
				} else if (similarity.top === true && similarity.bottom === true && similarity.right === true) {
					finalTiles.push(primaryTileInfo.enclosing.right.rightValue);
				} else if (similarity.top === true && similarity.bottom === true && similarity.left === true) {
					finalTiles.push(primaryTileInfo.enclosing.left.leftValue);
				}
				// Exclose Mode for 2 Side Adjacent Similarity
				else if (similarity.top === true && similarity.left === true) {
					finalTiles.push(primaryTileInfo.excluding.bottom.rightValue);
				} else if (similarity.top === true && similarity.right === true) {
					finalTiles.push(primaryTileInfo.excluding.bottom.leftValue);
				} else if (similarity.bottom === true && similarity.left === true) {
					finalTiles.push(primaryTileInfo.excluding.top.rightValue);
				} else if (similarity.bottom === true && similarity.right === true) {
					finalTiles.push(primaryTileInfo.excluding.top.leftValue);
				} else if (similarity.bottom === true && similarity.top === true) {
					finalTiles.push(primaryTileInfo.other.openLoops.twoWay.topBottom);
				} else if (similarity.left === true && similarity.right === true) {
					finalTiles.push(primaryTileInfo.other.openLoops.twoWay.leftRight);
				}
				// Enclose Mode for 1 Side Similarity
				else if (similarity.top === true) {
					finalTiles.push(primaryTileInfo.other.openLoops.openEnds.top);
				} else if (similarity.right === true) {
					finalTiles.push(primaryTileInfo.other.openLoops.openEnds.right);
				} else if (similarity.left === true) {
					finalTiles.push(primaryTileInfo.other.openLoops.openEnds.left);
				} else if (similarity.bottom === true) {
					finalTiles.push(primaryTileInfo.other.openLoops.openEnds.bottom);
				}
			}



		}

		if (AllSquareSidesSimilar(similarity) === true && diagonalSimilarity.count !== 4) {
			if(diagonalSimilarity.topLeft === false) {
				finalTiles.push(primaryTileInfo.enclosing.bottom.rightValue);
			}
			if(diagonalSimilarity.topRight === false) {
				finalTiles.push(primaryTileInfo.enclosing.bottom.leftValue);
			}
			if(diagonalSimilarity.bottomLeft === false) {
				finalTiles.push(primaryTileInfo.enclosing.top.rightValue);
			}
			if(diagonalSimilarity.bottomRight === false) {
				finalTiles.push(primaryTileInfo.enclosing.top.leftValue);
			}
		}





		Commons.Log("Final Tiles", finalTiles, Commons.validLogKeys.tmxRenderLogKey);
		return finalTiles;
	};
};