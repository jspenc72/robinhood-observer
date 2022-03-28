#!/usr/bin/env node

// import device from "./device.mjs"
const RxJS = require('rxjs');
const Rx = require('rx');
const program = require('commander');
const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const pckg = require('../package.json');
const Device = require('./device.js');
const Auth = require('./auth.js');
const endpoints = require('./endpoints');
const config = require('./config');
const Crypto = require('./crypto');

'use strict';

/**
 * [Robinhood description]
 * @param { username: string, password: string }   opts     [description]
 * @param {Function} callback [description]
 */

function Robinhood(opts, callback) {
  const api = { test: 'value', crypto: {} };
  /* +--------------------------------+ *
   * |      Internal variables        | *
   * +--------------------------------+ */
  const _apiUrl = 'https://api.robinhood.com/';
  const device = new Device();
  const auth = new Auth();
  const crypto = new Crypto();
  const _options = opts || {};
  // Private API Endpoints
  const _clientId = 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS';
  const _isInit = false;
  const _private = {
    session: {},
    account: null,
    username: null,
    password: null,
    headers: null,
    auth_token: null,
    device_token: null,
  };

  function _init() {
    _private.username = _.has(_options, 'username') ? _options.username : (process.env.ROBINHOOD_USERNAME ? process.env.ROBINHOOD_USERNAME : null);
    _private.password = _.has(_options, 'password') ? _options.password : (process.env.ROBINHOOD_PASSWORD ? process.env.ROBINHOOD_PASSWORD : null);
    _private.auth_token = _.has(_options, 'token') ? _options.token : (process.env.ROBINHOOD_TOKEN ? process.env.ROBINHOOD_TOKEN : null);

    if (!_private.auth_token) {
      auth.init(_private, device)
        .then(_private => _set_account())
        .then(() => crypto.init(auth))
        .then((success) => {
          callback.call();
        })
        .catch((err) => {
          throw err;
        });
    } else {
      throw new Error('This form of authentication has been deprecated in lieu of using Robinhood 2FA with username, password combo');
    }
  }


  function _set_account() {
    return new Promise(((resolve, reject) => {
      api.accounts((err, httpResponse, body) => {
        if (err) {
          reject(err);
        }
        // Being defensive when user credentials are valid but RH has not approved an account yet
        if (
          body.results
          && body.results instanceof Array
          && body.results.length > 0
        ) {
          _private.account = body.results[0].url;
        }
        resolve();
      });
    }));
  }


  function options_from_chain({ next, results }) {
    return new Promise((resolve, reject) => {
      if (!next) return resolve(results);
      const tOpts = {
        url: next,
      };
      return auth.get(tOpts, callback)
        .then((body) => {
          resolve(
            options_from_chain({
              next: body.next,
              results: results.concat(body.results),
            }),
          );
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  function filter_bad_options(options) {
    return options.filter(option => option.tradability == 'tradable');
  }

  function stitch_options_with_details([details, options]) {
    const paired = details.map((detail) => {
      const match = options.find(option => option.url == detail.instrument);
      if (match) {
        Object.keys(match).forEach(key => (detail[key] = match[key]));
      }
      return detail;
    });
    // Remove nulls
    return paired.filter(item => item);
  }

  function get_options_details(options) {
    const grouped_options = group_options_by_max_per_request(options);
    return Promise.all(
      grouped_options.map((group) => {
        const option_urls = group.map(option => encodeURIComponent(option.url));
        const tOpts = {
          uri:
            `${_apiUrl
            + endpoints.options_marketdata
            }?instruments=${
              option_urls.join('%2C')}`,
        };
        return auth.get(tOpts, callback);
      }),
    ).then(options_details => [options_details.flat(), grouped_options.flat()]);
  }

  const max_options_details_per_request = 17;
  function group_options_by_max_per_request(options) {
    const filtered = filter_bad_options(options);
    const groups = [];
    for (
      let i = 0;
      i < filtered.length - 1;
      i += max_options_details_per_request
    ) {
      groups.push(filtered.slice(i, i + max_options_details_per_request));
    }
    return groups;
  }

  /* +--------------------------------+ *
   * |      API observables      | *
   * +--------------------------------+ */

  /**
    *
    * [observeQuote description]
    * @param  [string] symbol            The Symbol or Array of Symbols you want to observe.
    * @param  {number} frequency         Frequency to poll the Robinhood API in Milliseconds
    *
    * @return {[Observable]}             An observable which updates on the frequency provided.
    *
    */

  api.observeQuote = function (symbol, frequency) {
    symbol = Array.isArray(symbol) ? symbol = symbol.join(',') : symbol;
    frequency = frequency || 1800; // Set frequency of updates to 800 by default
    const count = 0;
    const source = Rx.Observable.create((observer) => {
      const intrvl = setInterval(() => {
        const tOpts = {
          uri: _apiUrl + endpoints.quotes,
          qs: { symbols: symbol.toUpperCase() },
        };
        auth.get(tOpts)
          .then((success) => {
            observer.onNext(success);
          });
      }, frequency);
      return () => {
        clearInterval(intrvl);
      };
    });
    return source;
  };

  /**
   * [observePositions description]
   * @param  {number} frequency         Frequency to poll the Robinhood API in Milliseconds
   * @return {Observable}               An observable which updates on the frequency provided.
   */
  
   api.observePositions = function (frequency, nonzero = true) {
    frequency = frequency || 5000; // Set frequency of updates to 5000 by default
    const source = Rx.Observable.create((observer) => {
      const intrvl = setInterval(() => {
        const tOpts = {
          uri: _apiUrl + endpoints.positions + (nonzero ? '?nonzero=true' : ''),
        };
        auth.get(tOpts)
          .then((success) => {
            observer.onNext(success);
          })
          .catch((err) => {
            observer.onError(err);
          });
      }, frequency);
      return () => {
        clearInterval(intrvl);
      };
    });
    return source;
  };

  /**
   * [observeOrders description]
   * @param  {number} frequency         Frequency to poll the Robinhood API in Milliseconds
   * @return {Observable}               An observable which updates on the frequency provided.
   */
  api.observeOrders = function (frequency) {
    frequency = frequency || 5000; // Set frequency of updates to 5000 by default
    const source = Rx.Observable.create((observer) => {
      const intrvl = setInterval(() => {
        const tOpts = {
          uri: _apiUrl + endpoints.orders,
        };
        auth.get(tOpts)
          .then((success) => {
            observer.onNext(success);
          })
          .catch((err) => {
            observer.onError(err);
          });
      }, frequency);
      return () => {
        clearInterval(intrvl);
      };
    });
    return source;
  };

  /**
   * [observeCryptoQuote description]
   * @param  {number} frequency         Frequency to poll the Robinhood API in Milliseconds
   * @return {Observable}               An observable which updates on the frequency provided.
   */

  api.observeCryptoQuote = function (symbol, frequency) {
    frequency = frequency || 1800; // Set frequency of updates to 800 by default
    const count = 0;
    const source = Rx.Observable.create((observer) => {
      let intrvl;
      api.crypto_init()
        .then((success) => {
          intrvl = setInterval(() => {
            console.log(new Date());
            api.crypto_quote(symbol)
              .then((success) => {
                observer.onNext(success);
              })
              .catch((err) => {
                console.error(err);
              });
          }, frequency);
        })
        .catch((err) => {
          console.error(err);
          return err;
        });
      return () => {
        clearInterval(intrvl);
      };
    });
    return source;
  };


  /* +--------------------------------+ *
   * |      Robinhood API methods        | *
   * +--------------------------------+ */


  api.auth_token = function () {
    return _private.auth_token;
  };

  // Invoke robinhood logout.  Note: User will need to reintantiate
  // this package to get a new token!
  api.expire_token = function (callback) {
    return auth.post({
      uri: _apiUrl + endpoints.logout,
    }, callback);
  };

  /**
   * [investment_profile description]
   * @param  {Function} callback [description]
   * @return {Function or Promise}            [description]
   */
  api.investment_profile = function (callback) {
    const tUri = _apiUrl + endpoints.investment_profile;
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };

  /**
   * [fundamentals description]
   * @param  [string]   symbol   [description]
   * @param  {Function} callback [description]
   * @return {Function or Promise}            [description]
   */
  api.fundamentals = function (symbol, callback) {
    symbol = Array.isArray(symbol) ? symbol = symbol.join(',') : symbol;

    const tUri = _apiUrl + endpoints.fundamentals;
    const tOpts = {
      uri: tUri,
      qs: { symbols: symbol },
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [instruments description]
   * @param  [string]   symbol                  [description]
   * @param  {Function} callback                [description]
   * @return {[Function or Promise]}            [description]
   */
  api.instruments = function (symbol, callback) {
    symbol = Array.isArray(symbol) ? symbol = symbol.join(',') : symbol;

    const tUri = _apiUrl + endpoints.instruments;
    const tOpts = {
      uri: tUri,
      qs: { symbols: symbol.toUpperCase() },
    };
    return auth.get(tOpts, callback);
  };

  /**
   * [currency description]
   * @param  [String]   symbol   [description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */

  api.crypto_quote = function (symbol, callback) {
    const tUri = _apiUrl + endpoints.marketdata_forex_quotes;
    var tOpts = {
      uri: tUri,
    };

    symbol = Array.isArray(symbol) ? symbol : [symbol];
    filtered = _.filter(api.crypto.pairs, o => (symbol.indexOf(o.symbol) > -1) || (symbol.indexOf(o.symbol.split('-')[0]) > -1));
    indexed = _.map(filtered, (o) => {
      const index = (symbol.indexOf(o.symbol) > -1) ? symbol.indexOf(o.symbol) : ((symbol.indexOf(o.symbol.split('-')[0]) > -1) ? symbol.indexOf(o.symbol.split('-')[0]) : 0);
      o.index = index;
      return o;
    });
    sorted = _.sortBy(indexed, ['index']);
    targets = _.map(sorted, item => item.id).join(',');
    var tOpts = {
      uri: _apiUrl + endpoints.marketdata_forex_quotes,
      qs: { ids: targets },
    };
    return auth.get(tOpts, callback);
  };

  api.crypto_pairs = function (callback) {
    const tOpts = {
      uri: `https://nummus.robinhood.com/${endpoints.currency_pairs}`,
      headers: {
        Host: 'nummus.robinhood.com',
      },
    };
    return auth.get(tOpts, callback);
  };

  api.crypto_init = function (callback) {
    const tUri = `https://nummus.robinhood.com/${endpoints.currency_pairs}`;
    return api.crypto_pairs()
      .then((success) => {
        api.crypto.pairs = success.results;
        return success.results;
      });
  };

  /**
   * [quote description]
   * @param  [String]   symbol   [description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */
  api.quote = function (symbol, callback) {
    const tUri = _apiUrl;
    var symbol = Array.isArray(symbol) ? symbol = symbol.join(',') : symbol;

    const tOpts = {
      uri: _apiUrl + endpoints.quotes,
      qs: { symbols: symbol.toUpperCase() },
    };
    return auth.get(tOpts, callback);
  };

  api.quote_data = function (sybmol, callback) {
    return api.quote(sybmol, callback);
  };
  /**
   * [accounts description]
   * @param  {Function} callback                [description]
   * @return {[Function or Promise]}            [description]
   */
  api.accounts = function (callback) {
    const tUri = _apiUrl;
    const tOpts = {
      uri: _apiUrl + endpoints.accounts,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [user description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */
  api.user = function (callback) {
    const tOpts = {
      uri: _apiUrl + endpoints.user,
    };
    return auth.get(tOpts, callback);
  };

  /**
   * [userBasicInfo description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.userBasicInfo = function (callback) {
    const tUri = _apiUrl;
    const tOpts = {
      uri: _apiUrl + endpoints.user_basic_info,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [userAdditionalInfo description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.userAdditionalInfo = function (callback) {
    const tUri = _apiUrl;
    const tOpts = {
      uri: _apiUrl + endpoints.user_additional_info,
    };
    return auth.get(tOpts, callback);
  };

  /**
   * [userEmployment description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.userEmployment = function (callback) {
    const tUri = _apiUrl;
    const tOpts = {
      uri: _apiUrl + endpoints.user_employment,
    };
    return auth.get(tOpts, callback);
  };


  /**
   * [userInvestmentProfile description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.userInvestmentProfile = function (callback) {
    const tUri = _apiUrl;
    const tOpts = {
      uri: _apiUrl + endpoints.investment_profile,
    };
    return auth.get(tOpts, callback);
  };

  /**
   * [dividends description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */
  api.dividends = function (callback) {
    const tUri = _apiUrl + endpoints.dividends;
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [orders description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */
  api.orders = function (callback) {
    const tUri = _apiUrl + endpoints.orders;
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [cancel description]
   * @param  {[type]}   order         [description]
   * @param  {Function} callback      [description]
   * @return {[Function or Promise]}  [description]
   */
  api.cancel = function (order, callback) {
    if (order && typeof order === 'object' && order.cancel) {
      const tUri = _apiUrl + order.cancel;
      const tOpts = {
        uri: tUri,
      };

      if (callback && typeof callback === 'function') {
        if (order.cancel) {
          return auth.post(tOpts, callback);
        }
        callback({ message: order.state == 'cancelled' ? 'Order already cancelled.' : 'Order cannot be cancelled.', order }, null, null);
      } else {
        return auth.get(tOpts);
      }
    } else if (typeof order === 'function') {
      order(new Error('An order must be provided.'), null, null);
    } else if (callback && typeof callback === 'function') {
      callback(new Error('An order must be provided.'), null, null);
    } else {
      return new Promise(((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('An order must be provided.'));
        });
      }));
    }
  };
  /**
    * [cancel_order description]
    * @param  {[type]}   order         [description]
    * @param  {Function} callback      [description]
    * @return {[Function or Promise]}  [description]
    */
  api.cancel_order = function (order, callback) {
    return api.cancel(order, callback);
  };
  /**
   * [_place_order description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  const _place_order = function (options, callback) {
    const tUri = _apiUrl + endpoints.orders;
    // Get instrument url


    const tOpts = {
      uri: tUri,
      form: {
        account: _private.account,
        instrument: options.instrument.url,
        price: options.bid_price,
        stop_price: options.stop_price,
        quantity: options.quantity,
        side: options.transaction,
        symbol: options.instrument.symbol.toUpperCase(),
        time_in_force: options.time || 'gfd',
        trigger: options.trigger || 'immediate',
        type: options.type || 'market',
      },
    };
    return auth.post(tOpts, callback);
  };
  /**
   * [place_buy_order description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.place_buy_order = function (options, callback) {
    return api.buy(options, callback);
  };
  /**
   * [buy description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.buy = function (options, callback) {
    // Check if instrument is provided.
    // Check if instrument url is provided.

    if (options.instrument || options.instrument.url.length > 0) {
      if (callback && typeof callback === 'function') {
        options.transaction = 'buy';
        return _place_order(options, callback);
      }
      return _place_order(options);
    }
    // If no instrument is provided, get it.
    // If no instrument url is provided, get it.
    if (typeof options === 'object') {
      // instrument was included but no instrument url provided
      if (options.instrument.symbol) {
        // Simply get the instrument, append the url and send the buy request
        api.instruments(options.instrument.symbol)
          .then((result) => {
            _.forEach(result.results, (value, key) => {
              if (value.symbol == options.instrument.symbol) {
                console.log(`Got Instrument for: ${ticker}`);
                options.instrument.url = value.url;
                return _place_order(options);
              }
              console.error('Unable to set instrument for order.');
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }
    } else if (typeof options === 'string' && typeof callback === 'object') {
      // Using alternative syntax api.buy(symbol:String, options:Object)
      const symbol = options;
      options = callback;

      api.instruments(symbol)
        .then((result) => {
          _.forEach(result.results, (value, key) => {
            if (value.symbol == options.instrument.symbol) {
              options.instrument.url = value.url;
              console.log(`Got Instrument for: ${options}`);
              return _place_order(options);
            }
            console.error('Unable to set instrument for order.');
          });
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      console.log('Invalid request parameters were sent.');
    }
  };

  /**
   * [place_sell_order description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.place_sell_order = function (options, callback) {
    return api.sell(options, callback);
  };

  /**
   * [sell description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.sell = function (options, callback) {
    options.transaction = 'sell';
    if (callback && typeof callback === 'function') {
      return _place_order(options, callback);
    }
    return _place_order(options);
  };


  /**
   * [positions description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.positions = function (callback) {
    const tUri = _apiUrl + endpoints.positions;
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [news description]
   * @param  {[type]}   symbol   [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.news = function (symbol, callback) {
    const tUri = _apiUrl + [endpoints.news, '/'].join(symbol);
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [markets description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.markets = function (callback) {
    const tUri = _apiUrl + endpoints.markets;
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [sp500_up description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.sp500_up = function (callback) {
    const tUri = _apiUrl + endpoints.sp500_up;
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [sp500_down description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.sp500_down = function (callback) {
    const tUri = _apiUrl + endpoints.sp500_down;
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [create_watch_list description]
   * @param  {[type]}   name     [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.create_watch_list = function (name, callback) {
    const tUri = _apiUrl + endpoints.watchlists;
    const tOpts = {
      uri: tUri,
      form: {
        name,
      },
    };
    return auth.post(tOpts, callback);
  };
  /**
   * [watchlists description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.watchlists = function (callback) {
    const tUri = _apiUrl + endpoints.watchlists;
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [splits description]
   * @param  {[type]}   instrument [description]
   * @param  {Function} callback   [description]
   * @return {[type]}              [description]
   */
  api.splits = function (instrument, callback) {
    const tUri = _apiUrl + [endpoints.instruments, '/splits/'].join(instrument);
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [historicals description]
   * @param  {[type]}   symbol   [description]
   * @param  {[type]}   intv     [description]
   * @param  {[type]}   span     [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.historicals = function (symbol, intv, span, callback) {
    if (typeof intv === 'function') {
      // callback(new Error("You must provide a symbol, interval and timespan"));
      return;
    }
    const tUri = _apiUrl + [`${endpoints.quotes}historicals/`, `/?interval=${intv}&span=${span}`].join(symbol);
    const tOpts = {
      uri: tUri,
    };
    return auth.get(tOpts, callback);
  };
  /**
   * [url description]
   * @param  {string}   url      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.url = function (url, callback) {
    const tOpts = {
      uri: url,
    };
    return auth.get(tOpts, callback);
  };
  api.init = _init;
  api.device = Device;
  api.auth = auth;
  api.endpoints = endpoints;
  api.crypto = crypto;
  _init(_options);
  return api;
}

if (require.main === module) {
  program
    .version(pckg.version)
    .command('crypto [query]', 'crypto')
    .command('crypto [get]', 'crypto')
    .command('get [quote]', 'get')
    .parse(process.argv);
} else {
  console.log('Thanks for using the robinhood-observer cli!');
}


module.exports = Robinhood;
