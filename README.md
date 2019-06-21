# homebridge-web-garage

[![npm](https://img.shields.io/npm/v/homebridge-web-garage.svg)](https://www.npmjs.com/package/homebridge-web-garage) [![npm](https://img.shields.io/npm/dt/homebridge-web-garage.svg)](https://www.npmjs.com/package/homebridge-web-garage)

## Description

This [homebridge](https://github.com/nfarina/homebridge) plugin exposes a web-based garage opener to Apple's [HomeKit](http://www.apple.com/ios/home/). Using HTTP requests, you can open/close the garage and update the plugin with the garage's real-time position.

## Installation

1. Install [homebridge](https://github.com/nfarina/homebridge#installation-details)
2. Install this plugin: `npm install -g homebridge-web-garage`
3. Update your `config.json`

## Configuration

```json
"accessories": [
     {
       "accessory": "GarageDoorOpener",
       "name": "Garage",
       "openURL": "http://myurl.com"
     }
]
```

### Core
| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Must be `GarageDoorOpener` | N/A |
| `name` | Name to appear in the Home app | N/A |
| `apiroute` | Root URL of your device | N/A |

### Optional fields
| Key | Description | Default |
| --- | --- | --- |
| `autoLock` _(optional)_ | Whether your garage should auto-close after being opened | `false` |
| `autoLockDelay` _(optional)_ | Time (in seconds) until your garage will automatically close (if enabled) | `10` |

### Additional options
| Key | Description | Default |
| --- | --- | --- |
| `port` _(optional)_ | Port for your http listener | `2000` |
| `timeout` _(optional)_ | Time (in milliseconds) until the accessory will be marked as _Not Responding_ if it is unreachable | `3000` |
| `http_method` _(optional)_ | HTTP method used to communicate with the device | `GET` |
| `username` _(optional)_ | Username if HTTP authentication is enabled | N/A |
| `password` _(optional)_ | Password if HTTP authentication is enabled | N/A |
| `model` _(optional)_ | Appears under the _Model_ field for the accessory | plugin |
| `serial` _(optional)_ | Appears under the _Serial_ field for the accessory | apiroute |
| `manufacturer` _(optional)_ | Appears under the _Manufacturer_ field for the accessory | author |
| `firmware` _(optional)_ | Appears under the _Firmware_ field for the accessory | version |

## API Interfacing
