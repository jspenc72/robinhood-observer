var program = require('commander'); 
var ON_DEATH = require('death');
const cTable = require('console.table');
var Robinhood = require('../src')(null, function(){

  program
  .command('quote <frequency> <symbol> [otherSymbols...]')
  .action((frequency, symbol, otherSymbols) => {

    var symbols = [symbol]
    if (otherSymbols.length>0) {
      symbols = symbols.concat(otherSymbols)
    }
    var quotesSubscription = Robinhood.crypto.quotes.observe(symbols, frequency)
    .map(quote => quote.results)
    .map(results => {
      var parsed = []
      results.forEach((quote, index) => {
        for (const key in quote) {
          let value = quote[key];
          quote[key] = (key.includes("price") || key.includes("volume")) ? parseFloat(value) : value 
        }  
        parsed.push(quote)
      })
      
      return parsed
    })    
    .distinct() //Only use distict results...
    .subscribe(x => {
      //Do something each time the price changes
      console.table(x)
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
  program.parse(process.argv);

  // END Robinhood
});


