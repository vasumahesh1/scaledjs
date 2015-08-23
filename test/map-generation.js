"use strict";
var assert = require("assert");
var scaledGen = require("../build/scaled.js");

describe("map-generation", function () {
	var generator = undefined;
	var validation = {
		layer_water: 15,
		layer_plain: 35
	};

	it("Map shouldn't be Undefined", function (done) {
		generator = new scaledGen();
		generator.should.not.equal(undefined);
		generator.addTerrain({
			key: 'layer_water',
			label: 'Water',
			max: 30,
			min: 0,
			default: true
		});

		generator.addTerrain({
			key: 'layer_plain',
			label: 'Plain',
			max: 65,
			min: 30
		});

		for(var key in validation) {
			generator.addValidationRule({
				terrainKey: key,
				minPercent: validation[key]
			});
		}

		generator.generateMap();
		done();
	});

	it("Terrain generated Percentages", function (done) {
		generator.should.not.equal(undefined);
		var percentages = generator.getRegularTerrainPercentages();
		for(var key in percentages) {
			if(validation[key]) {
				console.log(key, validation[key], percentages[key]);
				percentages[key].should.be.within(validation[key], 100);
			}
		}

		done();
	});

});