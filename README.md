# homebridge-web-garage

[![npm](https://img.shields.io/npm/v/homebridge-web-garage.svg)](https://www.npmjs.com/package/homebridge-web-garage) [![npm](https://img.shields.io/npm/dt/homebridge-web-garage.svg)](https://www.npmjs.com/package/homebridge-web-garage)

## Description

This [homebridge](https://github.com/nfarina/homebridge) plugin exposes a web-based garage opener to Apple's [HomeKit](http://www.apple.com/ios/home/). Using HTTP requests, you can open/close the garage and update the plugin with the garage's real-time position. The plugin achieves this by setting up a listen server which listens for changes in state from your device and then feeds them real-time into HomeKit.

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
       "apiroute": "http://myurl.com"
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
| `pollInterval` _(optional)_ | Time (in seconds) between device polls | `300` |
| `autoLock` _(optional)_ | Whether your garage should auto-close after being opened | `false` |
| `autoLockDelay` _(optional)_ | Time (in seconds) until your garage will automatically close (if enabled) | `10` |
| `autoReset` _(optional)_ | Whether obstruction detection should automatically change the state back to `0` after being triggered | `false` |
| `autoResetDelay` _(optional)_ | Time (in seconds) until the obstruction detection will automatically reset (if enabled) | `5` |

### Additional options
| Key | Description | Default |
| --- | --- | --- |
| `port` _(optional)_ | Port for your HTTP listener (only one listener per port) | `2000` |
| `timeout` _(optional)_ | Time (in milliseconds) until the accessory will be marked as _Not Responding_ if it is unreachable | `3000` |
| `http_method` _(optional)_ | HTTP method used to communicate with the device | `GET` |
| `username` _(optional)_ | Username if HTTP authentication is enabled | N/A |
| `password` _(optional)_ | Password if HTTP authentication is enabled | N/A |
| `model` _(optional)_ | Appears under the _Model_ field for the accessory | plugin |
| `serial` _(optional)_ | Appears under the _Serial_ field for the accessory | apiroute |
| `manufacturer` _(optional)_ | Appears under the _Manufacturer_ field for the accessory | author |
| `firmware` _(optional)_ | Appears under the _Firmware_ field for the accessory | version |

## API Interfacing

Your API should be able to:

1. Return JSON information when it receives `/status`:
```
{
    "currentDoorState": INT_VALUE,
    "targetDoorState": INT_VALUE
}
```

2. Open/close the garage when it receives:
```
/targetDoorState/INT_VALUE_0_TO_1
```

3. Update `currentDoorState` as it opens/closes by messaging the listen server:
```
/currentDoorState/INT_VALUE_0_TO_3
```

4. Update `targetDoorState` following a manual override by messaging the listen server:
```
/targetDoorState/INT_VALUE_0_TO_1
```

5. Update `obstructionDetected` when an obstruction is detected by messaging the listen server (should notify `0` after obstruction moves unless `autoReset` is enabled):
```
/obstructionDetected/INT_VALUE_0_TO_1
```

## DoorState Key

| Number | Name |
| --- | --- |
| `0` | Open |
| `1` | Closed |
| `2` | Opening |
| `3` | Closing |

