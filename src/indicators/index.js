class Indicators {
  constructor() {
    this.history = [];
  }

  macd(value, options) {
    const fastPeriod = options && options.fastPeriod ? options.fastPeriod : 12;
    const slowPeriod = options && options.slowPeriod ? options.slowPeriod : 26;
    const signalPeriod = options && options.signalPeriod ? options.signalPeriod : 9;
    this.history.push(value);
    const A = this.ema(this.history, slowPeriod);
    const B = this.ema(this.history, fastPeriod);
    const C = A.map((x,i) => { 
      return (x - B[i]);
    }).map((x) => {
      return Math.abs(x);
    });
    console.log(
      C,
      this.history,
      this.history[fastPeriod],
      this.history[slowPeriod],
      this.history[signalPeriod],
    );
  }
  // Exponential Moving Average
  ema(mArray, mRange) {
    
    const k = 2 / (mRange + 1);
    // first item is just the same as the first item in the input
    const emaArray = [mArray[0]];
    // for the rest of the items, they are computed with the previous one
    for (let i = 1; i < mArray.length; i + 1) {
      emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
    }
    return emaArray;
  }
  //   rsi() {}
  //   ma() {}
}

module.exports = Indicators;
