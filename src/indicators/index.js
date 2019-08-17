const _ = require("lodash")

class Indicators {
    history = []
    constructor() {

    }
// Moving Average Convergence Divergence
    macd(value, options){
        this.history.push(value);
        var fastPeriod = (options && options.fastPeriod) ? options.fastPeriod : 12;
        var slowPeriod = (options && options.slowPeriod) ? options.slowPeriod : 26;
        var signalPeriod = (options && options.signalPeriod) ? options.signalPeriod : 9;        

        var A = this.ema(this.history,slowPeriod), B = this.ema(this.history,fastPeriod)
        var C = A.map( (x, i) => x - B[i] ).map( x => Math.abs(x) );
        console.log(C, this.history, this.history[fastPeriod], this.history[slowPeriod])
    }
// Exponential Moving Average
    ema(mArray, mRange){
        var k = 2/(mRange + 1);
        // first item is just the same as the first item in the input
        var emaArray = [mArray[0]];
        // for the rest of the items, they are computed with the previous one
        for (var i = 1; i < mArray.length; i++) {
          emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
        }
        return emaArray;
    }
    rsi(){

    }
    ma() {
        
    }
}

module.exports = Indicators