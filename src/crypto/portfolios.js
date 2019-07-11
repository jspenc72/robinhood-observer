var config = require('../config'),
    Auth = require("../auth.js"),
    Rx = require('rx'),
    _ = require("lodash"),
    config = require('../config'),
    endpoints = require('../endpoints')

class Portfolios {
    constructor(auth, pairs) {
        // Do crypto init
        this.auth = auth
        this.pairs = pairs
    }
    
    observe(frequency) {
        frequency = frequency ? frequency : 800;         //Set frequency of updates to 800 by default
        var source = Rx.Observable.create((observer) => {
          var intrvl
          intrvl = setInterval(() => {
            console.log(new Date())
            this.get()
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

    get() {
        var tOpts = {
            uri: config.nummus_url + endpoints.portfolios,
            headers: {
                'Host': 'nummus.robinhood.com'
            }            
        };
        return this.auth.get(tOpts)
    }

}
module.exports = Portfolios