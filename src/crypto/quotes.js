var config = require('../config'),
    Rx = require('rx'),
    _ = require("lodash"),
    config = require('../config'),
    endpoints = require("../endpoints")

class Quotes {
    auth = {}
    pairs = {}
    constructor(auth, pairs) {
        // Do crypto init
        this.pairs = pairs
        this.auth = auth
    }
    observe(symbol, frequency) {
        frequency = frequency ? frequency : 800;         //Set frequency of updates to 800 by default
        var source = Rx.Observable.create((observer) => {
          var intrvl
          intrvl = setInterval(() => {
            this.get(symbol)
            .then(success => {
              observer.onNext(success);
            })
            .catch(err => {
              console.error(err)
            })
          }, frequency);  
          return () => {
            clearInterval(intrvl);
          }      
        })
        return source
    }
    get(symbol, callback) {
        var tUri = config.api_url + endpoints.marketdata_forex_quotes,
            tOpts = {
            uri: tUri
        };

        symbol = Array.isArray(symbol) ? symbol : [symbol];
        var filtered = _.filter(this.pairs, (o) => {
            return (symbol.indexOf(o.symbol) > -1) || (symbol.indexOf(o.symbol.split('-')[0]) > -1)
        })
        var indexed = _.map(filtered, (o) => {
            var index = (symbol.indexOf(o.symbol) > -1) ? symbol.indexOf(o.symbol) : ((symbol.indexOf(o.symbol.split('-')[0]) > -1) ? symbol.indexOf(o.symbol.split('-')[0]) : 0)
            o.index = index;
            return o;
        });
        var sorted = _.sortBy(indexed, ['index'])
        var targets = _.map(sorted, item => {
            return item.id
        }).join(',')
        var tOpts = {
            uri: config.api_url + endpoints.marketdata_forex_quotes,
            qs: { 'ids': targets }
        }
        return this.auth.get(tOpts, callback)
    }
}  

module.exports = Quotes