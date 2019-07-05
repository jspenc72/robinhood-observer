var RxJS = require('rxjs'),
  Rx = require('rx'),
  Promise = require("bluebird"),
  _ = require("lodash"),
  fs = require("fs"),
  Auth = require("../auth.js"),
  endpoints = require("../endpoints"),
  Orders = require("./orders"),
  Quotes = require("./quotes"),
  config = require('../config')
    
class Crypto {
    pairs = []
    auth = new Auth()
    orders = new Orders()
    quotes = {}
    constructor() {
        // Do crypto init
        // Added 500 ms timeout to delay request until after auth headers are set.
        //MARK: NEED to and PLAN to make this more resilient   to slow bandwidth networks.
          setTimeout(() => {
            this.getPairs()
            .then(success => {
              this.pairs = success.results
              this.quotes = new Quotes(this.auth, this.pairs)
            })
            .catch(err => {
              console.error(err)
            })              
          }, 500)
    }

    getPairs(callback){
      var tUri =  "https://nummus.robinhood.com/" + endpoints.currency_pairs
      return this.auth.get({
        uri: tUri,
        headers: {
          'Host': 'nummus.robinhood.com'
        }
      }, callback);
    };
}

module.exports = Crypto