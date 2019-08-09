let credentials;

if (process.env.ROBINHOOD_USERNAME) {
  // No need to store credentials in file or code, robinhood_observer will check for env vars if none are provided
  // See docker-compose starter https://github.com/jspenc72/robinhood-observer-starter
  credentials = null;
} else {
  credentials = {
    username: process.env.ROBINHOOD_USERNAME || '',
    password: process.env.ROBINHOOD_PASSWORD || '',
  };
}

const Robinhood = require('../src')(credentials, () => {
  Robinhood.crypto_init()
    .then(() => Robinhood.crypto_quote(['OMG', 'BTC', 'XRP', 'BTC-USD']))
    .then((success) => {
      console.log(success);
    })
    .catch((err) => {
      console.error(err);
    });
});
