const Rx = require('rx');
const _ = require('lodash');
const config = require('../config');
const Auth = require('../auth.js');
const endpoints = require('../endpoints');

class Portfolios {
  constructor(auth, pairs) {
    // Do crypto init
    this.auth = auth;
    this.pairs = pairs;
  }

  observe(frequency) {
    frequency = frequency || 800; // Set frequency of updates to 800 by default
    const source = Rx.Observable.create((observer) => {
      let intrvl;
      intrvl = setInterval(() => {
        console.log(new Date());
        this.get()
          .then((success) => {
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

  get() {
    const tOpts = {
      uri: config.nummus_url + endpoints.portfolios,
      headers: {
        Host: 'nummus.robinhood.com',
      },
    };
    return this.auth.get(tOpts);
  }
}
module.exports = Portfolios;
