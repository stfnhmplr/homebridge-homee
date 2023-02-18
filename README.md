# Homebridge-homee

homee platform plugin for homebridge: https://github.com/nfarina/homebridge

## Installation
Follow the instruction in [NPM](https://www.npmjs.com/package/homebridge) for the homebridge server installation. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-homee) and should be installed "globally" by typing:

    sudo npm install -g homebridge-homee

Alternatively you could use [**homeean**](https://himpler.com/homeean) to install homebridge-homee (including Homebridge) on a Raspberry Pi with a plain vanilla Raspbian installation. homeean is a web based buildtool, which generates an individual buildscript (Bash-Script) for user selected Smart Home Tools to be installed on a Raspberry Pi running on Raspbian. homebridge-homee (including its dependecy Homebridge) is provided as an homeean install option.

## Configuration

config.json

Example:

    {
        "bridge": {
            "name": "Homebridge",
            "username": "CC:22:3D:E3:CE:51",
            "port": 51826,
            "pin": "031-45-154"
        },
        "description": "This is an example configuration file for the homebridge-homee plugin",
        "hint": "Always paste into jsonlint.com validation page before starting your homebridge, saves a lot of frustration",
        "platforms": [
            {
                "platform": "homee",
                "name": "homee",
                "host": "192.168.178.1",
                "user": "your-username",
                "pass": "your-password",
                "groupName": "group-name",
                "alarmGroup": "AlarmGroupName",
                "deviceId": "homebridge",
                "disableRGB" : false,
                "disableCT" : false,
                "disableCTforRGB" : false,
                "disableRGBforDevice" : [
                    123,
                    456
                ],
                "disableCTforDevice" : [
                    666,
                    815,
                    4711
                ]
            }
        ]
    }

If you use multiple instances of this plugin with the same homee, you have to specify a custom deviceId.

## Exclude nodes or homeegrams
This plugin integrates all (known) devices to homebridge by default. You can limit the integration to certain devices by creating a group in homee and adding all the devices you want to use with homebridge. If not explicitly specified, the name of this group defaults to 'Homebridge'. It may be changed using the optional 'groupName' statement. Devices outside this group are ignored.

### Device Limit
Homekit cannot manage more than 100 devices per bridge. If you have together more than 100 devices and homeegrams, you have to filter some of them with a group.

## Security System
You can activate a security system. Just create an alarm group in homee and add it to your config file. Possible triggers are e.g. motion detectors, smoke detectors, leak detectors and so on. You can add as many triggers as you like. In combination with the presence status in homee, the selected sensors can trigger an alarm in HomeKit.

 The manipulation alarm of the sensors is also transmitted to HomeKit.

 Since the presence states cannot be matched one to one with homee, the following mapping is carried out:

 | homee  | Homekit  |
 |---|---|
 | Home | Disarmed |
 | Sleeping | Night Armed |
 | Away | Stay Armed |
 | Holiday | Away Armed |

## RGB and Color Temperature Light Sources
While this plugin supports "Lightbulb"-type fixtures with RGB color and/or color temperature controls, the color picker within the Home app has some issues with lights implementing both features at the same time. This behaviour is caused neither by homee nor by the plugin but is a flaw of the app itself. Some third-party apps, such as Eve, show no such erratic behaviour.

Some configuration parameters allow you to precisely control the capabilities of some or all RGB or color temperature lights in HomeKit:
- `"disableRGB" : true` removes the RGB color controls from **all** devices
- `"disableCT" : true` removes the color temperature controls from **all** devices
- `"disableCTforRGB" : true` removes the real color temperature controls from all RGB light fixtures. However, "fake" color temperature controls are still available. By using those controls, HomeKit emulates various color temperatures with the RGB LEDs but does not make any of the additional warm and cold white LEDs your fixture may feature.
- By using the `"disableRGBforDevice"` statement, you may remove the RGB color controls from certain devices by adding their node IDs to the list. To find out the node ID of a device, you may open that device in the homee web application and check the browser address bar afterwards: e.g., `https://my.hom.ee/deviceslist/device/id/331` indicates a node ID of 331.
- Likewise, you may use the `"disableCTforDevice"`statement to disable color temperature controls for specific devices.

## Tested devices
- Danfoss Living connect Thermostat
- Devolo Door/Window Sensor
- Devolo Motion Sensor
- Devolo Heizkörperthermostate
- Devolo Smart Metering Plug
- Everspring AN180 Wall Plug
- Fibaro Door/Window Sensor
- Fibaro Double Switch
- Fibaro Flood Sensor
- Fibaro Motion Sensor
- Fibaro Roller Shutter 2 (FGR-222)
- Fibaro Smoke Sensor 2
- Fibaro Wall Plug
- Greenwave Powernode
- Philips Hue White and Color Ambiance
- Philips Hue White
- Popp Rauchwarnmelder mit Sirene
- Qubino Flush Dimmer
- Sensative Stripes

## Donate
<a href="https://www.buymeacoffee.com/himpler" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
