var program = require('commander'); 

program
.command('quote <symbol> [otherSymbols...]')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.option('-f --frequency <n>', 'Interval for Request Frequency (milliseconds)', parseInt)
.action((symbol, otherSymbols) => {
  var Robinhood = require('../src')(null, () => {

    var symbols = [symbol]
    if (otherSymbols.length>0) {
      symbols = symbols.concat(otherSymbols)
    }    
    var frequency = (program.commands[0].frequency || 2000)
    var subscription = Robinhood.observeQuote(symbols, frequency)
    .map(quote => {
      var parsed = {
        results: [],
        quote: quote
      }
      quote.results.forEach((quote, index) => {
        for (const key in quote) {
          let value = quote[key];
          quote[key] = ((key.includes("price") && !key.includes("source")) || key.includes("volume") || key.includes("close")) ? parseFloat(value) : value 
        }  
        parsed.results.push(quote)
      })
      return parsed
    }) 
    // .distinct()                         //Only use distict results...
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
    setTimeout(function(){
      //Unsubscribe to updates for the data after 10 minutes
      subscription.dispose();
    }, 60000*10);
  })
})

program.parse(process.argv);

