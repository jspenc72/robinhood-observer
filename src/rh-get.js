const program = require('commander');

program
  .command('quote <symbol> [otherSymbols...]')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .option('-f --frequency <n>', 'Interval for Request Frequency (milliseconds)', parseInt)
  .action((symbol, otherSymbols) => {
    var Robinhood = require('../src')(null, () => {
      let symbols = [symbol];
      if (otherSymbols.length > 0) {
        symbols = symbols.concat(otherSymbols);
      }
      const frequency = (program.commands[0].frequency || 2000);
      const subscription = Robinhood.observeQuote(symbols, frequency)
        .map((quote) => {
          const parsed = {
            results: [],
            quote,
          };
          quote.results.forEach((quote, index) => {
            for (const key in quote) {
              const value = quote[key];
              quote[key] = ((key.includes('price') && !key.includes('source')) || key.includes('volume') || key.includes('close')) ? parseFloat(value) : value;
            }
            parsed.results.push(quote);
          });
          return parsed;
        })
      // .distinct()                         //Only use distict results...
        .subscribe((x) => {
          switch (program.commands[0].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        }, (e) => {
          console.error(e);
        }, () => console.log('disposed'));
      setTimeout(() => {
      // Unsubscribe to updates for the data after 10 minutes
        subscription.dispose();
      }, 60000 * 10);
    });
  });

program
  .command('account')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol, otherSymbols) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.accounts()
        .then((x) => {
          switch (program.commands[1].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('positions')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol, otherSymbols) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.positions()
        .then((x) => {
          switch (program.commands[2].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('fundamentals <symbol>')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.fundamentals(symbol)
        .then((x) => {
          switch (program.commands[3].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('sp500up')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action(() => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.sp500_up()
        .then((x) => {
          switch (program.commands[4].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('sp500down')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action(() => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.sp500_down()
        .then((x) => {
          switch (program.commands[5].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('watchlists')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action(() => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.watchlists()
        .then((x) => {
          switch (program.commands[6].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('historicals <symbol>')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      const intv = '15second';
      const span = 'hour';
      const bounds = '24_7';
      Robinhood.historicals(symbol, intv, span)
        .then((x) => {
          switch (program.commands[7].output) {
            case 'table':
              console.table([x]);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });


program
  .command('instruments <symbol>')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.instruments(symbol)
        .then((x) => {
          switch (program.commands[8].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('profile')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.investment_profile()
        .then((x) => {
          switch (program.commands[9].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('user')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.user()
        .then((x) => {
          switch (program.commands[10].output) {
            case 'table':
              console.table([x]);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table([x]);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('userBasicInfo')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.userBasicInfo()
        .then((x) => {
          switch (program.commands[11].output) {
            case 'table':
              console.table([x]);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table([x]);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });


program
  .command('userAdditionalInfo')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.userAdditionalInfo()
        .then((x) => {
          switch (program.commands[12].output) {
            case 'table':
              console.table([x]);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table([x]);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('userEmployment')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.userEmployment()
        .then((x) => {
          switch (program.commands[13].output) {
            case 'table':
              console.table([x]);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table([x]);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('userInvestmentProfile')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.userInvestmentProfile()
        .then((x) => {
          switch (program.commands[14].output) {
            case 'table':
              console.table([x]);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table([x]);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('dividends')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.dividends()
        .then((x) => {
          switch (program.commands[15].output) {
            case 'table':
              console.table([x]);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table([x]);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('orders')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.orders()
        .then((x) => {
          switch (program.commands[16].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('news <symbol>')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.news(symbol)
        .then((x) => {
          switch (program.commands[17].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });

program
  .command('markets')
  .option('-o --output <output>', 'Output Format (table|json)', /^(table|json)$/i, 'table')
  .action((symbol) => {
    var Robinhood = require('../src')(null, () => {
      Robinhood.markets(symbol)
        .then((x) => {
          switch (program.commands[18].output) {
            case 'table':
              console.table(x.results);
              break;
            case 'json':
              console.log(x);
              break;
            default:
              console.table(x.results);
          }
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    });
  });


program.parse(process.argv);
