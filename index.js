var Service, Characteristic
const packageJson = require('./package.json')
const request = require('request')
const ip = require('ip')
const http = require('http')

module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-web-garage', 'GarageDoorOpener', GarageDoorOpener)
}

function GarageDoorOpener (log, config) {
  this.log = log

  this.name = config.name
  this.apiroute = config.apiroute
  this.pollInterval = config.pollInterval || 300

  this.port = config.port || 2000
  this.requestArray = ['targetDoorState', 'currentDoorState', 'obstructionDetected']

  this.autoLock = config.autoLock || false
  this.autoLockDelay = config.autoLockDelay || 10

  this.autoReset = config.autoReset || false
  this.autoResetDelay = config.autoResetDelay || 5

  this.manufacturer = config.manufacturer || packageJson.author.name
  this.serial = config.serial || packageJson.version
  this.model = config.model || packageJson.name
  this.firmware = config.firmware || packageJson.version

  this.username = config.username || null
  this.password = config.password || null
  this.timeout = config.timeout || 3000
  this.http_method = config.http_method || 'GET'

  if (this.username != null && this.password != null) {
    this.auth = {
      user: this.username,
      pass: this.password
    }
  }

  this.server = http.createServer(function (request, response) {
    var parts = request.url.split('/')
    var partOne = parts[parts.length - 2]
    var partTwo = parts[parts.length - 1]
    if (parts.length === 3 && this.requestArray.includes(partOne) && partTwo.length === 1) {
      this.log('Handling request: %s', request.url)
      response.end('Handling request')
      this._httpHandler(partOne, partTwo)
    } else {
      this.log.warn('Invalid request: %s', request.url)
      response.end('Invalid request')
    }
  }.bind(this))

  this.server.listen(this.port, function () {
    this.log('Listen server: http://%s:%s', ip.address(), this.port)
  }.bind(this))

  this.service = new Service.GarageDoorOpener(this.name)
}

GarageDoorOpener.prototype = {

  identify: function (callback) {
    this.log('Identify requested!')
    callback()
  },

  _getStatus: function (callback) {
    var url = this.apiroute + '/status'
    this.log.debug('Getting status: %s', url)
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
      if (error) {
        this.log.warn('Error getting status: %s', error.message)
        this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(new Error('Error getting status'))
        this.retryStatus()
        callback(error)
      } else {
        this.log.debug('Device response: %s', responseBody)
        var json = JSON.parse(responseBody)
        this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(json.currentDoorState)
        this.log('Updated currentDoorState to: %s', json.currentDoorState)
        this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(json.targetDoorState)
        this.log('Updated targetDoorState to: %s', json.targetDoorState)
        this.service.getCharacteristic(Characteristic.ObstructionDetected).updateValue(0)
        callback()
      }
    }.bind(this))
  },

  _httpHandler: function (characteristic, value) {
    switch (characteristic) {
      case 'currentDoorState':
        this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(value)
        this.log('Updated %s to: %s', characteristic, value)
        break
      case 'targetDoorState':
        this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(value)
        this.log('Updated %s to: %s', characteristic, value)
        if (parseInt(value) === 0 && this.autoLock) {
          this.autoLockFunction()
        }
        break
      case 'obstructionDetected':
        this.service.getCharacteristic(Characteristic.ObstructionDetected).updateValue(value)
        this.log('Updated %s to: %s', characteristic, value)
        if (parseInt(value) === 1 && this.autoReset) {
          this.autoResetFunction()
        }
        break
      default:
        this.log.warn('Unknown characteristic "%s" with value "%s"', characteristic, value)
    }
  },

  _httpRequest: function (url, body, method, callback) {
    request({
      url: url,
      body: body,
      method: this.http_method,
      timeout: this.timeout,
      rejectUnauthorized: false,
      auth: this.auth
    },
    function (error, response, body) {
      callback(error, response, body)
    })
  },

  setTargetDoorState: function (value, callback) {
    var url = this.apiroute + '/setTargetDoorState/' + value
    this.log.debug('Setting targetDoorState: %s', url)
    this._httpRequest(url, '', this.http_method, function (error, response, responseBody) {
      if (error) {
        this.log.warn('Error setting targetDoorState: %s', error.message)
        callback(error)
      } else {
        this.log('Set targetDoorState to: %s', value)
        if (value === 0 && this.autoLock) {
          this.autoLockFunction()
        }
        callback()
      }
    }.bind(this))
  },

  autoLockFunction: function () {
    this.log('Waiting %s seconds for autolock', this.autoLockDelay)
    setTimeout(() => {
      this.service.setCharacteristic(Characteristic.TargetDoorState, 1)
      this.log('Autolocking...')
    }, this.autoLockDelay * 1000)
  },

  autoResetFunction: function () {
    this.log('Waiting %s seconds to autoreset obstruction detection', this.autoResetDelay)
    setTimeout(() => {
      this.service.getCharacteristic(Characteristic.ObstructionDetected).updateValue(0)
      this.log('Autoreset obstruction detection')
    }, this.autoResetDelay * 1000)
  },

  getServices: function () {
    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial)
      .setCharacteristic(Characteristic.FirmwareRevision, this.firmware)

    this.service
      .getCharacteristic(Characteristic.TargetDoorState)
      .on('set', this.setTargetDoorState.bind(this))

    this._getStatus(function () {})

    setInterval(function () {
      this._getStatus(function () {})
    }.bind(this), this.pollInterval * 1000)

    return [this.informationService, this.service]
  }
}
