var config = require('../config'),
    Auth = require("../auth.js"),
    Rx = require('rx'),
    _ = require("lodash"),
    config = require('../config')

class Orders {
    auth = new Auth()
    constructor() {

    }
    cancel(order) {
        console.log("cancel", config.nummus_url)
    }
    create(order) {
        console.log("create")
        var tOps = {
            
        }
    }
}  

module.exports = Orders