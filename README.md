<h1><img src="https://raw.githubusercontent.com/jspenc72/robinhood-node/master/.github/robinhood-node.png"/></h1>

[![Travis](https://img.shields.io/travis/jspenc72/robinhood-node/master.svg)](https://travis-ci.org/jspenc72/robinhood-node)
[![npm](https://img.shields.io/npm/dt/robinhood-observer.svg?maxAge=2592000)](https://www.npmjs.com/package/robinhood-observer)
[![npm](https://img.shields.io/npm/dm/robinhood-observer.svg)](https://www.npmjs.com/package/robinhood-observer)

[![NodeJS](https://img.shields.io/badge/node-12.4.0-brightgreen.svg)](https://nodejs.org/en/)
[![Dependencies](https://david-dm.org/jspenc72/robinhood-observer.svg)](https://www.npmjs.com/package/robinhood-observer?activeTab=dependencies)
[![Codecov](https://img.shields.io/codecov/c/github/jspenc72/robinhood-observer/master.svg)](https://www.npmjs.com/package/robinhood-observer)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjspenc72%2Frobinhood-observer.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjspenc72%2Frobinhood-observer?ref=badge_shield)


[![RxJS](http://reactivex.io/assets/Rx_Logo_S.png)](http://reactivex.io)
[![Bluebird](http://bluebirdjs.com/img/logo.png)](http://bluebirdjs.com/)

A Reactive NodeJS Framework for the [Robinhood](https://www.robinhood.com/) API.

[![NPM](https://nodei.co/npm/robinhood-observer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/robinhood-observer/)

[See The Reactive Extensions for JavaScript (RxJS)](https://github.com/Reactive-Extensions/RxJS) for more information.

## Features
*   Works with Robinhoods New SMS 2FA (As of June 2019)
*   Reactive
*   Comprehensive CLI
*   Quote Stock Prices
*   Crypto Quotes, Buy, Sell 
*   Options Trading
*   Buy, Sell Stock Equity Orders
*   Daily Fundamentals
*   Daily, Weekly, Monthly Historicals
*   Callback and Promise Support (Bluebird)


## Installation

```bash
# Globbal Install w/CLI
$ npm i -g robinhood-observer 
## Dependency Install
$ npm i robinhood-observer --save
```

## Environment Variables

| Key | Value | Description  |
|---|---|---|
| ROBINHOOD_USERNAME  | ''  | Your robinhood Username  |
| ROBINHOOD_PASSWORD  | ''  | Your robinhood Password  |
| ROBINHOOD_DEVICE_PATH  | device.json  | Path to store the unique identifier for your 2FA device. |

## CLI Usage

```bash
$ rh -h
Usage: rh [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      output usage information

Commands:
  crypto [query]  crypto
  crypto [get]    crypto
  get [quote]     get
  help [cmd]      display help for [cmd]

$ rh get -h
Usage: rh-get [options] [command]

Options:
  -h, --help                                  output usage information

Commands:
  quote [options] <symbol> [otherSymbols...]
  account [options]
  positions [options]
  fundamentals [options] <symbol>
  sp500up [options]
  sp500down [options]
  watchlists [options]
  historicals [options] <symbol>

$ rh crypto -h
Usage: rh-crypto [options] [command]

Options:
  -h, --help                                        output usage information

Commands:
  quote [options] <symbol> [otherSymbols...]
  create <symbol> <type> <side> <quantity> <price>
  cancel <orderId>

$ rh crypto quote -h
Usage: quote [options] <symbol> [otherSymbols...]

Options:
  -o --output <output>  Output Format (table|json) (default: "table")
  -f --frequency <n>    Request Frequency (milliseconds)
  -h, --help            output usage information
```

## CLI Crypto Example 

```js
$ export ROBINHOOD_USERNAME=username
$ export ROBINHOOD_PASSWORD=password
$ rh crypto quote BTC ETC -o table
ask_price    bid_price    mark_price   high_price  low_price  open_price  symbol  id                                    volume         
-----------  -----------  -----------  ----------  ---------  ----------  ------  ------------------------------------  ---------------
9465.128771  9438.796832  9451.962801  10225.53    9301.11    10119.14    BTCUSD  3d961844-d360-45fc-989b-f6fca761d511  372157.369572  
5.872        5.858349     5.865174     6.34        5.774      6.2375      ETCUSD  7b577ce3-489d-4269-9408-796a0d1abb3a  27690941.790891

$ rh crypto quote 2000 BTC ETC -o json

{
  results: [
    {
      ask_price: 9462.64,
      bid_price: 9438.92,
      mark_price: 9450.78,
      high_price: 10225.53,
      low_price: 9301.11,
      open_price: 10119.14,
      symbol: 'BTCUSD',
      id: '3d961844-d360-45fc-989b-f6fca761d511',
      volume: 372173.980782
    },
    {
      ask_price: 5.871085,
      bid_price: 5.858349,
      mark_price: 5.864717,
      high_price: 6.34,
      low_price: 5.774,
      open_price: 6.2375,
      symbol: 'ETCUSD',
      id: '7b577ce3-489d-4269-9408-796a0d1abb3a',
      volume: 27690941.790891
    }
  ],
  quote: {
    results: [ [Object], [Object] ],
    sent: 2019-07-27T18:00:39.234Z,
    received: 2019-07-27T18:00:39.566Z
  }
}
```


## Example Starter Project
The [example project](https://github.com/jspenc72/robinhood-observer-starter) helps you get started right off the bat and demonstrates some of the cool things you can do with this library.

## Working 2FA Example

```bash
var credentials = {
    username: '',
    password: '',
};

var Robinhood = require('robinhood-observer')(credentials, function(){
    var subscription = Robinhood.observeQuote(['TVIX', 'AAPL', 'GOOG'])
    .map(quote => quote.results)
    .distinct()                         //Only use distict results...
    .subscribe(x => {
      //Do something each time the price changes
      console.log(x);
      console.log(x[0].last_trade_price);
    }, e => {
      console.error(e)
    }, () => console.log('disposed'));
    setTimeout(function(){
      //Unsubscribe to updates for the data after 10 minutes
      subscription.dispose();
    }, 60000*10);
});

```

```bash
node examples/observable_quotes_example.js 
Enter the 2FA code that was sent to you via sms.
123456
[
  {
    ask_price: '20.140000',
    ask_size: 100,
    bid_price: '20.130000',
    bid_size: 9300,
    last_trade_price: '20.140000',
    last_extended_hours_trade_price: '20.240000',
    previous_close: '20.450000',
    adjusted_previous_close: '20.450000',
    previous_close_date: '2019-06-17',
    symbol: 'TVIX',
    trading_halted: false,
    has_traded: true,
    last_trade_price_source: 'consolidated',
    updated_at: '2019-06-18T23:59:12Z',
    instrument: 'https://api.robinhood.com/instruments/c9334c71-c95d-4da0-b6c2-13a01f306c50/'
  },
  {
    ask_price: '198.560000',
    ask_size: 100,
    bid_price: '198.400000',
    bid_size: 200,
    last_trade_price: '198.450000',
    last_extended_hours_trade_price: '199.300000',
    previous_close: '193.890000',
    adjusted_previous_close: '193.890000',
    previous_close_date: '2019-06-17',
    symbol: 'AAPL',
    trading_halted: false,
    has_traded: true,
    last_trade_price_source: 'consolidated',
    updated_at: '2019-06-18T23:59:32Z',
    instrument: 'https://api.robinhood.com/instruments/450dfc6d-5510-4d40-abfb-f633b7d9be3e/'
  },
  {
    ask_price: '1105.070000',
    ask_size: 500,
    bid_price: '1103.430000',
    bid_size: 100,
    last_trade_price: '1103.600000',
    last_extended_hours_trade_price: '1103.600000',
    previous_close: '1092.500000',
    adjusted_previous_close: '1092.500000',
    previous_close_date: '2019-06-17',
    symbol: 'GOOG',
    trading_halted: false,
    has_traded: true,
    last_trade_price_source: 'consolidated',
    updated_at: '2019-06-18T20:23:51Z',
    instrument: 'https://api.robinhood.com/instruments/943c5009-a0bb-4665-8cf4-a95dab5874e4/'
  }
]
20.140000

```

## Real World Example

1.  Monitor AAPL stocks
2.  Create a "buy" subscription that triggers a buy order anytime the price drops to or below $100
3.  Create a "sell" subscription that triggers a sell order anytime the price jumps above $110

```js
//The username and password you use to sign into the robinhood app.

var credentials = {
    username: '',
    password: '' 
};

var Robinhood = require('robinhood-observer')     //Robinhood has not authenticated but can still be used for the unauthenticated subset of the API

//Real World Example

/*
 * 1. Create a "buy" subscription that monitors AAPL and triggers a buy order anytime the price drops to or below $100
 *
 * 2. Create a "sell" subscription that monitors AAPL and triggers a sell order anytime the price jumps above $110
 *
 */

 var buyOptions = {
     type: 'limit',
     quantity: 1,
     bid_price: 100.00,
     instrument: {
         url: String,
         symbol: String
     }
 }

 var sellOptions = {
     type: 'limit',
     quantity: 1,
     bid_price: 110.00,
     instrument: {
         url: String,
         symbol: String
     }
 }

var observer = Robinhood(credentials).observeQuote(['AAPL'])

var buySubscription = observer
                    .map(quote => {
                      //Convert string to float.
                      quote.results.last_trade_price = parseFloat(quote.results.last_trade_price);
                      return quote.results
                    })
                    .filter((results, idx, obs) => {
                        return results[0].last_trade_price <= 100      //Only update
                    })
                    .distinct()                                             //Only use distinct results...
                    .subscribe(x => {
                        //Now Execute Buy Order
                        console.log(x);

                        //Set the bid_price one cent lower than the last_trade_price;
                        buyOptions.bid_price = x.last_trade_price-0.01;

                        buyOptions.instrument.sybmol = x.symbol;
                        buyOptions.instrument.url = x.symbol;

                        Robinhood.buy(buyOptions)
                        .then(success => {
                          //Buy Order has been placed
                          console.log(success)
                        })
                        .catch(err => {
                          //Error placing Buy Order
                          console.error(err);
                        });
                    }, e => {
                        console.error(e)
                    }, () => console.log('buy subscription disposed'));


var sellSubscription = observer
                    .map(quote => quote.results)
                    .filter((results, idx, obs) => {
                        return results[0].last_trade_price >= 110      //Only update
                    })
                    .distinct()                                             //Only use distict results...
                    .subscribe(x => {
                      //Now Execute Sell Order
                        console.log(x);

                        Robinhood.sell(sellOptions)
                        .then(success => {
                          //Sell Order has been placed
                          console.log(success)
                        })
                        .catch(err => {
                          //Error placing Sell Order
                          console.error(err);
                        });
                    }, e => {
                        console.error(e)
                    }, () => console.log('sell subscription disposed'));


 //Unsubscribe to updates after 5 seconds.

setTimeout(function(){
  buySubscription.dispose();
  sellSubscription.dispose();
}, 5000);
```

## Observables

### `observeQuote(symbol, request_frequency?)`

#### Parameters

```typescript
/**
 *
 * [observeQuote description]
 * @param  [string] symbol            The Symbol or Array of Symbols you want to observe.
 * @param  {number} frequency         Frequency to poll the Robinhood API in Milliseconds
 *
 * @return {[Observable]}             An observable which updates on the frequency provided.
 *
 */
```
-   symbol (Required)
-   request_frequency (Optional) Defaults to 800 milliseconds

```js
var credentials = {
    username: '',
    password: ''
};

var subscription = Robinhood(null).observeQuote(['AAPL'])
                    .map(quote => quote.results)
                    .filter((results, idx, obs) => {
                        return results[0].last_trade_price == 113.0500      //Only update
                    })
                    .distinct()                                             //Only use distict results...
                    .subscribe(x => {
                        //Do something each time the price changes
                        console.log(x);

                    }, e => {
                        console.error(e)
                    }, () => console.log('disposed'));
```

### `observeOrders(request_frequency?)`

#### Parameters

```typescript
/**
 * [observeOrders description]
 * @param  {number} frequency         Frequency to poll the Robinhood API in Milliseconds
 * @return {Observable}               An observable which updates on the frequency provided.
 */
```

-   request_frequency (Optional) Defaults to 5000 milliseconds

```js
var credentials = {
    username: '',
    password: ''
};

var subscription = Robinhood(null).observeOrders()
                    .map(orders => orders.results)
                    .distinct()                                             //Only use distict results...
                    .subscribe(x => {
                        //Do something each time the price changes
                        console.log(x);

                    }, e => {
                        console.error(e)
                    }, () => console.log('disposed'));

//Unsubscribe to updates after 6 seconds.

setTimeout(function(){
 subscription.dispose();
}, 60000);
```

### Table of Contents

<!-- toc -->
  * [Features](#features)
  * [Installation](#installation)
  * [Usage](#usage)
  * [API](#api)
    * [Observables](#observables)
        * [`observeQuote()                      // Not authenticated`](#quote-datastock-callback-not-authenticated)
        * [`observeOrders()                     // Authentication Required`](#quote-datastock-callback-not-authenticated)

    * [Methods](#methods)
      * [`quote(stock, callback)`](#quote-datastock-callback-not-authenticated)
      * [`quote_data(stock, callback)`](#quote-datastock-callback-not-authenticated)                              (Deprecated use Robinhood.quote())
      * [`buy(options, callback)                // Authentication Required`](#place-buy-orderoptions-callback)
        * [`trigger`](#trigger)
        * [`time`](#time)
      * [`place_buy_order(options, callback)    // Authentication Required`](#place-buy-orderoptions-callback)    (Deprecated use Robinhood.buy())
        * [`trigger`](#trigger)
        * [`time`](#time)
      * [`sell(options, callback)               // Authentication Required`](#place-sell-orderoptions-callback)
        * [`trigger`](#trigger)
        * [`time`](#time)
      * [`place_sell_order(options, callback)   // Authentication Required`](#place-sell-orderoptions-callback)   (Deprecated use Robinhood.sell())
        * [`trigger`](#trigger)
        * [`time`](#time)
      * [`cancel(order, callback)               // Authentication Required`](#cancel-orderorder-callback)
      * [`cancel_order(order, callback)         // Authentication Required`](#cancel-orderorder-callback)              (Deprecated use Robinhood.cancel())
      * [`url(url, callback)`](#urlurl-callback)

  *   [Contributors](#contributors)

  * [TLDR](#api)
    *   [`watchlists(name, callback)`](#watchlistsname-callback)
    *   [`create_watch_list(name, callback)`](#create-watch-listname-callback)
    *   [`sp500_up(callback)`](#sp500-upcallback)
    *   [`sp500_down(callback)`](#sp500-downcallback)
    *   [`splits(instrument, callback)`](#splitsinstrument-callback)
    *   [`fundamentals(symbol, callback)`](#fundamentalssymbol-callback)
        *   [Response](#response)
    *   [`accounts(callback)`](#accountscallback)
    *   [`user(callback)`](#usercallback)
    *   [`dividends(callback)`](#dividendscallback)
    *   [`orders(callback)`](#orderscallback)
    *   [`historicals(symbol, intv, span, callback)`](#historicalssymbol-intv-span-callback)
    *   [`investment_profile(callback)`](#investment-profilecallback)                                         (Deprecated use Robinhood.userInvestmentProfile())
    *   [`userInvestmentProfile(callback)`](#investment-profilecallback)
    *   [`userBasicInfo(callback)`](#investment-profilecallback)
    *   [`userAdditionalInfo(callback)`](#investment-profilecallback)
    *   [`instruments(symbol, callback)`](#instrumentssymbol-callback)


<!-- toc stop -->



# REST API Methods Unauthenticated (Robinhood Deprecated)

All non Observable methods return a promise unless a callback is provided as the last optional parameter.

### `quote(stock)`

Get the user's quote data for a specified stock.

```js
//Promise Style
var Robinhood = require('robinhood-observer')

Robinhood(null).quote('AAPL')
.then(success => {
  console.log(success);
})
.catch(err => {
  console.error(err);
})

//Callback Style
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.quote('AAPL', function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("quote");
            console.log(body);

        }
    })
});

//response
//{
//    results: [
//        {
//            ask_price: String, // Float number in a String, e.g. '735.7800'
//            ask_size: Number, // Integer
//            bid_price: String, // Float number in a String, e.g. '731.5000'
//            bid_size: Number, // Integer
//            last_trade_price: String, // Float number in a String, e.g. '726.3900'
//            last_extended_hours_trade_price: String, // Float number in a String, e.g. '735.7500'
//            previous_close: String, // Float number in a String, e.g. '743.6200'
//            adjusted_previous_close: String, // Float number in a String, e.g. '743.6200'
//            previous_close_date: String, // YYYY-MM-DD e.g. '2016-01-06'
//            symbol: String, // e.g. 'AAPL'
//            trading_halted: Boolean,
//            updated_at: String, // YYYY-MM-DDTHH:MM:SS e.g. '2016-01-07T21:00:00Z'
//        }
//    ]
//}
```

#### `historicals`

-   ``function historicals(symbol: string, interval: string, timespan: string, callback:())``

-   `function historicals(symbol: string, interval: string, timespan: string): Promise{} `

Interval Values can be:

*   `5minute`: 5 Minute interval historical data.
*   `10minute`: 10 Minute interval historical data.

Timespan Values can be:

*   `day`: 1 Day timespan historical data.
*   `week`: 7 Day timespan historical data.

```js
var Robinhood = require('robinhood-observer')(credentials, function(){

    Robinhood.historicals("AAPL", '5minute', 'week', function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("got historicals");
            console.log(body);
            //
            //    { quote: 'https://api.robinhood.com/quotes/AAPL/',
            //      symbol: 'AAPL',
            //      interval: '5minute',
            //      span: 'week',
            //      bounds: 'regular',
            //      previous_close: null,
            //      historicals:
            //       [ { begins_at: '2016-09-15T13:30:00Z',
            //           open_price: '113.8300',
            //           close_price: '114.1700',
            //           high_price: '114.3500',
            //           low_price: '113.5600',
            //           volume: 3828122,
            //           session: 'reg',
            //           interpolated: false },
            //         { begins_at: '2016-09-15T13:35:00Z',
            //           open_price: '114.1600',
            //           close_price: '114.3800',
            //           high_price: '114.7300',
            //           low_price: '114.1600',
            //           volume: 2166098,
            //           session: 'reg',
            //           interpolated: false },
            //         ... 290 more items
            //      ]}
            //
        }
    })
})
```


## REST API Methods Authenticated
Before using these methods, make sure you have initialized Robinhood using the snippet above.

### `investment_profile(callback) (Deprecated)`
### `userInvestmentProfile()`


Get the current user's investment profile.

```js
var credentials = require("../credentials.js")();
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.userInvestmentProfile()
    .then(success => {
        console.log(success);
    })
    .catch(err => {
        console.error(err);
    })
});
```

### `userBasicInfo()`

Get basic info about the current user's

```js
var credentials = require("../credentials.js")();
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.userBasicInfo()
    .then(success => {
        console.log(success);
    })
    .catch(err => {
        console.error(err);
    })
});
```


### `userAdditionalInfo()`

Get additional info about the current user's

```js
var credentials = require("../credentials.js")();
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.userAdditionalInfo()
    .then(success => {
        console.log(success);
    })
    .catch(err => {
        console.error(err);
    })
});
```

### `instruments(symbol, callback)`

```js
var credentials = require("../credentials.js")();
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.instruments('AAPL', function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("instruments");
            console.log(body);
            //    { previous: null,
            //      results:
            //       [ { min_tick_size: null,
            //           splits: 'https://api.robinhood.com/instruments/450dfc6d-5510-4d40-abfb-f633b7d9be3e/splits/',
            //           margin_initial_ratio: '0.5000',
            //           url: 'https://api.robinhood.com/instruments/450dfc6d-5510-4d40-abfb-f633b7d9be3e/',
            //           quote: 'https://api.robinhood.com/quotes/AAPL/',
            //           symbol: 'AAPL',
            //           bloomberg_unique: 'EQ0010169500001000',
            //           list_date: '1990-01-02',
            //           fundamentals: 'https://api.robinhood.com/fundamentals/AAPL/',
            //           state: 'active',
            //           day_trade_ratio: '0.2500',
            //           tradeable: true,
            //           maintenance_ratio: '0.2500',
            //           id: '450dfc6d-5510-4d40-abfb-f633b7d9be3e',
            //           market: 'https://api.robinhood.com/markets/XNAS/',
            //           name: 'Apple Inc. - Common Stock' } ],
            //      next: null }
        }
    })
});
```


Get the user's instruments for a specified stock.

### `accounts(callback)`

```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.accounts(function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("accounts");
            console.log(body);
            //{ previous: null,
            //  results:
            //   [ { deactivated: false,
            //       updated_at: '2016-03-11T20:37:15.971253Z',
            //       margin_balances: [Object],
            //       portfolio: 'https://api.robinhood.com/accounts/asdf/portfolio/',
            //       cash_balances: null,
            //       withdrawal_halted: false,
            //       cash_available_for_withdrawal: '692006.6600',
            //       type: 'margin',
            //       sma: '692006.6600',
            //       sweep_enabled: false,
            //       deposit_halted: false,
            //       buying_power: '692006.6600',
            //       user: 'https://api.robinhood.com/user/',
            //       max_ach_early_access_amount: '1000.00',
            //       cash_held_for_orders: '0.0000',
            //       only_position_closing_trades: false,
            //       url: 'https://api.robinhood.com/accounts/asdf/',
            //       positions: 'https://api.robinhood.com/accounts/asdf/positions/',
            //       created_at: '2015-06-17T14:53:36.928233Z',
            //       cash: '692006.6600',
            //       sma_held_for_orders: '0.0000',
            //       account_number: 'asdf',
            //       uncleared_deposits: '0.0000',
            //       unsettled_funds: '0.0000' } ],
            //  next: null }
        }
    })
});
```


Get the user's accounts.

### `user(callback)`
Get the user information.

```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.user(function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("user");
            console.log(body);
        }
    })
});
```

### `dividends(callback)`

Get the user's dividends information.
```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.dividends(function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("dividends");
            console.log(body);
        }
    })
});
```


### `orders(callback)`

Get the user's orders information.
```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.orders(function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("orders");
            console.log(body);
        }
    })
});
```
### `place_buy_order(options, callback)`

Place a buy order on a specified stock.

```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    var options = {
        type: 'limit',
        quantity: 1,
        bid_price: 1.00,
        instrument: {
            url: String,
            symbol: String
        }
        // // Optional:
        // trigger: String, // Defaults to "gfd" (Good For Day)
        // time: String,    // Defaults to "immediate"
        // type: String     // Defaults to "market"
    }
    Robinhood.place_buy_order(options, function(error, response, body){
        if(error){
            console.error(error);
        }else{
            console.log(body);
        }
    })
});
```

For the Optional ones, the values can be:

*[Disclaimer: This is an unofficial API based on reverse engineering, and the following option values have not been confirmed]*

#### `trigger`

A *[trade trigger](http://www.investopedia.com/terms/t/trade-trigger.asp)* is usually a market condition, such as a rise or fall in the price of an index or security.

Values can be:

*   `gfd`: Good For Day
*   `gtc`: Good Till Cancelled
*   `oco`: Order Cancels Other

#### `time`

The *[time in force](http://www.investopedia.com/terms/t/timeinforce.asp?layout=infini&v=3A)* for an order defines the length of time over which an order will continue working before it is canceled.

Values can be:

*   `immediate` : The order will be cancelled unless it is fulfilled immediately.
*   `day` : The order will be cancelled at the end of the trading day.

### `place_sell_order(options, callback)      (Deprecated use .sell())`
### `sell(options, callback)`

Place a sell order on a specified stock.

```js

var Robinhood = require('robinhood-observer')(credentials, function(){
    var options = {
        type: 'limit',
        quantity: 1,
        bid_price: 1.00,
        instrument: {
            url: String,
            symbol: String
        },
        // // Optional:
        // trigger: String, // Defaults to "gfd" (Good For Day)
        // time: String,    // Defaults to "immediate"
        // type: String     // Defaults to "market"
    }
    //Using Callback
    Robinhood.sell(options, function(error, response, body){
        if(error){
            console.error(error);
        }else{
            console.log(body);
        }
    })
    //As Promise
    Robinhood.sell(options)
    .then(success => {

    })
    .catch(err => {

    })

});

```

For the Optional ones, the values can be:

*[Disclaimer: This is an unofficial API based on reverse engineering, and the following option values have not been confirmed]*

#### `trigger`

A *[trade trigger](http://www.investopedia.com/terms/t/trade-trigger.asp)* is usually a market condition, such as a rise or fall in the price of an index or security.

Values can be:

*   `gfd`: Good For Day
*   `gtc`: Good Till Cancelled
*   `oco`: Order Cancels Other

#### `time`

The *[time in force](http://www.investopedia.com/terms/t/timeinforce.asp?layout=infini&v=3A)* for an order defines the length of time over which an order will continue working before it is canceled.

Values can be:

*   `immediate` : The order will be cancelled unless it is fulfilled immediately.
*   `day` : The order will be cancelled at the end of the trading day.

### `fundamentals(symbol, callback)`

Get fundamental data about a symbol.

#### Response

An object containing information about the symbol:

```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.fundamentals("SBPH", function(error, response, body){
        if(error){
            console.error(error);
        }else{
            console.log(body);
            //{                               // Example for SBPH
            //    average_volume: string,     // "14381.0215"
            //    description: string,        // "Spring Bank Pharmaceuticals, Inc. [...]"
            //    dividend_yield: string,     // "0.0000"
            //    high: string,               // "12.5300"
            //    high_52_weeks: string,      // "13.2500"
            //    instrument: string,         // "https://api.robinhood.com/instruments/42e07e3a-ca7a-4abc-8c23-de49cb657c62/"
            //    low: string,                // "11.8000"
            //    low_52_weeks: string,       // "7.6160"
            //    market_cap: string,         // "94799500.0000"
            //    open: string,               // "12.5300"
            //    pe_ratio: string,           // null (price/earnings ratio)
            //    volume: string              // "4119.0000"
            //}
        }
    })
});


```

### `cancel_order(order, callback)`

Cancel an order
```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    //Get list of orders
    Robinhood.orders(function(error, response, body){
        if(error){
            console.error(error);
        }else{
            var orderToCancel = body.results[0];
            //Try to cancel the latest order
            Robinhood.cancel_order(orderToCancel, function(err, response, body){
                if(err){
                    //Error

                    console.error(err);     // { message: 'Order cannot be cancelled.', order: {Order} }
                }else{
                    //Success

                    console.log("Cancel Order Successful");
                    console.log(body)       //{}
                }
            })
        }
    })
})
```

### `watchlists(name, callback)`
```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.watchlists(function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("got watchlists");
            console.log(body);

            //{ previous: null,
            //  results:
            //   [ { url: 'https://api.robinhood.com/watchlists/Default/',
            //       user: 'https://api.robinhood.com/user/',
            //      name: 'Default' } ],
            //  next: null }
        }
    })
});
```

### `create_watch_list(name, callback)`
```js
//Your account type must support multiple watchlists to use this endpoint otherwise will get { detail: 'Request was throttled.' } and watchlist is not created.
Robinhood.create_watch_list('Technology', function(err, response, body){
    if(err){
        console.error(err);
    }else{
        console.log("created watchlist");
        console.log(body);
    //    {
    //        "url": "https://api.robinhood.com/watchlists/Technology/",
    //        "user": "https://api.robinhood.com/user/",
    //        "name": "Technology"
    //    }

    }
})
```

### `sp500_up(callback)`
```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.sp500_up(function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("sp500_up");
            console.log(body);
            //{ count: 10,
            //  next: null,
            //  previous: null,
            //  results:
            //   [ { instrument_url: 'https://api.robinhood.com/instruments/adbc3ce0-dd0d-4a7a-92e0-88c1f127cbcb/',
            //       symbol: 'NEM',
            //       updated_at: '2016-09-21T13:03:32.310184Z',
            //       price_movement: [{ market_hours_last_movement_pct: '7.55', market_hours_last_price: '41.0300' }],
            //       description: 'Newmont Mining Corp. is a gold producer, which is engaged in the acquisition, exploration and production of gold and copper properties in U.S., Australia, Peru, Indonesia, Ghana, Canada, New Zealand and Mexico. The company\'s operating segments include North America, South America, Asia Pacific and Africa. The North America segment consists of Nevada in the United States, La Herradura in Mexico and Hope Bay in Canada. The South America segment consists of Yanacocha and Conga in Peru. The Asia Pacific segment consists of Boddington in Australia, Batu Hijau in Indonesia and other smaller operations in Australia and New Zealand. The Africa segment consists of Ahafo and Akyem in Ghana. The company was founded by William Boyce Thompson on May 2, 1921 and is headquartered in Greenwood Village, CO.' },
            //     { instrument_url: 'https://api.robinhood.com/instruments/809adc21-ef75-4c3d-9c0e-5f9a167f235b/',
            //       symbol: 'ADBE',
            //       updated_at: '2016-09-21T13:01:31.748590Z',
            //       price_movement: [{ market_hours_last_movement_pct: '7.55', market_hours_last_price: '41.0300' }],
            //       description: 'Adobe Systems, Inc. provides digital marketing and digital media solutions. The company operates its business through three segments: Digital Media, Digital Marketing, and Print and Publishing. The Digital Media segment offers creative cloud services, which allow members to download and install the latest versions of products, such as Adobe Photoshop, Adobe Illustrator, Adobe Premiere Pro, Adobe Photoshop Lightroom and Adobe InDesign, as well as utilize other tools, such as Adobe Acrobat. This segment also offers other tools and services, including hobbyist products, such as Adobe Photoshop Elements and Adobe Premiere Elements, Adobe Digital Publishing Suite, Adobe PhoneGap, Adobe Typekit, as well as mobile apps, such as Adobe Photoshop Mix, Adobe Photoshop Sketch and Adobe Premiere Clip that run on tablets and mobile devices. The Digital Media serves professionals, including graphic designers, production artists, web designers and developers, user interface designers, videographers, motion graphic artists, prepress professionals, video game developers, mobile application developers, students and administrators. The Digital Marketing segment offers various solutions, including analytics, social marketing, targeting, media optimization, digital experience management and cross-channel campaign management, as well as premium video delivery and monetization. This segment also offers legacy enterprise software, such as Adobe Connect web conferencing platform and Adobe LiveCycle. The Print and Publishing segment offers legacy products and services for eLearning solutions, technical document publishing, web application development and high-end printing. Adobe Systems was founded by Charles M. Geschke and John E. Warnock in December 1982 and is headquartered in San Jose, CA.' }
            //    ]
            //}
        }
    })
});
```

### `sp500_down(callback)`
```js
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.sp500_down(function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("sp500_down");
            console.log(body);
            //{ count: 10,
            //  next: null,
            //  previous: null,
            //  results:
            //   [ { instrument_url: 'https://api.robinhood.com/instruments/adbc3ce0-dd0d-4a7a-92e0-88c1f127cbcb/',
            //       symbol: 'NEM',
            //       updated_at: '2016-09-21T13:03:32.310184Z',
            //       price_movement: [{ market_hours_last_movement_pct: '-3.70', market_hours_last_price: '13.2800' }],
            //      description: 'Newmont Mining Corp. is a gold producer, which is engaged in the acquisition, exploration and production of gold and copper properties in U.S., Australia, Peru, Indonesia, Ghana, Canada, New Zealand and Mexico. The company\'s operating segments include North America, South America, Asia Pacific and Africa. The North America segment consists of Nevada in the United States, La Herradura in Mexico and Hope Bay in Canada. The South America segment consists of Yanacocha and Conga in Peru. The Asia Pacific segment consists of Boddington in Australia, Batu Hijau in Indonesia and other smaller operations in Australia and New Zealand. The Africa segment consists of Ahafo and Akyem in Ghana. The company was founded by William Boyce Thompson on May 2, 1921 and is headquartered in Greenwood Village, CO.' },
            //     { instrument_url: 'https://api.robinhood.com/instruments/809adc21-ef75-4c3d-9c0e-5f9a167f235b/',
            //       symbol: 'ADBE',
            //       updated_at: '2016-09-21T13:01:31.748590Z',
            //       price_movement: [{ market_hours_last_movement_pct: '-3.70', market_hours_last_price: '13.2800' }],
            //       description: 'Adobe Systems, Inc. provides digital marketing and digital media solutions. The company operates its business through three segments: Digital Media, Digital Marketing, and Print and Publishing. The Digital Media segment offers creative cloud services, which allow members to download and install the latest versions of products, such as Adobe Photoshop, Adobe Illustrator, Adobe Premiere Pro, Adobe Photoshop Lightroom and Adobe InDesign, as well as utilize other tools, such as Adobe Acrobat. This segment also offers other tools and services, including hobbyist products, such as Adobe Photoshop Elements and Adobe Premiere Elements, Adobe Digital Publishing Suite, Adobe PhoneGap, Adobe Typekit, as well as mobile apps, such as Adobe Photoshop Mix, Adobe Photoshop Sketch and Adobe Premiere Clip that run on tablets and mobile devices. The Digital Media serves professionals, including graphic designers, production artists, web designers and developers, user interface designers, videographers, motion graphic artists, prepress professionals, video game developers, mobile application developers, students and administrators. The Digital Marketing segment offers various solutions, including analytics, social marketing, targeting, media optimization, digital experience management and cross-channel campaign management, as well as premium video delivery and monetization. This segment also offers legacy enterprise software, such as Adobe Connect web conferencing platform and Adobe LiveCycle. The Print and Publishing segment offers legacy products and services for eLearning solutions, technical document publishing, web application development and high-end printing. Adobe Systems was founded by Charles M. Geschke and John E. Warnock in December 1982 and is headquartered in San Jose, CA.' }
            //    ]
            //}

        }
    })
});
```
### `splits(instrument, callback)`

```js
var Robinhood = require('robinhood-observer')(credentials, function(){

    Robinhood.splits("7a3a677d-1664-44a0-a94b-3bb3d64f9e20", function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("got splits");
            console.log(body);   //{ previous: null, results: [], next: null }
        }
    })
})
```


### `url(url, callback)`

`url` is used to get continued or paginated data from the API. Queries with long results return a reference to the next sete. Example -

```
next: 'https://api.robinhood.com/orders/?cursor=cD0yMD82LTA0LTAzKzkwJVNCNTclM0ExNC45MzYyKDYlMkIwoCUzqtAW' }
```

The url returned can be passed to the `url` method to continue getting the next set of results.

## Contributors
*   Jesse Spencer ([@Jspenc72](https://github.com/jspenc72))
------------------

### Credits and Inspiration
Alejandro U. Alvarez ([@aurbano](https://github.com/aurbano))
Jamonek ([@Jamonek](https://github.com/Jamonek/Robinhood))
Sanko ([@sanko](https://github.com/sanko/Robinhood))

------------------

### Further Information

See @Sanko's [Unofficial Documentation](https://github.com/sanko/Robinhood) for more information.
FYI [Robinhood's Terms and Conditions](https://brokerage-static.s3.amazonaws.com/assets/robinhood/legal/Robinhood%20Terms%20and%20Conditions.pdf)


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjspenc72%2Frobinhood-observer.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjspenc72%2Frobinhood-observer?ref=badge_large)