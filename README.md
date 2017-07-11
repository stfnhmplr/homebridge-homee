** work in progress **

# Homebridge-Homee

[![Package Quality](http://npm.packagequality.com/shield/homebridge-homee.svg)](http://packagequality.com/#?package=homebridge-homee)

Homee platform plugin for homebridge: https://github.com/nfarina/homebridge

## Installation
Follow the instruction in [NPM](https://www.npmjs.com/package/homebridge) for the homebridge server installation. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-homee) and should be installed "globally" by typing:

    sudo npm install -g homebridge-homee

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
                "platform": "Homee",
                "name": "Homee",
                "host": "192.168.178.1",
                "user": "your-username",
                "pass": "your-password"
            }
        ]
    }


## tested devices
- Devolo Window/Door Sensor
- Danfoss Living connect Thermostat
- Fibaro Motion Sensor
- Fibaro Door/Window Sensor
