'use strict';
var assert = require("assert");
var scaledGen = require('../build/scaled.js');

describe('map-generation', function () {
	var generator = undefined;
	it('Shouldn\'t be Undefined', function (done) {
		generator = new scaledGen();
		generator.should.not.equal(undefined);
		done();
	});
});