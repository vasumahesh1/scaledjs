"use strict";
var assert = require("assert");
var scaledGen = require("../build/scaled.js");

describe("map-generation", function () {
	var generator = undefined;

	var generateMapSample = function (terrains, validations) {
		generator = new scaledGen({
			debug: false,
			maxTries: 5,
			logs: []
		});

		for (var key in terrains) {
			generator.addTerrain(terrains[key]);
		}

		for (var key in validations) {
			generator.addValidationRule(validations[key]);
		}

		generator.generateMap();
	};

	var getValidationByKey = function (validations, terrainKey) {
		for (var key in validations) {
			if (validations[key].terrainKey == terrainKey) {
				return validations[key];
			}
		}

		return false;
	};

	var testValidation = function (percentages, validations) {
		for (var key in percentages) {
			var validation = getValidationByKey(validations, key);
			if (validation) {
				console.log(key + " [" + validation.minPercent + "," + validation.maxPercent + "] ", percentages[key]);
				if (validation.minPercent && validation.maxPercent) {
					percentages[key].should.be.within(validation.minPercent, validation.maxPercent);
				} else if (validation.minPercent) {
					percentages[key].should.be.within(validation.minPercent, 100);
				} else {
					percentages[key].should.be.within(0, validation.maxPercent);
				}
			}
		}
	};

	it("Test - Map shouldn't be Undefined", function (done) {
		var validations = [{
			terrainKey: 'layer_water',
			minPercent: 15,
			maxPercent: 55,
		}, {
			terrainKey: 'layer_plain',
			minPercent: 35,
			maxPercent: 100,
		}];

		var terrains = [{
			key: 'layer_water',
			label: 'Water',
			max: 30,
			min: 0,
			default: true
		}, {
			key: 'layer_plain',
			label: 'Plain',
			max: 65,
			min: 30
		}];

		generateMapSample(terrains, validations);
		generator.should.not.equal(undefined);
		done();
	});

	it("Test - Terrain generated with Irregular Order", function (done) {
		var validations = [{
			terrainKey: 'layer_water',
			minPercent: 15,
			maxPercent: 55,
		}, {
			terrainKey: 'layer_plain',
			minPercent: 35,
			maxPercent: 100,
		}];

		var terrains = [{
			key: 'layer_plain',
			label: 'Plain',
			max: 65,
			min: 30
		}, {
			key: 'layer_water',
			label: 'Water',
			max: 30,
			min: 0,
			default: true
		}];

		generateMapSample(terrains, validations);
		generator.should.not.equal(undefined);
		done();
	});

	// it("Test - Terrain generated Percentages", function (done) {
	// 	var validations = [{
	// 		terrainKey: 'layer_water',
	// 		minPercent: 15,
	// 		maxPercent: 55,
	// 	}, {
	// 		terrainKey: 'layer_plain',
	// 		minPercent: 35,
	// 		maxPercent: 100,
	// 	}];

	// 	generator.should.not.equal(undefined);
	// 	var percentages = generator.getRegularTerrainPercentages();
	// 	testValidation(percentages, validations);

	// 	done();
	// });


	// it("Test - Terrain generated for Invalid Percentages", function (done) {
	// 	var validations = [{
	// 		terrainKey: 'layer_water',
	// 		minPercent: 100,
	// 		maxPercent: 55,
	// 	}, {
	// 		terrainKey: 'layer_plain',
	// 		minPercent: 100,
	// 		maxPercent: 100,
	// 	}];

	// 	var terrains = [{
	// 		key: 'layer_water',
	// 		label: 'Water',
	// 		max: 30,
	// 		min: 0,
	// 		default: true
	// 	}, {
	// 		key: 'layer_plain',
	// 		label: 'Plain',
	// 		max: 65,
	// 		min: 30
	// 	}];

	// 	generateMapSample(terrains, validations);
	// 	generator.should.not.equal(undefined);
	// 	var percentages = generator.getRegularTerrainPercentages();
	// 	testValidation(percentages, validations);

	// 	done();
	// });

});