const Rx = require('rx');
const _ = require('lodash');
var config = require('../config');
const Auth = require('../auth.js');
var config = require('../config');
const endpoints = require('../endpoints');

class Orders {
  constructor(auth, pairs) {
    // Do crypto init
    this.auth = auth;
    this.pairs = pairs;
  }

  cancel(order_id) {
    console.log('cancel()', order_id);
    const tOpts = {
      uri: `${config.nummus_url + endpoints.orders + order_id}/cancel/`,
      headers: {
        Host: 'nummus.robinhood.com',
      },
    };
    return this.auth.post(tOpts);
  }

  create(order) {
    order.account_id = this.auth.crypto_account.id;
    order.ref_id = this.auth.device.generateToken();
    order.price = order.price.toFixed(2);
    // order.account_id = this.auth.device.
    const tOpts = {
      uri: config.nummus_url + endpoints.orders,
      headers: {
        Host: 'nummus.robinhood.com',
        'X-TimeZone-Id': 'America/Denver',
      },
      body: order,
    };
    console.log(tOpts);
    return this.auth.post(tOpts);
  }
}

module.exports = Orders;
