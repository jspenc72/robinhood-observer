const Rx = require('rx');
const _ = require('lodash');
const config = require('../config');
const endpoints = require('../endpoints');

class Quotes {
  constructor(auth, pairs) {
    // Do crypto init
    this.auth = auth;
    this.pairs = pairs;
  }

  observe(symbol, frequency) {
    frequency = frequency || 800; // Set frequency of updates to 800 by default
    const source = Rx.Observable.create((observer) => {
      let intrvl;
      intrvl = setInterval(() => {
        const sent = new Date();
        this.get(symbol)
          .then((success) => {
            const received = new Date();
            success.sent = sent;
            success.received = received;
            observer.onNext(success);
          })
          .catch((err) => {
            console.error(err);
          });
      }, frequency);
      return () => {
        clearInterval(intrvl);
      };
    });
    return source;
  }

  get(symbol, callback) {
    symbol = Array.isArray(symbol) ? symbol : [symbol];
    const filtered = _.filter(this.pairs, o => (symbol.indexOf(o.symbol) > -1) || (symbol.indexOf(o.symbol.split('-')[0]) > -1));
    const indexed = _.map(filtered, (o) => {
      const index = (symbol.indexOf(o.symbol) > -1) ? symbol.indexOf(o.symbol) : ((symbol.indexOf(o.symbol.split('-')[0]) > -1) ? symbol.indexOf(o.symbol.split('-')[0]) : 0);
      o.index = index;
      return o;
    });
    const sorted = _.sortBy(indexed, ['index']);
    const targets = _.map(sorted, item => item.id).join(',');
    const tOpts = {
      uri: config.api_url + endpoints.marketdata_forex_quotes,
      qs: { ids: targets },
    };
    return this.auth.get(tOpts, callback);
  }
}

module.exports = Quotes;
