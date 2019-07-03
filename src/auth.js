var RxJS = require('rxjs'),
    Rx = require('rx'),
    Promise = require("bluebird"),
    request = require('request'),
    rp = require('request-promise'),
    _ = require("lodash"),
    fs = require("fs"),
    endpoints = require("./endpoints"),
    headers = require("./headers"),
    Device = require("./device")

var _apiUrl = 'https://api.robinhood.com/';
var _clientId = 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS'

class Auth {
  headers = headers
  _request = request.defaults()
  _rp = rp.defaults()

	constructor() {
    // Do auth init and set headers
    this.setHeaders(this.headers)
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


  // 1. Generate Device Token
  // var device = new Device()

  // 2. Register Device Token, with User Credentials
  registerTokenWith(device, username, password) {
    return new Promise((resolve, reject) => {
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
        function (err, httpResponse, body) {
          if (err) {
            reject(err);
          }else if(body.detail == "Request blocked, challenge issued."){
            device.register(body)
            resolve(body)
          }else if(body.mfa_required == true && body.mfa_type == 'sms') {
            reject(new Error('You must disable 2FA on your account for this to work.'))
          } else if(body.detail == "Unable to log in with provided credentials.") {
            reject(new Error(body.detail+': ' + JSON.stringify(httpResponse)));
          }else if (!body.access_token) {
            reject(new Error('token not found ' + JSON.stringify(httpResponse)));
          } else{
            reject(new Error('token found ' + JSON.stringify(httpResponse)));          
          }
        }
      );
    })
  }

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