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
        login:  'api-token-auth/',
        logout: 'api-token-logout/',
        investment_profile: 'user/investment_profile/',
        accounts: 'accounts/',
        ach_iav_auth: 'ach/iav/auth/',
        ach_relationships:  'ach/relationships/',
        ach_transfers:'ach/transfers/',
        ach_deposit_schedules: "ach/deposit_schedules/",
        applications: 'applications/',
        dividends:  'dividends/',
        edocuments: 'documents/',
        instruments:  'instruments/',
        margin_upgrade:  'margin/upgrades/',
        markets:  'markets/',
        notifications:  'notifications/',
        notifications_devices: "notifications/devices/",
        orders: 'orders/',
        cancel_order: 'orders/',      //API expects https://api.robinhood.com/orders/{{orderId}}/cancel/
        password_reset: 'password_reset/request/',
        quotes: 'quotes/',
        document_requests:  'upload/document_requests/',
        user: 'user/',

        user_additional_info: "user/additional_info/",
        user_basic_info: "user/basic_info/",
        user_employment: "user/employment/",
        user_investment_profile: "user/investment_profile/",

        watchlists: 'watchlists/',
        positions: 'positions/',
        fundamentals: 'fundamentals/',
        sp500_up: 'midlands/movers/sp500/?direction=up',
        sp500_down: 'midlands/movers/sp500/?direction=down',
        news: 'midlands/news/'
    },
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
    _private.username = _options.username;
    _private.password = _options.password;
    _private.headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en;q=1, fr;q=0.9, de;q=0.8, ja;q=0.7, nl;q=0.6, it;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-Robinhood-API-Version': '1.0.0',
        'Connection': 'keep-alive',
        'User-Agent': 'Robinhood/823 (iPhone; iOS 7.1.2; Scale/2.00)'
    };
    _setHeaders();
    _login(function(){
      _isInit = true;

      if (callback) {
        callback.call();
      }
    });
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

  function _login(callback){
    _request.post({
      uri: _apiUrl + _endpoints.login,
      form: {
        password: _private.password,
        username: _private.username
      }
    }, function(err, httpResponse, body) {
      if(err) {
        throw (err);
      }

      _private.auth_token = body.token;
      _private.headers.Authorization = 'Token ' + _private.auth_token;

      _setHeaders();

      // Set account
      api.accounts(function(err, httpResponse, body) {
        if (err) {
          throw (err);
        }

        if (body.results) {
          _private.account = body.results[0].url;
        }
        callback.call();
      });
    });
  }

  function _set_account() {
    return new Promise(function(resolve, reject) {
      api.accounts(function(err, httpResponse, body) {
        if (err) {
          reject(err);
        }
        // Being defensive when user credentials are valid but RH has not approved an account yet
        if (body.results && body.results instanceof Array && body.results.length > 0) {
          _private.account = body.results[0].url;
        }
        resolve();
      });
    });
  }

  function _build_auth_header(token) {
    _private.headers.Authorization = 'Token ' + token;
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
