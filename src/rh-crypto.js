const program = require('commander');
const ON_DEATH = require('death');
/* eslint-disable no-unused-vars */
const cTable = require('console.table');
/* eslint-enable no-unused-vars */
const src = require('../src');

program
  .command('quote <symbol> [otherSymbols...]')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .option('-f --frequency <n>', 'Interval for Request Frequency (milliseconds)', parseInt)
  .action((symbol, otherSymbols) => {
    const Robinhood = src(null, () => {
      let symbols = [symbol];
      if (otherSymbols.length > 0) {
        symbols = symbols.concat(otherSymbols);
      }
      const frequency = (program.commands[0].frequency || 2000);
      const quotesSubscription = Robinhood.crypto.quotes.observe(symbols, frequency)
        .map((quote) => {
          const parsed = {
            results: [],
            quote,
          };
          quote.results.forEach((_quote) => {
            const q = _quote;
            Object.keys(q).forEach((key) => {
              const value = q[key];
              q[key] = (key.includes('price') || key.includes('volume')) ? parseFloat(value) : value;
            });
            parsed.results.push(q);
          });
          return parsed;
        })
        .distinct() // Only use distict results...
        .subscribe((x) => {
          switch (program.commands[0].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x);
          }
        }, (e) => {
          console.error(e);
        }, () => console.log('disposed'));

      ON_DEATH((signal, err) => {
      // clean up code here
        if (err) {
          console.error(err);
        }
        // console.log(signal)
        quotesSubscription.dispose();
        setTimeout(() => {
          process.exit(0);
        }, 1000);
      });
    });
  // END Robinhood
  });


program
  .command('create <symbol> <type> <side> <quantity> <price>')
  .action((symbol, type, side, quantity, price) => {
    console.log(symbol, type, side, quantity, price);
    const Robinhood = src(null, () => {
      const createOrder = {
        type,
        side,
        quantity,
        price,
        time_in_force: 'gtc',
      };

      Robinhood.crypto.orders.create(createOrder)
        .then((success) => {
          console.log('after create()', success);
          process.exit(0);
        })
        .catch((err) => {
          console.error('error create()', err);
          process.exit(1);
        });
    });
  // END Robinhood
  });


program
  .command('cancel <orderId>')
  .action((orderId) => {
    console.log(orderId);
    const Robinhood = src(null, () => {
      Robinhood.crypto.orders.cancel(orderId)
        .then((success) => {
          console.log('after create()', success);
          process.exit(0);
        })
        .catch((err) => {
          console.error('error create()', err);
          process.exit(1);
        });
    });
  // END Robinhood
  });


program.parse(process.argv);
