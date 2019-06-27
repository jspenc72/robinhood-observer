var RxJS = require('rxjs'),
    Rx = require('rx'),
    Promise = require("bluebird"),
    request = require('request'),
    rp = require('request-promise'),
    _ = require("lodash");
    fs = require("fs");


class Device {
  device_token = "";
  access_token = "";
  refresh_token = "";
  challenge = {};
  registered = false;
  path = 'device.json';
	constructor(path) {
    path ? this.path = path : null
    if(this.isCached()){
      var cache = this.readCachedDevice()
      Object.assign(this, JSON.parse(cache))
    }else{
      this.generateToken() 
      this.cacheDevice()
    }
  }
  
  register(body) {
    this.challenge = body.challenge
    this.registered = true
    this.cacheDevice()
  }

  updateTokens(body) {
    this.access_token = body.access_token
    this.refresh_token = body.refresh_token
    this.cacheDevice()
  }

  generateToken() {
    const rands = [];
    for (let i = 0; i < 16; i++) {
      const r = Math.random();
      const rand = 4294967296.0 * r;
      rands.push(
        (rand >> ((3 & i) << 3)) & 255
      );
    }
  
    let id = '';
    const hex = [];
    for (let i = 0; i < 256; ++i) {
      hex.push(Number(i + 256).toString(16).substring(1));
    }
  
    for (let i = 0; i < 16; i++) {
      id += hex[rands[i]];
      if (i == 3 || i == 5 || i == 7 || i == 9) {
        id += "-";
      }
    }
    this.device_token = id;
    return id;
  }


  isCached() {
    try {
      return fs.existsSync(this.path)
    } catch(err) {
      console.error(err)
      return false
    }
  }

  readCachedDevice() {
    return fs.readFileSync(this.path, 'utf8');
  }

  cacheDevice() {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, JSON.stringify(this), (err) => {
          if (err) {
              reject(err)
              throw err
          }else{
              resolve({status: "success"})
          }
      });
    })
  }
}

module.exports = Device