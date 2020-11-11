const ENUMS = require('../lib/enums.js');

let Service; let
  Characteristic;

class WindowCoveringAccessory {
  constructor(name, uuid, profile, node, platform) {
    this.name = name;
    this.uuid = uuid;
    this.platform = platform;
    this.homee = platform.homee;
    this.log = platform.log;
    this.nodeId = node.id;
    this.profile = profile;
    this.attributes = {};
    this.positions = [2, 2, 2, 1, 0];

    node.attributes.forEach((attribute) => {
      if (attribute.type === ENUMS.CAAttributeType.CAAttributeTypePosition) {
        this.attributes.position = attribute;
      } else if (attribute.type === ENUMS.CAAttributeType.CAAttributeTypeUpDown) {
        this.attributes.upDown = attribute;
      }
    });
  }

  /**
     * update attributes value
     * @param attribute
     */
  updateValue(attribute) {
    const currentPosition = this.service.getCharacteristic(Characteristic.CurrentPosition);
    const targetPosition = this.service.getCharacteristic(Characteristic.TargetPosition);
    const positionState = this.service.getCharacteristic(Characteristic.PositionState);

    if (attribute.type === ENUMS.CAAttributeType.CAAttributeTypePosition) {
      if (attribute.current_value !== 100 - currentPosition.value
        && attribute.current_value === attribute.target_value) {
        currentPosition.updateValue(100 - attribute.current_value, null, 'ws');
        this.log.debug(`${this.name}: CurrentPosition:${attribute.current_value}`);
      }

      if (attribute.target_value !== 100 - targetPosition.value) {
        targetPosition.updateValue(100 - attribute.target_value, null, 'ws');
        this.log.debug(`${this.name}: TargetPosition:${attribute.target_value}`);
      } else if (attribute.type === ENUMS.CAAttributeType.CAAttributeTypeUpDown) positionState.updateValue(this.positions[attribute.current_value], null, 'ws');
      this.log.debug(`${this.name}: PositionState:${attribute.current_value}`);
    }
  }

  setTargetPosition(value, callback, context) {
    if (context && context === 'ws') {
      callback(null, value);
      return;
    }

    const newValue = 100 - value;

    this.log.debug(`Setting ${this.name} to ${newValue}`);
    this.homee.setValue(this.nodeId, this.attributes.position.id, newValue);
    callback(null, value);
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'homee')
      .setCharacteristic(Characteristic.Model, 'WindowCovering')
      .setCharacteristic(Characteristic.SerialNumber, '');

    this.service = new Service.WindowCovering(this.name);

    this.service.getCharacteristic(Characteristic.CurrentPosition)
      .updateValue(100 - this.attributes.position.current_value);
    this.log.debug(`CurrentPosition: ${100 - this.attributes.position.current_value}`);

    this.service.getCharacteristic(Characteristic.TargetPosition)
      .updateValue(100 - this.attributes.position.target_value)
      .on('set', this.setTargetPosition.bind(this));
    this.log.debug(`TargetPosition: ${100 - this.attributes.position.target_value}`);

    this.service.getCharacteristic(Characteristic.PositionState)
      .updateValue(this.positions[this.attributes.upDown.current_value]);
    this.log.debug(`PositionState: ${this.positions[this.attributes.upDown.current_value]}`);

    return [informationService, this.service];
  }
}

module.exports = (oService, oCharacteristic) => {
  Service = oService;
  Characteristic = oCharacteristic;

  return WindowCoveringAccessory;
};
