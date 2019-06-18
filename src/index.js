var RxJS = require('rxjs'),
    Rx = require('rx'),
    Promise = require("bluebird"),
    request = require('request'),
    rp = require('request-promise'),
    _ = require("lodash");

'use strict';

/**
 * [Robinhood description]
 * @param { username: string, password: string }   opts     [description]
 * @param {Function} callback [description]
 */
function Robinhood(opts, callback) {
  /* +--------------------------------+ *
   * |      Internal variables        | *
   * +--------------------------------+ */
  var _apiUrl = 'https://api.robinhood.com/';

  var _options = opts || {},
      // Private API Endpoints
      _endpoints = {
        login: 'oauth2/token/',
        logout: 'oauth2/revoke_token/',
        investment_profile: 'user/investment_profile/',
        accounts: 'accounts/',
        ach_iav_auth: 'ach/iav/auth/',
        ach_relationships: 'ach/relationships/',
        ach_transfers: 'ach/transfers/',
        ach_deposit_schedules: 'ach/deposit_schedules/',
        applications: 'applications/',
        dividends: 'dividends/',
        edocuments: 'documents/',
        earnings: 'marketdata/earnings/',
        instruments: 'instruments/',
        margin_upgrade: 'margin/upgrades/',
        markets: 'markets/',
        notifications: 'notifications/',
        notifications_devices: 'notifications/devices/',
        orders: 'orders/',
        cancel_order: 'orders/', //API expects https://api.robinhood.com/orders/{{orderId}}/cancel/
        password_reset: 'password_reset/request/',
        quotes: 'quotes/',
        document_requests: 'upload/document_requests/',
        user: 'user/',

        user_additional_info: "user/additional_info/",
        user_basic_info: "user/basic_info/",
        user_employment: "user/employment/",
        user_investment_profile: "user/investment_profile/",

        options_chains: 'options/chains/',
        options_positions: 'options/aggregate_positions/',
        options_instruments: 'options/instruments/',
        options_marketdata: 'marketdata/options/',

        watchlists: 'watchlists/',
        positions: 'positions/',
        fundamentals: 'fundamentals/',
        sp500_up: 'midlands/movers/sp500/?direction=up',
        sp500_down: 'midlands/movers/sp500/?direction=down',
        news: 'midlands/news/',
        tag: 'midlands/tags/tag/'
    },
    _clientId = 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS',
    _isInit = false,
    _request = request.defaults(),
    _rp = rp.defaults(),
    _private = {
      session : {},
      account: null,
      username : null,
      password : null,
      headers : null,
      auth_token : null
    },
    api = {};

  function _init(){
    _private.username = _.has(_options, 'username') ? _options.username : null;
    _private.password = _.has(_options, 'password') ? _options.password : null;
    _private.auth_token = _.has(_options, 'token') ? _options.token : null;
    _private.device_token = _.has(_options, 'device_token') ? _options.device_token : null;
    _private.headers = {
      'Host': 'api.robinhood.com',
      'Accept': '*/*',
      'Accept-Language': 'en-us',
      'Accept-Encoding': 'gzip, deflate',
      'Referer': 'https://robinhood.com/',
      'Origin': 'https://robinhood.com'
    };
    _setHeaders();
    if (!_private.auth_token) {
      _login(function (data) {
        
        _isInit = true;

        if (callback) {
          if (data) {
            callback(data);
          } else {
            callback.call();
          }
        }
      });
    } else {
      _build_auth_header(_private.auth_token);
      _setHeaders();
      _set_account()
        .then(function () {
          callback.call();
        })
        .catch(function (err) {
          throw err;
        });
    }
  }

  function _setHeaders(){
    _request = request.defaults({
      headers: _private.headers,
      json: true,
      gzip: true
    });

    _rp = rp.defaults({
      headers: _private.headers,
      json: true,
      gzip: true
    });
  }

  function _login(callback) {
    _request.post(
      {
        uri: _apiUrl + _endpoints.login,
        form: {
          grant_type: 'password',
          scope: 'internal',
          client_id: _clientId,
          expires_in: 86400,
          device_token: _private.device_token,
          password: _private.password,
          username: _private.username
        }
      },
      function (err, httpResponse, body) {
        if (err) {
          throw err;
        }

        if (!body.access_token) {
          throw new Error('token not found ' + JSON.stringify(httpResponse));
        }
        _private.auth_token = body.access_token;
        _private.refresh_token = body.refresh_token;
        _build_auth_header(_private.auth_token);

        _setHeaders();

        // Set account
        _set_account()
          .then(function () {
            callback.call();
          })
          .catch(function (err) {
            throw err;
          });
      }
    );
  }

  function _set_account() {
    return new Promise(function (resolve, reject) {
      api.accounts(function (err, httpResponse, body) {
        if (err) {
          reject(err);
        }
        console.log('_set_account', body)
        // Being defensive when user credentials are valid but RH has not approved an account yet
        if (
          body.results &&
          body.results instanceof Array &&
          body.results.length > 0
        ) {
          _private.account = body.results[0].url;
        }
        resolve();
      });
    });
  }

  function _build_auth_header(token) {
    _private.headers.Authorization = 'Bearer ' + token;
  }

  function options_from_chain({ next, results }) {
    return new Promise((resolve, reject) => {
      if (!next) return resolve(results);
      _request.get(
        {
          url: next
        },
        (err, response, body) =>
          resolve(
            options_from_chain({
              next: body.next,
              results: results.concat(body.results)
            })
          )
      );
    });
  }

  function filter_bad_options(options) {
    return options.filter(option => option.tradability == 'tradable');
  }

  function stitch_options_with_details([details, options]) {
    let paired = details.map(detail => {
      let match = options.find(option => option.url == detail.instrument);
      if (match) {
        Object.keys(match).forEach(key => (detail[key] = match[key]));
      }
      return detail;
    });
    // Remove nulls
    return paired.filter(item => item);
  }

  function get_options_details(options) {
    let grouped_options = group_options_by_max_per_request(options);
    return Promise.all(
      grouped_options.map(group => {
        let option_urls = group.map(option => encodeURIComponent(option.url));
        return new Promise((resolve, reject) => {
          let request = _request.get(
            {
              uri:
                _apiUrl +
                _endpoints.options_marketdata +
                '?instruments=' +
                option_urls.join('%2C')
            },
            (err, response, { results }) => {
              resolve(results);
            }
          );
        });
      })
    ).then(options_details => {
      return [options_details.flat(), grouped_options.flat()];
    });
  }

  const max_options_details_per_request = 17;
  function group_options_by_max_per_request(options) {
    let filtered = filter_bad_options(options);
    let groups = [];
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
  api.observeQuote = function(symbol, frequency){
   symbol = Array.isArray(symbol) ? symbol = symbol.join(',') : symbol;
   frequency = frequency ? frequency : 800;         //Set frequency of updates to 800 by default
   var count = 0;
   var source = Rx.Observable.create(function (observer) {
     var intrvl = setInterval(function(){
       _rp.get({
             uri: _apiUrl + _endpoints.quotes,
             qs: { 'symbols': symbol.toUpperCase() }
           })
           .then(success => {

             observer.onNext(success);
           })
     }, frequency);
     return () => {
       clearInterval(intrvl);
     }
   })
   return source
  };
  /**
   * [observeOrders description]
   * @param  {number} frequency         Frequency to poll the Robinhood API in Milliseconds
   * @return {Observable}               An observable which updates on the frequency provided.
   */
  api.observeOrders = function(frequency){
   frequency = frequency ? frequency : 5000;   //Set frequency of updates to 5000 by default
   var source = Rx.Observable.create(function (observer) {
     var intrvl = setInterval(function(){
       _rp.get({
             uri: _apiUrl + _endpoints.orders
           })
           .then(success => {
             observer.onNext(success);
           })
           .catch(err => {
             observer.onError(err);
           })
     }, frequency);
     return () => {
       clearInterval(intrvl);
     };
   });
   return source
  };

  /* +--------------------------------+ *
   * |      Robinhood API methods        | *
   * +--------------------------------+ */


   api.auth_token = function() {
     return _private.auth_token;
   };

   // Invoke robinhood logout.  Note: User will need to reintantiate
   // this package to get a new token!
   api.expire_token = function(callback) {
     return _request.post({
       uri: _apiUrl + _endpoints.logout
     }, callback);
   };

  /**
   * [investment_profile description]
   * @param  {Function} callback [description]
   * @return {Function or Promise}            [description]
   */
  api.investment_profile = function(callback){
    var tUri = _apiUrl + _endpoints.investment_profile;
    var tOpts = {
        uri: tUri
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };

  /**
   * [fundamentals description]
   * @param  [string]   symbol   [description]
   * @param  {Function} callback [description]
   * @return {Function or Promise}            [description]
   */
  api.fundamentals = function(symbol, callback){
    symbol = Array.isArray(symbol) ? symbol = symbol.join(',') : symbol;

    var tUri = _apiUrl + _endpoints.fundamentals;
    var tOpts = {
        uri: tUri,
        qs: { 'symbols': symbol }
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [instruments description]
   * @param  [string]   symbol                  [description]
   * @param  {Function} callback                [description]
   * @return {[Function or Promise]}            [description]
   */
  api.instruments = function(symbol, callback){
    symbol = Array.isArray(symbol) ? symbol = symbol.join(',') : symbol;

    var tUri = _apiUrl + _endpoints.instruments;
    var tOpts = {
        uri: tUri,
        qs: {'symbols': symbol.toUpperCase()}
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };


  /**
   * [quote description]
   * @param  [String]   symbol   [description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */
  api.quote = function(symbol, callback){
    var tUri = _apiUrl,
        tOpts = {
        uri: tUri
      };
    symbol = Array.isArray(symbol) ? symbol = symbol.join(',') : symbol;
    if (callback && typeof callback == "function") {
      // do something
      return _request.get({
          uri: _apiUrl + _endpoints.quotes,
          qs: { 'symbols': symbol.toUpperCase() }
        }, callback);
    }else{
      return _rp.get({
          uri: _apiUrl + _endpoints.quotes,
          qs: { 'symbols': symbol.toUpperCase() }
        });
    }
  };

  api.quote_data = function(sybmol, callback){
    return api.quote(sybmol, callback);
  };
  /**
   * [accounts description]
   * @param  {Function} callback                [description]
   * @return {[Function or Promise]}            [description]
   */
  api.accounts = function(callback){
    var tUri = _apiUrl,
        tOpts = {
      uri: _apiUrl + _endpoints.accounts
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [user description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */
  api.user = function(callback){
    var tUri = _apiUrl + _endpoints.user,
        tOpts = {
      uri: tUri
    };
    if (callback && typeof callback == "function") {
      return _request.get({
        uri: _apiUrl + _endpoints.user
      }, callback);
    }else{
      return _rp.get(tOpts);
    }
  };

  /**
   * [userBasicInfo description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.userBasicInfo = function(callback){
    var tUri = _apiUrl,
        tOpts = {
      uri: _apiUrl + _endpoints.user_basic_info
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [userAdditionalInfo description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.userAdditionalInfo = function(callback){
    var tUri = _apiUrl,
        tOpts = {
      uri: _apiUrl + _endpoints.user_additional_info
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };

  /**
   * [userEmployment description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.userEmployment = function(callback){
    var tUri = _apiUrl,
        tOpts = {
      uri: _apiUrl + _endpoints.additional_info
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };


  /**
   * [userInvestmentProfile description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.userInvestmentProfile = function(callback){
    var tUri = _apiUrl,
        tOpts = {
      uri: _apiUrl + _endpoints.investment_profile
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };


  /**
   * [dividends description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */
  api.dividends = function(callback){
    var tUri = _apiUrl + _endpoints.dividends,
        tOpts = {
        uri: tUri
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [orders description]
   * @param  {Function} callback [description]
   * @return {[Function or Promise]}            [description]
   */
  api.orders = function(callback){
    var tUri = _apiUrl + _endpoints.orders,
        tOpts = {
        uri: tUri
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [cancel description]
   * @param  {[type]}   order         [description]
   * @param  {Function} callback      [description]
   * @return {[Function or Promise]}  [description]
   */
   api.cancel = function(order, callback){
     if(order && typeof order == "object" && order.cancel){
       var tUri = _apiUrl + order.cancel,
           tOpts = {
           uri: tUri
         };

       if (callback && typeof callback == "function") {
             if(order.cancel){
               return _request.post(tOpts, callback);
             }else{
               callback({message: order.state=="cancelled" ? "Order already cancelled." : "Order cannot be cancelled.", order: order }, null, null);
             }
       }else{
         return _rp.get(tOpts);
       }
     }else{
       if(typeof order == "function"){
         order(new Error("An order must be provided."), null, null);
         return;
       }else if (callback && typeof callback == "function") {
         callback(new Error("An order must be provided."), null, null);
       }else{
         return new Promise(function (resolve, reject) {
           setTimeout(function(){
               reject(new Error("An order must be provided." ));
           });
         });
       }
     }
   };
   /**
    * [cancel_order description]
    * @param  {[type]}   order         [description]
    * @param  {Function} callback      [description]
    * @return {[Function or Promise]}  [description]
    */
  api.cancel_order = function(order, callback){
    return api.cancel(order, callback);
  };
  /**
   * [_place_order description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  var _place_order = function(options, callback){
    var tUri = _apiUrl + _endpoints.orders;
    //Get instrument url


    var tOpts = {
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
          type: options.type || 'market'
        }
      };
    if (callback && typeof callback == "function") {
      return _request.post(tOpts, callback);
    }else{
      return _rp.post(tOpts);
    }
  };
  /**
   * [place_buy_order description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.place_buy_order = function(options, callback){
    return api.buy(options, callback);
  };
  /**
   * [buy description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.buy = function(options, callback){

    //Check if instrument is provided.
    //Check if instrument url is provided.

    if(options.instrument || options.instrument.url.length>0){
      if (callback && typeof callback == "function") {
        options.transaction = 'buy';
        return _place_order(options, callback);
      }else{
        return _place_order(options);
      }
    }else{
      //If no instrument is provided, get it.
      //If no instrument url is provided, get it.
      if(typeof options == "object"){
        //instrument was included but no instrument url provided
        if(options.instrument.symbol){
          //Simply get the instrument, append the url and send the buy request
          api.instruments(options.instrument.symbol)
          .then(result => {
            _.forEach(result.results, (value, key) => {
              if(value.symbol==options.instrument.symbol){
                console.log("Got Instrument for: "+ ticker)
                options.instrument.url = value.url;
                return _place_order(options);
              }else{
                console.error("Unable to set instrument for order.");
              }
            });
          })
          .catch(err => {
            console.error(err);
          });
        }
      }else if(typeof options == "string" && typeof callback == "object"){
        //Using alternative syntax api.buy(symbol:String, options:Object)
        var symbol = options;
            options = callback;

        api.instruments(symbol)
        .then(result => {
          _.forEach(result.results, (value, key) =>{
            if(value.symbol==options.instrument.symbol){
              options.instrument.url = value.url;
              console.log("Got Instrument for: "+ options)
              return _place_order(options);
            }else{
              console.error("Unable to set instrument for order.");
            }
          });
        })
        .catch(err => {
          console.error(err);
        });
      }else{
        console.log("Invalid request parameters were sent.");
      }
    }
  };

  /**
   * [place_sell_order description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.place_sell_order = function(options, callback){
    return api.sell(options, callback);
  };

  /**
   * [sell description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.sell = function(options, callback){
    options.transaction = 'sell';
    if (callback && typeof callback == "function") {
      return _place_order(options, callback);
    }else{
      return _place_order(options);
    }
  };



  /**
   * [positions description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.positions = function(callback){
    var tUri = _apiUrl + _endpoints.positions,
        tOpts = {
        uri: tUri
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [news description]
   * @param  {[type]}   symbol   [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.news = function(symbol, callback){
    var tUri = _apiUrl + [_endpoints.news,'/'].join(symbol),
        tOpts = {
        uri: tUri
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [markets description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.markets = function(callback){
    var tUri = _apiUrl + _endpoints.markets,
        tOpts = {
      uri: tUri
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [sp500_up description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.sp500_up = function(callback){
    var tUri = _apiUrl + _endpoints.sp500_up,
        tOpts = {
      uri: tUri
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [sp500_down description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.sp500_down = function(callback){
    var tUri = _apiUrl + _endpoints.sp500_down,
        tOpts = {
        uri: tUri
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [create_watch_list description]
   * @param  {[type]}   name     [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.create_watch_list = function(name, callback){
    var tUri = _apiUrl + _endpoints.watchlists;
    var tOpts = {
      uri: tUri,
      form: {
        name: name
      }
    };
    if (callback && typeof callback == "function") {
      return _request.post(tOpts, callback);
    }else{
      return _rp.post(tOpts);
    }
  };
  /**
   * [watchlists description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.watchlists = function(callback){
    var tUri = _apiUrl + _endpoints.watchlists,
        tOpts = {
      uri: tUri
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [splits description]
   * @param  {[type]}   instrument [description]
   * @param  {Function} callback   [description]
   * @return {[type]}              [description]
   */
  api.splits = function(instrument, callback){
    var tUri = _apiUrl + [_endpoints.instruments,'/splits/'].join(instrument),
        tOpts = {
      uri: tUri
    };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [historicals description]
   * @param  {[type]}   symbol   [description]
   * @param  {[type]}   intv     [description]
   * @param  {[type]}   span     [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.historicals = function(symbol, intv, span, callback){

    if(typeof intv == 'function'){
      // callback(new Error("You must provide a symbol, interval and timespan"));
      return;
    }
    var tUri = _apiUrl + [_endpoints.quotes + 'historicals/','/?interval='+intv+'&span='+span].join(symbol),
        tOpts = {
        uri: tUri
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  /**
   * [url description]
   * @param  {string}   url      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  api.url = function (url, callback){
    var tOpts = {
        uri: url
      };
    if (callback && typeof callback == "function") {
      return _request.get(tOpts, callback);
    }else{
      return _rp.get(tOpts);
    }
  };
  _init(_options);
  return api;
}

module.exports = Robinhood;
