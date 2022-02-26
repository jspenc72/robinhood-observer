/* eslint-disable */
var RxJS = require('rxjs'),
    Rx = require('rx'),
    Promise = require("bluebird"),
    request = require('request'),
    rp = require('request-promise'),
    _ = require("lodash"),
    fs = require("fs"),
    endpoints = require("./endpoints"),
    headers = require("./headers"),
    Device = require("./device");
const MFAService = require('./mfa');

var _apiUrl = 'https://api.robinhood.com/';
var _clientId = 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS'

class Auth {
  headers = headers
  _request = request.defaults()
  _rp = rp.defaults()
  
	constructor() {
    // Set headers before sending any requests
    this.setHeaders(this.headers)
    // Do auth init and set headers
  }

  init(_private, device) {
    this._private = _private;
    this.device = device;
    return new Promise((resolve, reject) => {
      if(this.device.registered){
        // Load device ID and authenticate?
        console.log("Device previously registered: ", device.path)
        this.headers["X-ROBINHOOD-CHALLENGE-RESPONSE-ID"] = device.challenge.id
        this._build_auth_header(device.access_token);        
        this.setHeaders(this.headers);
        _private.headers = this.headers
        resolve(_private)
      }else{
        this.registerTokenWith(this.device, _private.username, _private.password)
        .then((body) => {

          // If cli
          // Wait for 2fa token

          return this.collect2fa()
          .then(user_input => {
            this.headers["X-ROBINHOOD-CHALLENGE-RESPONSE-ID"] = body.challenge.id
            return this.respond2faChallenge(user_input, body.challenge.id)
          })
        })
        .then((body) => {
            // Check if 2fa succeeded
            if(body.status == "validated"){
              // Device is now registered.

              return this.requestBearerToken(this.device, _private.username, _private.password)
            }else if (body.detail == "Challenge response is invalid."){
              console.log("The 2FA code you entered was incorrect.")
              process.exit(1)
            }else{
              console.log("UNKNOWN CONDITIION")
            }
        })
        .then((body)=> {
          this.device.updateTokens(body)
          this._build_auth_header(device.access_token);        
          this.setHeaders(this.headers);
          _private.headers = this.headers
          resolve(_private)
        })
        .catch(err => {
          console.error(err)
        })        
      }
    })
  }

  get(options, callback){
    if (callback && typeof callback == "function") {
      return this._request.get(options, callback)
    }else{
      return this._rp.get(options)
    }
  }

  post(options, callback){
    if (callback && typeof callback == "function") {
      return this._request.post(options, callback)
    }else{
      return this._rp.post(options)
    }
  }

  setHeaders(headers){
    this._request = request.defaults({
        headers: headers,
        json: true,
        gzip: true
    });

    this._rp = rp.defaults({
        headers: headers,
        json: true,
        gzip: true
    });
  }

  _build_auth_header(token) {
    this.headers.Authorization = 'Bearer ' + token;
  }

  // 1. Generate Device Token
  // var device = new Device()

  // 2. Register Device Token, with User Credentials
  registerTokenWith(device, username, password) {
    return new Promise((resolve, reject) => {
      if(!username || !password){
        reject(new Error("Username or Password is undefined, did you export ROBINHOOD_USERNAME and ROBINHOOD_PASSWORD?"))
      }else{
        this.post(
          {
            uri: _apiUrl + endpoints.login,
            form: {
              grant_type: 'password',
              scope: 'internal',
              client_id: _clientId,
              expires_in: 86400,
              device_token: device.device_token,
              password: password,
              username: username,
              challenge_type: 'sms'
            }
          },
          (err, httpResponse, body) => {
            if (err) {
              reject(err);
            }else if(body.detail == "Request blocked, challenge issued."){
              device.register(body)
              resolve(body)
            }else if(body.mfa_required == true && body.mfa_type == 'sms') {
              console.log('2FA enabled on your account, add mfa token to /path/to/running/directory/2fa.json, with format: {"mfa_code":"YOUR_NUMERIC_MFA_CODE_HERE"}, for example {"mfa_code":"111111"}, then save and close the file')
              var svc = new MFAService()
              svc.watchFile((type, current, previous, two_fa_json)=>{
                console.log(two_fa_json)
                if (type != "Timed out.") {
                  return this.registerTokenWith2FA(this.device, this._private.username, this._private.password, two_fa_json.mfa_code)
                }else{
                  reject(new Error('2FA enabled on your account, timeout occured after 60 seconds for mfa code.'))
                }
              }, 60000)
            } else if(body.detail == "After 5 attempts, you must wait 10 minutes before trying again.") {
              reject(new Error(body.detail+': ' + JSON.stringify(httpResponse)));
            } else if(body.detail == "Unable to log in with provided credentials.") {
              reject(new Error(body.detail+': ' + JSON.stringify(httpResponse)));
            }else if (!body.access_token) {
              reject(new Error('token not found ' + JSON.stringify(httpResponse)));
            } else{
              reject(new Error('token found ' + JSON.stringify(httpResponse)));          
            }
          }
        );
      }
    })
  }
  
  
  // 2.5 Register Device Token, with User Credentials, and MFA Code
  registerTokenWith2FA(device, username, password, mfa_code) {
    return new Promise((resolve, reject) => {
      if(!username || !password){
        reject(new Error("Username or Password is undefined, did you export ROBINHOOD_USERNAME and ROBINHOOD_PASSWORD?"))
      }else{
        this.post(
          {
            uri: _apiUrl + endpoints.login,
            form: {
              device_token: device.device_token,
              client_id: _clientId,
              expires_in: 86400,
              grant_type: 'password',
              scope: 'internal',
              password: password,
              username: username,
              mfa_code: mfa_code
            }
          },
          (err, httpResponse, body) => {
            if (err) {
              reject(err);
            }else if(body.detail == "Request blocked, challenge issued."){
              device.register(body)
              resolve(body)
            }else if(body.mfa_required == true && body.mfa_type == 'sms') {
              console.log(body)
              // reject(new Error('You must disable 2FA on your account for this to work.'))
            } else if(body.detail == "After 5 attempts, you must wait 10 minutes before trying again.") {
              reject(new Error(body.detail+': ' + JSON.stringify(httpResponse)));
            } else if(body.detail == "Unable to log in with provided credentials.") {
              reject(new Error(body.detail+': ' + JSON.stringify(httpResponse)));
            }else if (!body.access_token) {
              reject(new Error('token not found ' + JSON.stringify(httpResponse)));
            } else{
              // This means we can now authenticate
              // Save token
              this.device.registerWithTokens(body)
            }
          }
        );
      }
    })
  }

  // 3. Collect User 2FA code via 2fa.json.

  // 3. Collect User 2FA code via user input.
  collect2fa() {
      process.stdin.setEncoding('utf-8');
      console.log("Enter the 2FA code that was sent to you via sms.");
      return new Promise((resolve, reject) => {

        // When user input data and hit enter key.
        process.stdin.on('data', function (data) {
          if(data){
            resolve(data)          
          }else{
            reject(null)
          }
        });
      })
  }
  // 4. Respond to 2FA challenge with user_input

  respond2faChallenge(user_input, challenge_id) {
    var sixDigits = new RegExp("\\d{6}");
    var self = this
    return new Promise((resolve, reject) => {
      if(sixDigits.test(user_input)){  // validate format of the sms token
        self.post(
          {
            uri: _apiUrl + "challenge/"+ challenge_id+ "/respond/",
            form: { "response" : parseInt(user_input) }
          },
          function (err, httpResponse, body) {
            if (err) {
              reject(err)
              throw err;
            }else{
              if (body.detail == "Challenge response is invalid."){
                reject(new Error("The 2FA code you entered was incorrect."))
              }else{
                resolve(body)
              }
            }
          })
      }else{
        reject(new Error("Invalid User Input: " + user_input))
      }
    });
  }
  // 5. Request Bearer Token

  requestBearerToken(device, username, password) {
    var self = this
    return new Promise(function (resolve, reject) {
      self.post(
        {
          uri: _apiUrl + endpoints.login,
          form: {
            grant_type: 'password',
            scope: 'internal',
            client_id: _clientId,
            expires_in: 86400,
            device_token: device.device_token,
            password: password,
            username: username,
            challenge_type: 'sms'
          }
        },
        function (err, httpResponse, body) {
          if (err) {
            reject(err)
            throw err;
          }else{
            
            resolve(body)
          }
        })    
    })
  }
  signIn () {

  }
  
  signOut () {
  
  }
}
module.exports = Auth;