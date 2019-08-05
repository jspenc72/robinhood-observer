var program = require('commander'); 

program
.command('quote <symbol> [otherSymbols...]')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action((symbol, otherSymbols) => {
  var Robinhood = require('../src')(null, () => {
    console.log("test", symbol, otherSymbols)

    var symbols = [symbol]
    if (otherSymbols.length>0) {
      symbols = symbols.concat(otherSymbols)
    }    

    var subscription = Robinhood.observeQuote(symbols)
    .map(quote => quote.results)
    .distinct()                         //Only use distict results...
    .subscribe(x => {
      switch (program.commands[0].output) {
        case 'table':
          console.table(x)
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

