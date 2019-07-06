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
    constructor() {

    }

    init(auth){
      this.auth = auth
      return new Promise((resolve, reject) => {
        this.getPairs()
        .then(success => {
          this.pairs = success.results
          this.quotes = new Quotes(this.auth, this.pairs)
          this.orders = new Orders(this.auth, this.pairs)
          resolve(success)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
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