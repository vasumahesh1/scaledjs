// ----- Construct -----    
var Commons = {};

// ----- Declare Vars Here -----
var PLUS_MINUS_BAR = 4;

Commons.RoundNumber = function (number) {
    return Math.round(number);
};

Commons.Randomize = function (minValue, maxValue) {
    return Math.floor((Math.random() * maxValue) + minValue);
};

Commons.RandomizePlusMinus = function (minValue, maxValue) {
    var barValue = this.Randomize(1 , 10);
    var randomValue = this.Randomize(minValue, maxValue);
    if (barValue <= PLUS_MINUS_BAR) {
        return (barValue * -1);
    }
    return barValue;
};
