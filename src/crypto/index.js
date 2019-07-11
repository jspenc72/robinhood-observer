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
    account = {}
    constructor() {

    }

    getRobinhoodCryptoAccount(account_id) {
      var tOpts = {
          uri: config.nummus_url + endpoints.accounts,
          headers: {
              'Host': 'nummus.robinhood.com'
          }        
      }    
      console.log(tOpts)
      return this.auth.get(tOpts)
    }

    init(auth){
      this.auth = auth
    
      return new Promise((resolve, reject) => {
        this.getRobinhoodCryptoAccount()
        .then(success => {
          this.account = success.results[0]
          this.auth.crypto_account = success.results[0]
          return this.getPairs()
        })
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