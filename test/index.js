const should = require('should');
const Robinhood = require('../src');

const TEST_SYMBOL = 'GOOG';
const TEST_SYMBOLS = ['GOOG', 'AAPL'];


describe('Robinhood', () => {
  it(`Should observe quotes for ${TEST_SYMBOLS}`, (done) => {
    let count = 0;
    const obs = Robinhood(null).observeQuote(TEST_SYMBOLS, 500);
    const subscription = obs
      .map(quote => quote.results)
      .subscribe((x) => {
        count += 1;
        should(x[0].symbol).be.equal(TEST_SYMBOLS[0]);
        should(x[1].symbol).be.equal(TEST_SYMBOLS[1]);
        should(count).be.greaterThan(0);
      }, (e) => {
        done(e);
      }, () => console.log('disposed'));

    setTimeout(() => {
      // Unsubscribe
      should(subscription.isStopped).be.equal(false);
      subscription.dispose();
      should(subscription.isStopped).be.equal(true);
      done();
    }, 1500);
  });

  it(`Should observe quotes for ${TEST_SYMBOL}`, (done) => {
    let count = 0;
    const obs = Robinhood(null).observeQuote(TEST_SYMBOL, 500);
    const subscription = obs
      .map(quote => quote.results)
      .subscribe((x) => {
        count += 1;
        should(x[0].symbol).be.equal(TEST_SYMBOLS[0]);
        should(count).be.greaterThan(0);
      }, (e) => {
        done(e);
      }, () => console.log('disposed'));

    setTimeout(() => {
      // Unsubscribe
      should(subscription.isStopped).be.equal(false);
      subscription.dispose();
      should(subscription.isStopped).be.equal(true);
      done();
    }, 1500);
  });

  it('Should not observe orders without credentials.', (done) => {
    const obs = Robinhood(null).observeOrders(500);
    const subscription = obs
      .subscribe((x) => {
        done(x);
      }, (e) => {
        if (e.detail === 'Invalid token.') {
          done();
        }
      }, () => console.log('disposed'));

    setTimeout(() => {
      // Unsubscribe
      should(subscription.isStopped).be.equal(true);
      subscription.dispose();
      done();
    }, 1500);
  });

  it('Should not get basic user info without credentials - callback', (done) => {
    Robinhood(null).userBasicInfo((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });

  it('Should not get basic user info without credentials - promise', (done) => {
    Robinhood(null).userBasicInfo()
      .then((success) => {
        should(success.detail).be.equal('Authentication credentials were not provided.');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Authentication credentials were not provided.');
        done();
      });
  });

  it('Should not get additional user info without credentials - callback', (done) => {
    Robinhood(null).userAdditionalInfo((err, response, body) => {
      if (err) {
        done(err);
        return;
      }

      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });

  it('Should not get additional user info without credentials - promise', (done) => {
    Robinhood(null).userAdditionalInfo()
      .then((success) => {
        should(success.detail).be.equal('Authentication credentials were not provided.');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Authentication credentials were not provided.');
        done();
      });
  });

  it('Should not get user investment profile without credentials - callback', (done) => {
    Robinhood(null).userInvestmentProfile((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });

  it('Should not get user investment profile without credentials - promise', (done) => {
    Robinhood(null).userInvestmentProfile()
      .then((success) => {
        should(success.detail).be.equal('Authentication credentials were not provided.');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Authentication credentials were not provided.');
        done();
      });
  });


  it('Should not get investment profile without credentials - callback', (done) => {
    Robinhood(null).investment_profile((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });

  it('Should not get investment profile without credentials - promise', (done) => {
    Robinhood(null).investment_profile()
      .then((success) => {
        should(success.detail).be.equal('Authentication credentials were not provided.');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Authentication credentials were not provided.');
        done();
      });
  });

  it(`Should get fundamentals with a callback for ${TEST_SYMBOL}`, (done) => {
    Robinhood(null).fundamentals(TEST_SYMBOL, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results.length).be.above(0);
      done();
    });
  });

  it(`Should get fundamentals with a promise for ${TEST_SYMBOL}`, (done) => {
    Robinhood(null).fundamentals(TEST_SYMBOL)
      .then((success) => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it(`Should get fundamentals with a callback for Array ${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).fundamentals(TEST_SYMBOL, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results.length).be.above(0);
      done();
    });
  });

  it(`Should get fundamentals with a promise for Array ${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).fundamentals(TEST_SYMBOL)
      .then((success) => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it(`Should get instruments with a promise for Array ${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).instruments(TEST_SYMBOLS)
      .then((success) => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it(`Should get instruments with a promise for symbol ${TEST_SYMBOL}`, (done) => {
    Robinhood(null).instruments(TEST_SYMBOL)
      .then((success) => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it(`Should get instruments with a callback for Array ${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).instruments(TEST_SYMBOLS, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results.length).be.above(0);
      done();
    });
  });

  it(`Should get instruments with a callback for symbol ${TEST_SYMBOL}`, (done) => {
    Robinhood(null).instruments(TEST_SYMBOL, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results.length).be.above(0);
      done();
    });
  });

  it(`Should handle callback when getting quotes with .quote_data() for Array ${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).quote_data(TEST_SYMBOLS, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
      should(body.results[1].symbol).be.equal(TEST_SYMBOLS[1]);
      done();
    });
  });

  it(`Should handle callback when getting quotes with .quote_data() for symbol: ${TEST_SYMBOL}`, (done) => {
    Robinhood(null).quote_data(TEST_SYMBOL, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results[0].symbol).be.equal(TEST_SYMBOL);
      done();
    });
  });


  it(`Should handle callback when getting quotes for Array ${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).quote(TEST_SYMBOLS, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
      should(body.results[1].symbol).be.equal(TEST_SYMBOLS[1]);
      done();
    });
  });

  it(`Should handle callback when getting quotes for symbol: ${TEST_SYMBOL}`, (done) => {
    Robinhood(null).quote(TEST_SYMBOL, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results[0].symbol).be.equal(TEST_SYMBOL);
      done();
    });
  });

  it(`Should return promise when getting quotes with .quote_data() without callback for Array:${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).quote_data(TEST_SYMBOLS)
      .then((success) => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
        done();
      });
  });

  it(`Should return promise when getting quotes with .quote_data()  without callback for symbol:${TEST_SYMBOL}`, (done) => {
    Robinhood(null).quote_data(TEST_SYMBOL)
      .then((success) => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOL);
        done();
      });
  });


  it(`Should return promise when getting quotes with .quote_data() without callback for Array:${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).quote_data(TEST_SYMBOLS)
      .then((success) => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
        done();
      });
  });

  it(`Should return promise when getting quotes with .quote_data() without callback for symbol:${TEST_SYMBOL}`, (done) => {
    Robinhood(null).quote_data(TEST_SYMBOL)
      .then((success) => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOL);
        done();
      });
  });

  it(`Should return promise when getting quotes without callback for Array:${TEST_SYMBOLS}`, (done) => {
    Robinhood(null).quote(TEST_SYMBOLS)
      .then((success) => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOLS[0]);
        done();
      });
  });

  it(`Should return promise when getting quotes without callback for symbol:${TEST_SYMBOL}`, (done) => {
    Robinhood(null).quote(TEST_SYMBOL)
      .then((success) => {
        should(success.results[0].symbol).be.equal(TEST_SYMBOL);
        done();
      });
  });

  it('Should not get accounts without credentials - callback', (done) => {
    Robinhood(null).accounts((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });

  it('Should not get accounts without credentials - promise', (done) => {
    Robinhood(null).accounts()
      .then((success) => {
        should(success.detail).be.equal('Authentication credentials were not provided.');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Authentication credentials were not provided.');
        done();
      });
  });

  it('Should not get user without credentials - callback', (done) => {
    Robinhood(null).user((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.detail).be.equal('Not found.');
      done();
    });
  });

  it('Should not get user without credentials - promise', (done) => {
    Robinhood(null).user()
      .then((success) => {
        should(success.detail).be.equal('Not found.');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Not found.');
        done();
      });
  });

  it('Should not get dividends without credentials - callback', (done) => {
    Robinhood(null).dividends((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });

  it('Should not get dividends without credentials - promise', (done) => {
    Robinhood(null).dividends()
      .then((success) => {
        should(success.detail).be.equal('Authentication credentials were not provided.');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Authentication credentials were not provided.');
        done();
      });
  });

  it('Should not get orders without credentials - callback', (done) => {
    Robinhood(null).orders((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });

  it('Should not get orders without credentials - promise', (done) => {
    Robinhood(null).orders()
      .then((success) => {
        should(success.detail).be.equal('Authentication credentials were not provided.');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Authentication credentials were not provided.');
        done();
      });
  });

  it('Should not send cancel orders request with cancel_order() without order parameter - callback', (done) => {
    Robinhood(null).cancel_order((err, response, body) => {
      if (err) {
        done();
        return;
      }
      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });

  it('Should not send cancel orders request with cancel() without order parameter - callback', (done) => {
    Robinhood(null).cancel((err, response, body) => {
      if (err) {
        done();
        return;
      }
      should(body.detail).be.equal('Authentication credentials were not provided.');
      done();
    });
  });


  it('Should not send cancel orders request without order parameter - promise', (done) => {
    Robinhood(null).cancel_order()
      .then((success) => {
        done(success);
      })
      .catch((err) => {
        console.error(err);
        done();
      });
  });


  it('Should not get positions without credentials - callback', (done) => {
    Robinhood(null).positions((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body).have.property('detail');
      done();
    });
  });

  it('Should not get positions without credentials - promise', (done) => {
    Robinhood(null).positions()
      .then((success) => {
        should(success).have.property('detail');
        done();
      })
      .catch((err) => {
        should(err.error.detail).be.equal('Authentication credentials were not provided.');
        done();
      });
  });

  it(`Should get news about ${TEST_SYMBOL} - callback`, (done) => {
    Robinhood(null).news(TEST_SYMBOL, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results.length).be.above(0);
      done();
    });
  });

  it(`Should get news about ${TEST_SYMBOL} - promise`, (done) => {
    Robinhood(null).news(TEST_SYMBOL)
      .then((success) => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Should get markets - callback', (done) => {
    Robinhood(null).markets((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results.length).be.above(0);
      done();
    });
  });

  it('Should get markets - promise', (done) => {
    Robinhood(null).markets()
      .then((success) => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Should get data for the SP500 index up - callback', (done) => {
    Robinhood(null).sp500_up((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body.results.length).be.above(0);
      done();
    });
  });

  it('Should get data for the SP500 index up - promise', (done) => {
    Robinhood(null).sp500_up()
      .then((success) => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Should get data for the SP500 index down', (done) => {
    Robinhood(null).sp500_down((err, response, body) => {
      if (err) {
        done(err);
        return;
      }

      should(body.results.length).be.above(0);

      done();
    });
  });

  it('Should get data for the SP500 index down - promise', (done) => {
    Robinhood(null).sp500_down()
      .then((success) => {
        should(success.results.length).be.above(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Should not create watch list without credentials - callback', (done) => {
    Robinhood(null).create_watch_list({}, (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body).have.property('detail');
      done();
    });
  });

  it('Should not create watch list without credentials - promise', (done) => {
    Robinhood(null).create_watch_list({}, (err, response, body) => {
      if (err) {
        console.log(err);
        done(err);
        return;
      }
      should(body).have.property('detail');
      done();
    });
  });


  it('Should not get watchlists without credentials - callback', (done) => {
    Robinhood(null).watchlists((err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body).have.property('detail');
      done();
    });
  });

  it('Should not get watchlists without credentials - promise', (done) => {
    Robinhood(null).watchlists((err, response, body) => {
      if (err) {
        console.log(err);
        done(err);
        return;
      }
      should(body).have.property('detail');
      done();
    });
  });


  it('Should get splits - callback', (done) => {
    Robinhood(null).instruments(TEST_SYMBOL)
      .then((success) => {
        Robinhood(null).splits(success.results[0].url.split('/instruments/')[1], (err, response, body) => {
          if (err) {
            done(err);
            return;
          }
          should(body).have.property('results');
          done();
        });
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Should get splits - promise', (done) => {
    // First Get Quote
    Robinhood(null).instruments(TEST_SYMBOL)
      .then((instrumentsSuccess) => {
        Robinhood(null).splits(instrumentsSuccess.results[0].url.split('/instruments/')[1])
          .then((splitsSuccess) => {
            should(splitsSuccess).have.property('results');
            done();
          })
          .catch((err) => {
            done(err);
          });
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Should get historicals - promise', (done) => {
    // First Get Quote
    Robinhood(null).historicals(TEST_SYMBOL, '10minute', 'week')
      .then((success) => {
        should(success).have.property('historicals');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Should get historicals - callback', (done) => {
    Robinhood(null).historicals(TEST_SYMBOL, '10minute', 'week', (err, response, body) => {
      if (err) {
        done(err);
        return;
      }
      should(body).have.property('historicals');
      done();
    });
  });

  // It should place_buy_order with api.buy() - promise

  it(`It should place_buy_order with format api.buy("AAPL", {
            type: 'limit',
            quantity: 1,
            bid_price: 110.00
        }) - promise`, (done) => {
    // First Get Quote
    should(false).be.equal('Test has not been written');
    done();
  });

  it(`It should place_buy_order with format api.buy("AAPL",     {
            type: 'limit',
            quantity: 1,
            bid_price: 110.00,
            instrument: {
                symbol: "AAPL"
            }
        }) - promise`, (done) => {
    // First Get Quote
    should(false).be.equal('Test has not been written');
    done();
  });

  it(`It should place_buy_order with api.buy("AAPL",     {
            type: 'limit',
            quantity: 1,
            bid_price: 110.00,
            instrument: {
                symbol: "AAPL",
                url: ""
            }
        }) - promise`, (done) => {
    // First Get Quote
    should(false).be.equal('Test has not been written');
    done();
  });


  it(`It should place_buy_order with format api.buy("AAPL", {
            type: 'limit',
            quantity: 1,
            bid_price: 110.00
        }, callback) - callback`, (done) => {
    // First Get Quote
    should(false).be.equal('Test has not been written');
    done();
  });

  it(`It should place_buy_order with format api.buy("AAPL",     {
            type: 'limit',
            quantity: 1,
            bid_price: 110.00,
            instrument: {
                symbol: "AAPL"
            }
        }, callback) - callback`, (done) => {
    // First Get Quote
    should(false).be.equal('Test has not been written');
    done();
  });

  it(`It should place_buy_order with api.buy("AAPL",     {
            type: 'limit',
            quantity: 1,
            bid_price: 110.00,
            instrument: {
                symbol: "AAPL",
                url: ""
            }
        }, callback) - callback`, (done) => {
    // First Get Quote
    should(false).be.equal('Test has not been written');
    done();
  });
});
