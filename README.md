<h1><img src="https://raw.githubusercontent.com/jspenc72/robinhood-node/master/.github/robinhood-node.png"/></h1>
[![RxJS](http://reactivex.io/assets/Rx_Logo_S.png)](http://reactivex.io)

[![Travis](https://img.shields.io/travis/aurbano/robinhood-node.svg?style=flat-square)](https://travis-ci.org/aurbano/robinhood-node)

[![David](https://img.shields.io/david/aurbano/Robinhood-Node.svg?style=flat-square)](https://david-dm.org/aurbano/robinhood-node)

[![NodeJS](https://img.shields.io/badge/node-6.5.0-brightgreen.svg)](https://nodejs.org/en/)


NodeJS Framework to make trades with the private [Robinhood](https://www.robinhood.com/) API.


## Features
* Quote Data
* Buy, Sell Orders
* Daily Fundamentals
* Daily, Weekly, Monthly Historicals

## Installation
```bash
$ npm install robinhood-observer --save
```
## [Example Project](https://github.com/jspenc72/robinhood-observer-starter/blob/master/index.js)

The example project helps you get started right off the bat and demonstrates some of the cool things you can do with this library.


## Usage

```js
//The username and password you use to sign into the robinhood app.

var credentials = {
    username: '',
    password: ''
};

var Robinhood = require('robinhood-observer')     //Robinhood has not authenticated but can still be used for the unauthenticated subset of the API

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

 //Unsubscribe to updates for the data after 6 seconds.

setTimeout(function(){
  subscription.dispose();  
}, 60000);

```

## Observable Usage

[See The Reactive Extensions for JavaScript (RxJS)](https://github.com/Reactive-Extensions/RxJS) for more information.

### `observeQuote(symbol, request_frequency?)`

#### Parameters
- symbol (Required)
- request_frequency (Optional) Defaults to 800 milliseconds

```js
var credentials = {
    username: '',
    password: ''
};

var Robinhood = require('../src')(credentials, function(){
    var subscription = Robinhood.observeQuote(['AAPL'])
    .map(quote => quote.results)
    .distinct()                         //Only use distict results...
    .subscribe(x => {
      //Do something each time the price changes
      console.log(x);
    }, e => {
      console.log("error with result");
      console.error(e)
    }, () => console.log('onCompleted'));
    setTimeout(function(){
      //Unsubscribe to updates for the data after 6 seconds.
      subscription.dispose();
    }, 60000);
});
```

### `observeOrders(request_frequency?)`
- request_frequency (Optional) Defaults to 800 milliseconds

```js
var credentials = {
    username: '',
    password: ''
};

var Robinhood = require('../src')(credentials, function(){
    var subscription = Robinhood.observeOrders()
    .map(quote => quote.results)
    .distinct()                         //Only use distict results...
    .subscribe(x => {
      //Do something each time the price changes
      console.log(x);
    }, e => {
      console.log("error with result");
      console.error(e)
    }, () => console.log('onCompleted'));
    setTimeout(function(){
      //Unsubscribe to updates for the data after 6 seconds.
      subscription.dispose();
    }, 60000);
});
```


<!-- toc -->
  * [Features](#features)
  * [Installation](#installation)
  * [Usage](#usage)
  * [API](#api)
    * [`observeQuote() // Not authenticated`](#quote-datastock-callback-not-authenticated)
    * [`observeOrders() // Not authenticated`](#quote-datastock-callback-not-authenticated)
    * [`quote_data(stock, callback) // Not authenticated`](#quote-datastock-callback-not-authenticated)
    * [`place_buy_order(options, callback)`](#place-buy-orderoptions-callback)
      * [`trigger`](#trigger)
      * [`time`](#time)
    * [`place_sell_order(options, callback)`](#place-sell-orderoptions-callback)
      * [`trigger`](#trigger)
      * [`time`](#time)
    * [`cancel_order(order, callback)`](#cancel-orderorder-callback)
    * [`url(url, callback)`](#urlurl-callback)

* [Contributors](#contributors)
* [TLDR](#api)
  * [`watchlists(name, callback)`](#watchlistsname-callback)
  * [`create_watch_list(name, callback)`](#create-watch-listname-callback)
  * [`sp500_up(callback)`](#sp500-upcallback)
  * [`sp500_down(callback)`](#sp500-downcallback)
  * [`splits(instrument, callback)`](#splitsinstrument-callback)
  * [`fundamentals(symbol, callback)`](#fundamentalssymbol-callback)
    * [Response](#response)
  * [`accounts(callback)`](#accountscallback)
  * [`user(callback)`](#usercallback)
  * [`dividends(callback)`](#dividendscallback)
  * [`orders(callback)`](#orderscallback)
  * [`historicals(symbol, intv, span, callback)`](#historicalssymbol-intv-span-callback)
  * [`investment_profile(callback)`](#investment-profilecallback)
  * [`instruments(symbol, callback)`](#instrumentssymbol-callback)
<!-- toc stop -->



# REST API Methods Unauthenticated

### `quote_data(stock, callback)`

Get the user's quote data for a specified stock.

```js
//Promise Style
var Robinhood = require('robinhood-observer')

Robinhood(null).quote_data('AAPL')
.then(success => {
  console.log(success);
})
.catch(err => {
  console.error(err);
})

//Callback Style
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.quote_data('AAPL', function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("quote_data");
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

### `function historicals(symbol: string, interval: string, timespan: string, callback:()) or function historicals(symbol: string, interval: string, timespan: string): Promise{} `    

Interval Values can be:

* `5minute`: 5 Minute interval historical data.
* `10minute`: 10 Minute interval historical data.

Timespan Values can be:

* `day`: 1 Day timespan historical data.
* `week`: 7 Day timespan historical data.

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

### `investment_profile(callback)`
Get the current user's investment profile.

```js
var credentials = require("../credentials.js")();
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.investment_profile(function(err, response, body){
        if(err){
            console.error(err);
        }else{
            console.log("investment_profile");
            console.log(body);
                //    { annual_income: '25000_39999',
                //      investment_experience: 'no_investment_exp',
                //      updated_at: '2015-06-24T17:14:53.593009Z',
                //      risk_tolerance: 'low_risk_tolerance',
                //      total_net_worth: '0_24999',
                //      liquidity_needs: 'very_important_liq_need',
                //      investment_objective: 'income_invest_obj',
                //      source_of_funds: 'savings_personal_income',
                //      user: 'https://api.robinhood.com/user/',
                //      suitability_verified: true,
                //      tax_bracket: '',
                //      time_horizon: 'short_time_horizon',
                //      liquid_net_worth: '0_24999' }

        }
    })
});
```


### `instruments(symbol, callback)`

```js
var credentials = require("../credentials.js")();
var Robinhood = require('robinhood-observer')(credentials, function(){
    Robinhood.instruments('AAPL',function(err, response, body){
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

* `gfd`: Good For Day
* `gtc`: Good Till Cancelled
* `oco`: Order Cancels Other

#### `time`

The *[time in force](http://www.investopedia.com/terms/t/timeinforce.asp?layout=infini&v=3A)* for an order defines the length of time over which an order will continue working before it is canceled.

Values can be:

* `immediate` : The order will be cancelled unless it is fulfilled immediately.
* `day` : The order will be cancelled at the end of the trading day.

### `place_sell_order(options, callback)`

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
    Robinhood.place_sell_order(options, function(error, response, body){
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

* `gfd`: Good For Day
* `gtc`: Good Till Cancelled
* `oco`: Order Cancels Other

#### `time`

The *[time in force](http://www.investopedia.com/terms/t/timeinforce.asp?layout=infini&v=3A)* for an order defines the length of time over which an order will continue working before it is canceled.

Values can be:

* `immediate` : The order will be cancelled unless it is fulfilled immediately.
* `day` : The order will be cancelled at the end of the trading day.

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

# Contributors
* Jesse Spencer ([@Jspenc72](https://github.com/jspenc72))
------------------

# Credits and Inspiration
Alejandro U. Alvarez ([@aurbano](https://github.com/aurbano))
Jamonek ([@Jamonek](https://github.com/Jamonek/Robinhood))
Sanko ([@sanko](https://github.com/sanko/Robinhood))

------------------

# Further Information

See @Sanko's [Unofficial Documentation](https://github.com/sanko/Robinhood) for more information.
FYI [Robinhood's Terms and Conditions](https://brokerage-static.s3.amazonaws.com/assets/robinhood/legal/Robinhood%20Terms%20and%20Conditions.pdf)
