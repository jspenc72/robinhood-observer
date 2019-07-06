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

        // {
        //     "type": "limit",
        //     "side": "buy",
        //     "quantity": "0.994897",
        //     "account_id": "GET_ACCOUNT_ID",
        //     "currency_pair_id": "7b577ce3-489d-4269-9408-796a0d1abb3a",
        //     "price": "7.41",
        //     "ref_id": "GET_REF_ID",
        //     "time_in_force": "gtc"
        // }

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