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
    quotes = new Quotes(this.auth, this.pairs)   
    constructor() {
        // Do crypto init
        this.getPairs()
        .then(success => {
          this.pairs = success.results
          this.quotes = new Quotes(this.auth, this.pairs)
        })
        .catch(err => {
          console.error(err)
        })
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