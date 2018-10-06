const colorsys = require('colorsys')
const ENUMS = require('../lib/enums.js');

let Service, Characteristic;

class RgbLightbulbAccessory {

    constructor(name, uuid, node, platform) {
        this.name = name;
        this.uuid = uuid;
        this.nodeId = node.id;
        this.platform = platform
        this.log = platform.log;
        this.homee = platform.homee;
        this.attributes = {};

        for (let attribute of node.attributes) {
            switch (attribute.type) {
                case ENUMS.CAAttributeType.CAAttributeTypeColorTemperature:
                    this.attributes.colorTemperature = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeColor:
                    this.attributes.color = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeDimmingLevel:
                    this.attributes.brightness = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeOnOff:
                    this.attributes.onOff = attribute;
                    break;
            }
        }
        this.log.debug(this.attributes.color.current_value);
        this.hsv = this._decimalToHsv(this.attributes.color.current_value);
    }

    _decimalToHsv(n) {
        const hex = ('000000' + n.toString(16)).substr(-6);
        return colorsys.hexToHsv(hex);
    }

    _setColor() {
        const hex = colorsys.hsvToHex(this.hsv.h, this.hsv.s, this.hsv.v).substr(1,6)
        const value = parseInt(hex, 16)

        this.log.debug(`Setting ${this.name}s Color to ${value} (#${hex})`)
        this.homee.setValue(this.nodeId, this.attributes.color.id, value)

        return value;
    }

    setHue(value, callback, context) {
        if (context && context == 'ws') {
            callback(null, value);
            return;
        }

        this.log.debug(`setting hue to ${value}`)
        this.hsv.h = value;
        this._setColor();

        callback(null, value);
    }

    setSaturation(value, callback, context) {
        if (context && context == 'ws') {
            callback(null, value);
            return;
        }

        this.log.debug(`setting saturation to ${value}`)
        this.hsv.s = value;
        this._setColor()

        callback(null, value);
    }

    setBrightness(value, callback, context) {
        if (context && context == 'ws') {
            callback(null, value);
            return;
        }

        this.log.debug(`Setting ${this.name} - Brightness to ${value}`);
        this.homee.setValue(this.nodeId, this.attributes.brightness.id, value);

        callback(null, value);
    }

    setColorTemperature(value, callback, context) {
        value = this._miredToKelvin(value)

        this.log.debug(`Setting ${this.name} - ColorTemperature to ${value}`);
        this.homee.setValue(this.nodeId, this.attributes.colorTemperature.id, value);

        callback(null, value);
    }

    setState(value, callback, context) {
        if (context && context == 'ws') {
            callback(null, value);
            return;
        }

        if (value === true) value = 1;
        if (value === false) value = 0;

        this.log.debug(`Setting ${this.name}s state to ${value}`);
        this.homee.setValue(this.nodeId, this.attributes.onOff.id, value);

        callback(null, value);
    }

    updateValue(attribute) {
        switch (attribute.type) {
            case ENUMS.CAAttributeType.CAAttributeTypeColor:
                this.hsv = this._decimalToHsv(attribute.current_value);
                this.service.getCharacteristic(Characteristic.Hue)
                    .updateValue(this.hsv.h, null, 'ws');
                this.service.getCharacteristic(Characteristic.Saturation)
                    .updateValue(this.hsv.s, null, 'ws');
                this.log.debug(`${this.name}: Color: ${JSON.stringify(this.hsv)}`);
                break;
            case ENUMS.CAAttributeType.CAAttributeTypeColorTemperature:
                if (this._kelvinToMired(attribute.current_value)
                    != this.service.getCharacteristic(Characteristic.ColorTemperature).value
                    && attribute.current_value == attribute.target_value) {
                    this.service.getCharacteristic(Characteristic.ColorTemperature)
                        .updateValue(this._kelvinToMired(attribute.current_value), null, 'ws');
                    this.log.debug(`${this.name}: ColorTemperature: ${this._kelvinToMired(attribute.current_value)}`);
                }
                break;
            case ENUMS.CAAttributeType.CAAttributeTypeDimmingLevel:
                if (attribute.current_value != this.service.getCharacteristic(Characteristic.Brightness).value
                    && attribute.current_value == attribute.target_value) {
                    this.service.getCharacteristic(Characteristic.Brightness)
                        .updateValue(attribute.current_value, null, 'ws');
                    this.log.debug(`${this.name}: Brightness: ${attribute.current_value}`);
                }
                break;
            case ENUMS.CAAttributeType.CAAttributeTypeOnOff:
                if (attribute.current_value != this.service.getCharacteristic(Characteristic.On).value
                    && attribute.current_value == attribute.target_value) {
                    this.service.getCharacteristic(Characteristic.On)
                        .updateValue(attribute.current_value, null, 'ws');
                    this.log.debug(`${this.name}: OnOff: ${attribute.current_value}`);
                }
                break;
        }
    }

    _kelvinToMired(value) {
        const min = this.attributes.colorTemperature.minimum,
            max = this.attributes.colorTemperature.maximum

        return Math.round(500 - (value - min) * 360 / (max - min))
    }

    _miredToKelvin(value) {
        const min = this.attributes.colorTemperature.minimum,
            max = this.attributes.colorTemperature.maximum

        return Math.round(max - (value - 140) * (max - min) / 360)
    }

    getServices() {
        let informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Homee")
            .setCharacteristic(Characteristic.Model, "RGB Lightbulb")
            .setCharacteristic(Characteristic.SerialNumber, "");

        this.service = new Service.Lightbulb(this.name);

        if (this.attributes.brightness) {
            this.service.getCharacteristic(Characteristic.Brightness)
                .updateValue(this.attributes.brightness.current_value)
                .on('set', this.setBrightness.bind(this));
            this.log.debug(`Brightness: ${this.attributes.brightness.current_value}`);
        }

        if (this.attributes.colorTemperature) {
            this.service.getCharacteristic(Characteristic.ColorTemperature)
                .updateValue(this._kelvinToMired(this.attributes.colorTemperature.current_value))
                .on('set', this.setColorTemperature.bind(this));
            this.log.debug(`ColorTemperature: ${this.attributes.colorTemperature.current_value}`);
        }

        if (this.attributes.color) {
            this.service.getCharacteristic(Characteristic.Hue)
                .updateValue(this._decimalToHsv(this.attributes.color.current_value).h)
                .on('set', this.setHue.bind(this));
            this.log.debug(`Hue: ${this._decimalToHsv(this.attributes.color.current_value).h}`);

            this.service.getCharacteristic(Characteristic.Saturation)
                .updateValue(this._decimalToHsv(this.attributes.color.current_value).s)
                .on('set', this.setSaturation.bind(this));
            this.log.debug(`Saturation: ${this._decimalToHsv(this.attributes.color.current_value).s}`);
        }

        return [informationService, this.service];
    }
}

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return RgbLightbulbAccessory;
};
