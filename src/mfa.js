const fs = require('fs');

const file2fa = process.env.ROBINHOOD_MFA_TOKEN_PATH || 'mfa.json';

class MFAService {
  constructor() {
    console.log('MFAService');
  }

  watchFile(callback, timeout) {
    const options = {
      persistent: true,
      interval: 500,
    };
    console.log(`Watching for file changes on ${file2fa}`);
    const timer = setTimeout(() => {
      this.stopWaiting(file2fa);
      callback('Timed out.');
    }, timeout);

    fs.watchFile(file2fa, options, (curr, prev) => {
      console.log(`${file2fa} file Changed`);
      this.onChanged(curr, prev, file2fa, timer, callback);
    });
  }

  stopWaiting(path) {
    fs.unwatchFile(path, this);
  }

  onChanged(current, previous, path, timer, clientCallback) {
    let type = 'File modified.';
    if (current.mode === 0 && previous.mode === 0) type = 'No file.';
    else if (current.mode > 0 && previous.mode === 0) type = 'File created.';
    else if (current.mode === 0 && previous.mode > 0) type = 'File deleted.';

    if (type !== 'No file.') {
      this.stopWaiting(path);
      clearTimeout(timer);
    }
    const mfaJSON = JSON.parse(fs.readFileSync(file2fa, 'utf8'));
    clientCallback(type, current, previous, mfaJSON);
  }
}

module.exports = MFAService;
