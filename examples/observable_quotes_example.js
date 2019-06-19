var credentials = {
    username: '',
    password: '',
};

var Robinhood = require('../src')(credentials, function(){
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
