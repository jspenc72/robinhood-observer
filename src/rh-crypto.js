var program = require('commander');
 
program
  .command('quote <dir> [otherDirs...]')
  .action((dir, otherDirs) => {
    console.log('quote %s', dir);
    if (otherDirs) {
      otherDirs.forEach(function (oDir) {
        console.log('quote %s', oDir);
      });
    }
  }); 
 
program.parse(process.argv);