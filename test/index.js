var should = require('should');
var Robinhood = require('../src');

var TEST_SYMBOL = 'GOOG';
var TEST_SYMBOLS = ['GOOG', 'AAPL'];

describe('Robinhood', function() {
  it('Should observe quotes for ' + TEST_SYMBOLS + '', function(done) {
    var count = 0;
      var obs = Robinhood(null).observeQuote(TEST_SYMBOLS,500)
      var subscription = obs
      .map(quote => quote.results)
      .subscribe(x => {
        count++;
        should(x[0].symbol).be.equal(TEST_SYMBOLS[0]);
        should(x[1].symbol).be.equal(TEST_SYMBOLS[1]);
        should(count).be.greaterThan(0);
      }, e => {
        done(e);
        return;
      }, () => console.log("disposed"));

      setTimeout(function(){
        //Unsubscribe
        should(subscription.isStopped).be.equal(false);
        subscription.dispose();
        should(subscription.isStopped).be.equal(true);
        done()
      }, 1500);
  });

  it('Should observe quotes for ' + TEST_SYMBOL + '', function(done) {
    var count = 0;
      var obs = Robinhood(null).observeQuote(TEST_SYMBOL,500)
      var subscription = obs
      .map(quote => quote.results)
      .subscribe(x => {
        count++;
        should(x[0].symbol).be.equal(TEST_SYMBOLS[0]);
        should(count).be.greaterThan(0);
      }, e => {
        done(e);
        return;
      }, () => console.log("disposed"));

      setTimeout(function(){
        //Unsubscribe
        should(subscription.isStopped).be.equal(false);
        subscription.dispose();
        should(subscription.isStopped).be.equal(true);
        done()
      }, 1500);
  });

  it('Should not observe orders without credentials.', function(done) {
    var count = 0;
      var obs = Robinhood(null).observeOrders(500)
      var subscription = obs
      .subscribe(x => {
        done(x);
      }, e => {
        if(e.detail=="Invalid token."){
          done();
        }
        return;
      }, () => console.log("disposed"));

      setTimeout(function(){
        //Unsubscribe
        should(subscription.isStopped).be.equal(true);
        subscription.dispose();
        done()
      }, 1500);
  });

  it('Should not get investment profile without credentials - callback', function(done) {
      Robinhood(null).investment_profile(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.detail).be.equal("Authentication credentials were not provided.");
          done();
      });
  });

  it('Should not get investment profile without credentials - promise', function(done) {
      Robinhood(null).investment_profile()
      .then(success => {
        should(success.detail).be.equal("Authentication credentials were not provided.");
        done();
      })
      .catch(err => {
        should(err.error.detail).be.equal("Authentication credentials were not provided.");
        done();
      })
  });

  it('Should get fundamentals with a callback for '+TEST_SYMBOL, function(done) {
      Robinhood(null).fundamentals(TEST_SYMBOL, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results.length).be.above(0);
          done();
      });
  });

  it('Should get fundamentals with a promise for '+TEST_SYMBOL, function(done) {
      Robinhood(null).fundamentals(TEST_SYMBOL)
      .then(success => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch(err =>{
        done(err);
      })
  });

  it('Should get fundamentals with a callback for Array '+TEST_SYMBOLS, function(done) {
      Robinhood(null).fundamentals(TEST_SYMBOL, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results.length).be.above(0);
          done();
      });
  });

  it('Should get fundamentals with a promise for Array '+TEST_SYMBOLS, function(done) {
      Robinhood(null).fundamentals(TEST_SYMBOL)
      .then(success => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch(err =>{
        done(err);
      })
  });

  it('Should get instruments with a promise for Array '+TEST_SYMBOLS, function(done) {
      Robinhood(null).instruments(TEST_SYMBOLS)
      .then(success => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch(err =>{
        done(err);
      })
  });

  it('Should get instruments with a promise for symbol '+TEST_SYMBOL, function(done) {
      Robinhood(null).instruments(TEST_SYMBOL)
      .then(success => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch(err =>{
        done(err);
      })
  });

  it('Should get instruments with a callback for Array '+TEST_SYMBOLS, function(done) {
      Robinhood(null).instruments(TEST_SYMBOLS, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results.length).be.above(0);
          done();
      });
  });

  it('Should get instruments with a callback for symbol '+TEST_SYMBOL, function(done) {
      Robinhood(null).instruments(TEST_SYMBOL, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results.length).be.above(0);
          done();
      });
  });

  it('Should handle callback when getting quotes with .quote_data() for Array ' + TEST_SYMBOLS, function(done) {
      Robinhood(null).quote_data(TEST_SYMBOLS, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
          should(body.results[1].symbol).be.equal(TEST_SYMBOLS[1]);
          done();
      });
  });

  it('Should handle callback when getting quotes with .quote_data() for symbol: ' + TEST_SYMBOL, function(done) {
      Robinhood(null).quote_data(TEST_SYMBOL, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results[0].symbol).be.equal(TEST_SYMBOL);
          done();
      });
  });


  it('Should handle callback when getting quotes for Array ' + TEST_SYMBOLS, function(done) {
      Robinhood(null).quote(TEST_SYMBOLS, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
          should(body.results[1].symbol).be.equal(TEST_SYMBOLS[1]);
          done();
      });
  });

  it('Should handle callback when getting quotes for symbol: ' + TEST_SYMBOL, function(done) {
      Robinhood(null).quote(TEST_SYMBOL, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results[0].symbol).be.equal(TEST_SYMBOL);
          done();
      });
  });

  it('Should return promise when getting quotes with .quote_data() without callback for Array:' + TEST_SYMBOLS, function(done) {
      Robinhood(null).quote_data(TEST_SYMBOLS)
      .then(success => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
        done();
      });
  });

  it('Should return promise when getting quotes with .quote_data()  without callback for symbol:' + TEST_SYMBOL, function(done) {
      Robinhood(null).quote_data(TEST_SYMBOL)
      .then(success => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOL);
        done();
      });
  });


  it('Should return promise when getting quotes with .quote_data() without callback for Array:' + TEST_SYMBOLS, function(done) {
      Robinhood(null).quote_data(TEST_SYMBOLS)
      .then(success => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
        done();
      });
  });

  it('Should return promise when getting quotes with .quote_data() without callback for symbol:' + TEST_SYMBOL, function(done) {
      Robinhood(null).quote_data(TEST_SYMBOL)
      .then(success => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOL);
        done();
      });
  });

  it('Should return promise when getting quotes without callback for Array:' + TEST_SYMBOLS, function(done) {
      Robinhood(null).quote(TEST_SYMBOLS)
      .then(success => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
        done();
      });
  });

  it('Should return promise when getting quotes without callback for symbol:' + TEST_SYMBOL, function(done) {
      Robinhood(null).quote(TEST_SYMBOL)
      .then(success => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOL);
        done();
      });
  });

  it('Should not get accounts without credentials - callback', function(done) {
      Robinhood(null).accounts(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.detail).be.equal("Authentication credentials were not provided.");
          done();
      });
  });

  it('Should not get accounts without credentials - promise', function(done) {
      Robinhood(null).accounts()
      .then(success => {
        should(success.detail).be.equal("Authentication credentials were not provided.");
        done();
      })
      .catch(err => {
        should(err.error.detail).be.equal("Authentication credentials were not provided.");
        done();
      })
  });

  it('Should not get user without credentials - callback', function(done) {
      Robinhood(null).user(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.detail).be.equal("Not found.");
          done();
      });
  });

  it('Should not get user without credentials - promise', function(done) {
      Robinhood(null).user()
      .then(success => {
        should(success.detail).be.equal("Not found.");
        done();
      })
      .catch(err => {
        should(err.error.detail).be.equal("Not found.");
        done();
      })
  });

  it('Should not get dividends without credentials - callback', function(done) {
      Robinhood(null).dividends(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.detail).be.equal("Authentication credentials were not provided.");
          done();
      });
  });

  it('Should not get dividends without credentials - promise', function(done) {
      Robinhood(null).dividends()
      .then(success => {
        should(success.detail).be.equal("Authentication credentials were not provided.");
        done();
      })
      .catch(err => {
        should(err.error.detail).be.equal("Authentication credentials were not provided.");
        done();
      })
  });

  it('Should not get orders without credentials - callback', function(done) {
      Robinhood(null).orders(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.detail).be.equal("Authentication credentials were not provided.");
          done();
      });
  });

  it('Should not get orders without credentials - promise', function(done) {
      Robinhood(null).orders()
      .then(success => {
        should(success.detail).be.equal("Authentication credentials were not provided.");
        done();
      })
      .catch(err => {
        should(err.error.detail).be.equal("Authentication credentials were not provided.");
        done();
      })
  });

  it('Should not send cancel orders request with cancel_order() without order parameter - callback', function(done) {
      Robinhood(null).cancel_order(function(err, response, body) {
          if(err) {
              done();
              return;
          }
          should(body.detail).be.equal("Authentication credentials were not provided.");
          done();
      });
  });

  it('Should not send cancel orders request with cancel() without order parameter - callback', function(done) {
      Robinhood(null).cancel(function(err, response, body) {
          if(err) {
              done();
              return;
          }
          should(body.detail).be.equal("Authentication credentials were not provided.");
          done();
      });
  });


  it('Should not send cancel orders request without order parameter - promise', function(done) {
      Robinhood(null).cancel_order()
      .then(success => {
        done(success);
      })
      .catch(err => {
        done();
      })
  });


  it('Should not get positions without credentials - callback', function(done) {
      Robinhood(null).positions(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body).have.property('detail');
          done();
      });
  });

  it('Should not get positions without credentials - promise', function(done) {
      Robinhood(null).positions()
      .then(success => {
        should(success).have.property('detail');
        done();
      })
      .catch(err => {

        should(err.error.detail).be.equal("Authentication credentials were not provided.");
        done()
      })
  });

  it('Should get news about ' + TEST_SYMBOL +' - callback', function(done) {
      Robinhood(null).news(TEST_SYMBOL, function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results.length).be.above(0);
          done();
      });
  });

  it('Should get news about ' + TEST_SYMBOL +' - promise', function(done) {
      Robinhood(null).news(TEST_SYMBOL)
      .then(success => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  it('Should get markets - callback', function(done) {
      Robinhood(null).markets(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results.length).be.above(0);
          done();
      });
  });

  it('Should get markets - promise', function(done) {
      Robinhood(null).markets()
      .then(success => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  it('Should get data for the SP500 index up - callback', function(done) {
      Robinhood(null).sp500_up(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body.results.length).be.above(0);
          done();
      });
  });

  it('Should get data for the SP500 index up - promise', function(done) {
      Robinhood(null).sp500_up()
      .then(success => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  it('Should get data for the SP500 index down', function(done) {
      Robinhood(null).sp500_down(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }

          should(body.results.length).be.above(0);

          done();
      });
  });

  it('Should get data for the SP500 index down - promise', function(done) {
      Robinhood(null).sp500_down()
      .then(success => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  it('Should not create watch list without credentials - callback', function(done) {
      Robinhood(null).create_watch_list({},function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body).have.property('detail');
          done();
      });
  });

  it('Should not create watch list without credentials - promise', function(done) {
      Robinhood(null).create_watch_list({},function(err, response, body) {
          if(err) {
              console.log(err)
              done(err);
              return;
          }
          should(body).have.property('detail');
          done();
      });
  });


  it('Should not get watchlists without credentials - callback', function(done) {
      Robinhood(null).watchlists(function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body).have.property('detail');
          done();
      });
  });

  it('Should not get watchlists without credentials - promise', function(done) {
      Robinhood(null).watchlists(function(err, response, body) {
          if(err) {
              console.log(err)
              done(err);
              return;
          }
          should(body).have.property('detail');
          done();
      });
  });


    it('Should get splits - callback', function(done) {
      Robinhood(null).instruments(TEST_SYMBOL)
      .then(success => {
        Robinhood(null).splits(success.results[0].url.split("/instruments/")[1], function(err, response, body) {
            if(err) {
                done(err);
                return;
            }
            should(body).have.property('results');
            done();
        });
      })
      .catch(err => {
        done(err);
      })
    });

    it('Should get splits - promise', function(done) {
      //First Get Quote
      Robinhood(null).instruments(TEST_SYMBOL)
      .then(success => {
        Robinhood(null).splits(success.results[0].url.split("/instruments/")[1])
        .then(success => {
          should(success).have.property('results');
          done();
        })
        .catch(err => {
          done(err);
        })
      })
      .catch(err => {
        done(err);
      })
    });

    it('Should get historicals - promise', function(done) {
      //First Get Quote
      Robinhood(null).historicals(TEST_SYMBOL, '10minute', 'week')
      .then(success => {
        should(success).have.property('historicals');
        done();
      })
      .catch(err => {
        done(err);
      })
    });

    it('Should get historicals - callback', function(done) {
      Robinhood(null).historicals(TEST_SYMBOL, '10minute', 'week', function(err, response, body) {
          if(err) {
              done(err);
              return;
          }
          should(body).have.property('historicals');
          done();
      });
    });
});
