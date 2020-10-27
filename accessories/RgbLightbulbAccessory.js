const colorsys = require('colorsys');
const ENUMS = require('../lib/enums.js');

let Service;
let Characteristic;

function decimalToHsv(n) {
  const hex = (`000000${n.toString(16)}`).substr(-6);
  return colorsys.hexToHsv(hex);
}

class RgbLightbulbAccessory {
  constructor(name, uuid, node, platform) {
    this.name = name;
    this.uuid = uuid;
    this.nodeId = node.id;
    this.platform = platform;
    this.log = platform.log;
    this.homee = platform.homee;
    this.attributes = {};
    this.cached = false;

    node.attributes.forEach((attribute) => {
      switch (attribute.type) {
        case ENUMS.CAAttributeType.CAAttributeTypeColorTemperature:
          this.attributes.colorTemperature = attribute;
          break;
        case ENUMS.CAAttributeType.CAAttributeTypeColor:
          this.attributes.color = attribute;
          this.hsv = decimalToHsv(attribute.current_value);
          break;
        case ENUMS.CAAttributeType.CAAttributeTypeDimmingLevel:
          this.attributes.brightness = attribute;
          break;
        case ENUMS.CAAttributeType.CAAttributeTypeOnOff:
          this.attributes.onOff = attribute;
          break;
        default:
      }
    });
  }

  setColor() {
    if (!this.cached) return;

    this.cached = false;
    const hex = colorsys.hsvToHex(this.hsv.h, this.hsv.s, this.hsv.v).substr(1, 6);
    const value = parseInt(hex, 16);

    this.log.debug(`Setting ${this.name}s color to ${value} (#${hex})`);
    this.homee.setValue(this.nodeId, this.attributes.color.id, value);
  }

  setHue(value, callback, context) {
    if (context && context === 'ws') {
      callback(null, value);
      return;
    }

    this.log.debug(`setting hue to ${value}`);
    this.hsv.h = value;
    this.setColor();

    callback(null, value);
  }

  setSaturation(value, callback, context) {
    if (context && context === 'ws') {
      callback(null, value);
      return;
    }

    this.log.debug(`setting saturation to ${value}`);
    this.hsv.s = value;
    this.setColor();

    callback(null, value);
  }

  setBrightness(value, callback, context) {
    if (context && context === 'ws') {
      callback(null, value);
      return;
    }

    this.log.debug(`Setting ${this.name} - Brightness to ${value}`);
    this.homee.setValue(this.nodeId, this.attributes.brightness.id, value);

    callback(null, value);
  }

  setColorTemperature(value, callback, context) {
    const kelvin = this.miredToKelvin(value);
    if (context && context === 'ws') {
      callback(null, kelvin);
      return;
    }

    this.log.debug(`Setting ${this.name} - ColorTemperature to ${kelvin}`);
    this.homee.setValue(this.nodeId, this.attributes.colorTemperature.id, kelvin);

    callback(null, value);
  }

  setState(value, callback, context) {
    if (context && context === 'ws') {
      callback(null, value);
      return;
    }

    const newValue = typeof value === 'boolean' ? +value : value;

    this.log.debug(`Setting ${this.name}s state to ${newValue}`);
    this.homee.setValue(this.nodeId, this.attributes.onOff.id, newValue);

    callback(null, newValue);
  }

  updateValue(attribute) {
    switch (attribute.type) {
      case ENUMS.CAAttributeType.CAAttributeTypeColor:
        this.hsv = decimalToHsv(attribute.current_value);
        this.service.getCharacteristic(Characteristic.Hue).updateValue(this.hsv.h, null, 'ws');
        this.service.getCharacteristic(Characteristic.Saturation).updateValue(this.hsv.s, null, 'ws');
        break;
      case ENUMS.CAAttributeType.CAAttributeTypeColorTemperature:
        if (this.kelvinToMired(attribute.current_value)
          !== this.service.getCharacteristic(Characteristic.ColorTemperature).value
          && attribute.current_value === attribute.target_value) {
          this.service.getCharacteristic(Characteristic.ColorTemperature)
            .updateValue(this.kelvinToMired(attribute.current_value), null, 'ws');
          this.log.debug(`${this.name}: ColorTemperature: ${this.kelvinToMired(attribute.current_value)}`);
        }
        break;
      case ENUMS.CAAttributeType.CAAttributeTypeDimmingLevel:
        if (attribute.current_value
          !== this.service.getCharacteristic(Characteristic.Brightness).value
          && attribute.current_value === attribute.target_value) {
          this.service.getCharacteristic(Characteristic.Brightness)
            .updateValue(attribute.current_value, null, 'ws');
          this.log.debug(`${this.name}: Brightness: ${attribute.current_value}`);
        }
        break;
      case ENUMS.CAAttributeType.CAAttributeTypeOnOff:
        if (attribute.current_value !== this.service.getCharacteristic(Characteristic.On).value
          && attribute.current_value === attribute.target_value) {
          this.service.getCharacteristic(Characteristic.On)
            .updateValue(attribute.current_value, null, 'ws');
          this.log.debug(`${this.name}: OnOff: ${attribute.current_value}`);
        }
        break;
      default:
        this.log.debug();
    }
  }

  kelvinToMired(value) {
    const min = this.attributes.colorTemperature.minimum;
    const max = this.attributes.colorTemperature.maximum;

    return Math.round(500 - (value - min) * (360 / (max - min)));
  }

  miredToKelvin(value) {
    const min = this.attributes.colorTemperature.minimum;
    const max = this.attributes.colorTemperature.maximum;

    return Math.round(max - (value - 140) * ((max - min) / 360));
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Homee')
      .setCharacteristic(Characteristic.Model, 'RGB Lightbulb')
      .setCharacteristic(Characteristic.SerialNumber, '');

    this.service = new Service.Lightbulb(this.name);

    this.service.getCharacteristic(Characteristic.On)
      .updateValue(this.attributes.onOff.current_value)
      .on('set', this.setState.bind(this));

    if (this.attributes.brightness) {
      this.service.getCharacteristic(Characteristic.Brightness)
        .updateValue(this.attributes.brightness.current_value)
        .on('set', this.setBrightness.bind(this));
      this.log.debug(`Brightness: ${this.attributes.brightness.current_value}`);
    }

    /*
    if (this.attributes.colorTemperature) {
      this.service.getCharacteristic(Characteristic.ColorTemperature)
        .updateValue(this.kelvinToMired(this.attributes.colorTemperature.current_value))
        .on('set', this.setColorTemperature.bind(this));
      this.log.debug(`ColorTemperature: ${this.attributes.colorTemperature.current_value}`);
    }
    */

    if (this.attributes.color) {
      this.service.getCharacteristic(Characteristic.Hue)
        .updateValue(decimalToHsv(this.attributes.color.current_value).h)
        .on('set', this.setHue.bind(this));
      this.log.debug(`Hue: ${decimalToHsv(this.attributes.color.current_value).h}`);

      this.service.getCharacteristic(Characteristic.Saturation)
        .updateValue(decimalToHsv(this.attributes.color.current_value).s)
        .on('set', this.setSaturation.bind(this));
      this.log.debug(`Saturation: ${decimalToHsv(this.attributes.color.current_value).s}`);
    }

    return [informationService, this.service];
  }
}

module.exports = (oService, oCharacteristic) => {
  Service = oService;
  Characteristic = oCharacteristic;

  return RgbLightbulbAccessory;
};
