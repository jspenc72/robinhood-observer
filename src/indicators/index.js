class Indicators {
  constructor() {
    this.history = [];
    this.cema = 0;
    this.cmacd = 0;
  }

  macd(value, options) {
    const fastPeriod = options && options.fastPeriod ? options.fastPeriod : 12;
    const slowPeriod = options && options.slowPeriod ? options.slowPeriod : 26;
    const signalPeriod = options && options.signalPeriod ? options.signalPeriod : 9;
    this.history.push(value);
    const A = this.ema(this.history, slowPeriod);
    const B = this.ema(this.history, fastPeriod);
    const C = A
      .map((x, i) => (x - B[i]))
      .map(x => Math.abs(x));
    this.cmacd = {
      macd: C,
      history: this.history,
      fast: this.history[fastPeriod],
      slow: this.history[slowPeriod],
      signal: this.history[signalPeriod],
    };
    return this.cmacd;
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
    this.cema = emaArray;
    return emaArray;
  }
  //   rsi() {}
  //   ma() {}
}

module.exports = Indicators;
