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

program
.command('account')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action((symbol, otherSymbols) => {
  var Robinhood = require('../src')(null, () => {
    Robinhood.accounts()
    .then(x => {
      switch (program.commands[1].output) {
        case 'table':
          console.table(x.results)
          break;
        case 'json':
          console.log(x)
          break;
        default:
          console.table(x)
      }      
    })
    .catch(err => {
      console.error(err)
      throw err
    })
  })
})

program
.command('positions')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action((symbol, otherSymbols) => {
  var Robinhood = require('../src')(null, () => {

    Robinhood.positions()
    .then(x => {
      switch (program.commands[2].output) {
        case 'table':
          console.table(x.results)
          break;
        case 'json':
          console.log(x)
          break;
        default:
          console.table(x)
      }      
    })
    .catch(err => {
      console.error(err)
      throw err
    })
  })
})

program
.command('fundamentals <symbol>')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action((symbol) => {
  var Robinhood = require('../src')(null, () => {
    Robinhood.fundamentals(symbol)
    .then(x => {
      switch (program.commands[3].output) {
        case 'table':
          console.table(x.results)
          break;
        case 'json':
          console.log(x)
          break;
        default:
          console.table(x)
      }      
    })
    .catch(err => {
      console.error(err)
      throw err
    })
  })
})

program
.command('sp500up')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action(() => {
  var Robinhood = require('../src')(null, () => {

    Robinhood.sp500_up()
    .then(x => {
      switch (program.commands[4].output) {
        case 'table':
          console.table(x.results)
          break;
        case 'json':
          console.log(x)
          break;
        default:
          console.table(x)
      }      
    })
    .catch(err => {
      console.error(err)
      throw err
    })
  })
})

program
.command('sp500down')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action(() => {
  var Robinhood = require('../src')(null, () => {

    Robinhood.sp500_down()
    .then(x => {
      switch (program.commands[5].output) {
        case 'table':
          console.table(x.results)
          break;
        case 'json':
          console.log(x)
          break;
        default:
          console.table(x)
      }      
    })
    .catch(err => {
      console.error(err)
      throw err
    })
  })
})

program
.command('watchlists')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action(() => {
  var Robinhood = require('../src')(null, () => {

    Robinhood.watchlists()
    .then(x => {
      switch (program.commands[6].output) {
        case 'table':
          console.table(x.results)
          break;
        case 'json':
          console.log(x)
          break;
        default:
          console.table(x)
      }      
    })
    .catch(err => {
      console.error(err)
      throw err
    })
  })
})

program
.command('historicals <symbol>')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action((symbol) => {
  var Robinhood = require('../src')(null, () => {
    
    var intv = "15second"
    var span = "hour"
    var bounds="24_7"
    Robinhood.historicals(symbol, intv, span)
    .then(x => {
      switch (program.commands[7].output) {
        case 'table':
          console.table(x.results)
          break;
        case 'json':
          console.log(x)
          break;
        default:
          console.table(x)
      }      
    })
    .catch(err => {
      console.error(err)
      throw err
    })
  })
})


program.parse(process.argv);

