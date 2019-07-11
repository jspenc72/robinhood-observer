var config = require('../config'),
    Auth = require("../auth.js"),
    Rx = require('rx'),
    _ = require("lodash"),
    config = require('../config'),
    endpoints = require('../endpoints')

class Orders {
    constructor(auth, pairs) {
        // Do crypto init
        this.auth = auth
        this.pairs = pairs
    }

    cancel(order_id) {
        console.log("cancel()", order_id)
        var tOpts = {
            uri: config.nummus_url + endpoints.orders + order_id +"/cancel/",
            headers: {
                'Host': 'nummus.robinhood.com'
            }
        }
        return this.auth.post(tOpts)        
    }
    create(order) {
        order.account_id = this.auth.crypto_account.id
        order.ref_id = this.auth.device.generateToken()
        order.price = order.price.toFixed(2)
        // order.account_id = this.auth.device.
        var tOpts = {
            uri: config.nummus_url + endpoints.orders,
            headers: {
                'Host': 'nummus.robinhood.com',
                'X-TimeZone-Id' : 'America/Denver'
            },
            body: order
        }
        console.log(tOpts)
        return this.auth.post(tOpts)
    }
}  

module.exports = Orders