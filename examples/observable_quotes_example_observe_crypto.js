let credentials;

if (process.env.ROBINHOOD_USERNAME) {
  // No need to store credentials in file or code, robinhood_observer will check for env lets if none are provided
  // See docker-compose starter https://github.com/jspenc72/robinhood-observer-starter
  credentials = null;
} else {
  credentials = {
    username: process.env.ROBINHOOD_USERNAME || '',
    password: process.env.ROBINHOOD_PASSWORD || '',
  };
}

const BUY_COUNT_LIMIT = 2;
const BUY_COUNT = 0;

const Robinhood = require('../src')(credentials, () => {
  const quotesSubscription = Robinhood.crypto.quotes.observe(['ETC'], 2000)
    .map(quote => quote.results)
    .map((results) => {
      const obj = results[0];
      for (const key in obj) {
        const value = obj[key];
        obj[key] = (key.includes('price') || key.includes('volume')) ? parseFloat(value) : value;
      }
      return obj;
    })
    .distinct() // Only use distict results...
    .subscribe((x) => {
    // Do something each time the price changes
      const mid_price = (x.high_price - ((x.high_price - x.low_price) / 2));
      console.log(new Date(), '-');
      console.log(x, mid_price);
      if (x.mark_price < mid_price) {
        if (BUY_COUNT < BUY_COUNT_LIMIT) {
          console.log('buy!');
        } else {
          console.log('dont buy!');
        }
      } else {
        console.log('sell!');
      }
    }, (e) => {
      console.error(e);
    }, () => console.log('disposed'));

  const portfoliosSubscription = Robinhood.crypto.portfolios.observe(4000)
    .map(quote => quote.results)
    .map((results) => {
      const obj = results[0];
      for (const key in obj) {
        const value = obj[key];
        const nan = Number.isNaN(Number.parseFloat(value));
        console.log(nan);
        obj[key] = ((key.includes('id')) || (key.includes('updated_at'))) ? value : parseFloat(value);
      }
      return obj;
    })
    .distinct() // Only use distict results...
    .subscribe((x) => {
      console.log(x);
    }, (e) => {
      console.error(e);
    }, () => console.log('disposed'));

  setTimeout(() => {
    // Unsubscribe to updates for the data after 10 minutes
    console.log('end');
    quotesSubscription.dispose();
    portfoliosSubscription.dispose();
    process.exit(0);
  }, 60000 * 10);
});
