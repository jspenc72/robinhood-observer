var config = require('../config'),
    Auth = require("../auth.js"),
    Rx = require('rx'),
    _ = require("lodash"),
    config = require('../config')

class Orders {
    auth = new Auth()
    constructor() {

    }
    cancel(order_id) {
        console.log("cancel()", order_id)
        var tOps = {
            uri: config.nummus_url + endpoints.orders + order_id +"/cancel/"
        }
        return this.auth.post(tOpts, callback)        
    }
    create(order) {
        console.log("create()", order)
        var tOps = {
            uri: config.nummus_url + endpoints.orders,
            body: order,
            json: true
        }
        return this.auth.post(tOpts, callback)
    }
}  

module.exports = Orders