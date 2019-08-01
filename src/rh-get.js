var program = require('commander'); 

program
.command('get <frequency> <symbol> [otherSymbols...]')
.option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
.action((frequency, symbol, otherSymbols) => {
  var Robinhood = require('../src')(null, () => {

  })
})


program.parse(process.argv);

