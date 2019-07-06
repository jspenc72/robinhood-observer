var credentials;

if (process.env.ROBINHOOD_USERNAME) {
  // No need to store credentials in file or code, robinhood_observer will check for env vars if none are provided
  // See docker-compose starter https://github.com/jspenc72/robinhood-observer-starter 
  credentials = null
}else{
  credentials = {
    username: process.env.ROBINHOOD_USERNAME || '',
    password: process.env.ROBINHOOD_PASSWORD || '',
  };
}
var Robinhood = require('../src')(credentials, function(){
  setTimeout(() => {
    var subscription = Robinhood.observeCryptoQuote(["ETC"], 2800)
    .map(quote => quote.results)
    .distinct()                         //Only use distict results...
    .subscribe(x => {
      //Do something each time the price changes
      console.log(new Date(),"-")
      console.log(x);
    }, e => {
      console.error(e)
    }, () => console.log('disposed'));
    setTimeout(function(){
      //Unsubscribe to updates for the data after 10 minutes
      console.log("end")
      subscription.dispose();
    }, 60000*10);
  }, 1000)
  
});