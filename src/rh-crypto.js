var program = require('commander'); 
var ON_DEATH = require('death');
const cTable = require('console.table');

program
.command('quote <frequency> <symbol> [otherSymbols...]')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action((frequency, symbol, otherSymbols) => {
  var Robinhood = require('../src')(null, function(){

    var symbols = [symbol]
    if (otherSymbols.length>0) {
      symbols = symbols.concat(otherSymbols)
    }
    var quotesSubscription = Robinhood.crypto.quotes.observe(symbols, frequency)
    .map(quote => {
      var parsed = {
        results: [],
        quote: quote
      }
      quote.results.forEach((quote, index) => {
        for (const key in quote) {
          let value = quote[key];
          quote[key] = (key.includes("price") || key.includes("volume")) ? parseFloat(value) : value 
        }  
        parsed.results.push(quote)
      })
      return parsed
    })    
    .distinct() //Only use distict results...
    .subscribe(x => {
      switch (program.commands[0].output) {
        case 'table':
          console.table(x.results)
          break;
        case 'json':
          console.log(x)
          break;
        default:
          console.table(x)
      }
    }, e => {
      console.error(e)
    }, () => console.log('disposed'));

    ON_DEATH(function(signal, err) {
      //clean up code here
      if(err){
        console.error(err)
      }
      // console.log(signal)
      quotesSubscription.dispose();
      setTimeout(() => {
        process.exit(0)
      },1000)
    })

  });
  // END Robinhood
});


program
.command('create <symbol> <type> <side> <quantity> <price>')
.action((symbol, type, side, quantity, price) => {
  console.log(symbol, type, side, quantity, price)
  var Robinhood = require('../src')(null, function(){

    // var createOrder = {
    //   type: 'limit',
    //   side: "buy",
    //   quantity: "1.000",
    //   price: 7.80,
    //   time_in_force: "gtc"
    // }

    var createOrder = {
      type: type,
      side: side,
      quantity: quantity,
      price: price,
      time_in_force: "gtc"
    }

    Robinhood.crypto.orders.create(createOrder)
    .then(success => {
      console.log("after create()", success)
      process.exit(0)
    })
    .catch(err => {
      console.error("error create()", err)
      process.exit(1)
    })
    
  });
  // END Robinhood
});


program
.command('cancel <orderId>')
.action((orderId) => {
  console.log(orderId)
  var Robinhood = require('../src')(null, function(){
    Robinhood.crypto.orders.cancel(orderId)
    .then(success => {
      console.log("after create()", success)
      process.exit(0)
    })
    .catch(err => {
      console.error("error create()", err)
      process.exit(1)
    })
    
  });
  // END Robinhood
});




program.parse(process.argv);

