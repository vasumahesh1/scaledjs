// ----- Construct -----    
var Commons = {};

// ----- Declare Vars Here -----
var PLUS_MINUS_BAR = 4;

Commons.RoundNumber = function(number) {
	return Math.round(number);
};

Commons.Randomize = function(minValue, maxValue) {
	return Math.floor((Math.random() * (maxValue + 1)) + minValue);
};

Commons.RandomizeInArray = function(arrayList) {
	var minValue = 0;
	var maxValue = arrayList.length - 1;
	var index = this.Randomize(minValue, maxValue);
	return arrayList[index];
};

Commons.RandomizeWithException = function(minValue, maxValue, exceptList) {
	var value = -1;
	do {
		value = this.Randomize(minValue, maxValue);
	}
	while (exceptList.indexOf(value) != -1);
	return value;

};

Commons.RandomizePlusMinus = function(minValue, maxValue) {
	var barValue = this.Randomize(1, 10);
	var randomValue = this.Randomize(minValue, maxValue);
	if (barValue <= PLUS_MINUS_BAR) {
		return (barValue * -1);
	}
	return barValue;
};