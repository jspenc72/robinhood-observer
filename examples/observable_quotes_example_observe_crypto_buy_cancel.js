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

BUY_COUNT_LIMIT = 2
BUY_COUNT = 0
var buyOrder = {
  type: 'limit',
  side: "buy",
  quantity: "1.000",
  price: 7.80,
  time_in_force: "gtc"
}

var Robinhood = require('../src')(credentials, function(){

  var subscription = Robinhood.crypto.quotes.observe(["ETC"], 2000)
  .map(quote => quote.results)
  .map(results => {
    const obj = results[0]
    for (const key in obj) {
      let value = obj[key];
      obj[key] = (key.includes("price") || key.includes("volume")) ? parseFloat(value) : value 
    }
    return obj
  })
  .distinct() //Only use distict results...
  .subscribe(x => {
    //Do something each time the price changes
    console.log(new Date(),"-")
    console.log(x);
    if(x.mark_price < 7.815){
      if(BUY_COUNT<BUY_COUNT_LIMIT){
        BUY_COUNT = BUY_COUNT+1
        buyOrder.currency_pair_id = x.id;
        buyOrder.price = x.mark_price - 0.01
        
        // console.log(Robinhood.crypto)
        Robinhood.crypto.orders.create(buyOrder)
        .then(success => {
          console.log("after create()", success)
          return Robinhood.crypto.orders.cancel(success.id)
        })
        .then(success => {
          console.log("after cancel()", success)
        })
        .catch(err => {
          console.error("error create()", err)
        })
        console.log("buy!")
      }else{
        console.log("dont buy!")
      }

    }else{
      console.log("sell!")
    }
  }, e => {
    console.error(e)
  }, () => console.log('disposed'));
  setTimeout(function(){
    //Unsubscribe to updates for the data after 10 minutes
    console.log("end")
    subscription.dispose();
  }, 60000*10);

});