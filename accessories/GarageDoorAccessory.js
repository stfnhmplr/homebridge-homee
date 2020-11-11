const ENUMS = require('../lib/enums.js');

let Service; let
  Characteristic;

class GarageDoorAccessory {
  constructor(name, uuid, node, platform) {
    this.name = name;
    this.uuid = uuid;
    this.platform = platform;
    this.homee = platform.homee;
    this.log = platform.log;
    this.nodeId = node.id;
    this.attributes = {};

    node.attributes.forEach((attribute) => {
      if (attribute.type === ENUMS.CAAttributeType.CAAttributeTypeUpDown) {
        this.attributes.upDown = attribute;
      }
    });
  }

  /**
   * update attributes value
   * @param attribute
   */
  updateValue(attribute) {
    if (attribute.type !== ENUMS.CAAttributeType.CAAttributeTypeUpDown) return;

    const currentDoorState = this.service.getCharacteristic(Characteristic.CurrentDoorState);
    const targetDoorState = this.service.getCharacteristic(Characteristic.TargetDoorState);
    const currentStates = [
      Characteristic.CurrentDoorState.OPEN,
      Characteristic.CurrentDoorState.CLOSED,
      Characteristic.CurrentDoorState.STOPPED,
      Characteristic.CurrentDoorState.OPENING,
      Characteristic.CurrentDoorState.CLOSING,
    ];
    const newValue = currentStates[attribute.current_value];
    const targetValue = currentStates[attribute.target_value];

    if (newValue !== currentDoorState.value && newValue === targetValue) {
      currentDoorState.updateValue(newValue);
      this.log.debug(`${this.name}: CurrentDoorState:${newValue}`);

      switch (newValue) {
        case Characteristic.CurrentDoorState.OPEN:
        case Characteristic.CurrentDoorState.OPENING:
          targetDoorState.updateValue(Characteristic.TargetDoorState.OPEN);
          this.log.debug(`${this.name}: TargetDoorState:${Characteristic.TargetDoorState.OPEN}`);
          break;
        case Characteristic.CurrentDoorState.CLOSED:
        case Characteristic.CurrentDoorState.CLOSING:
          targetDoorState.updateValue(Characteristic.TargetDoorState.CLOSED);
          this.log.debug(`${this.name}: TargetDoorState:${Characteristic.TargetDoorState.CLOSED}`);
          break;
        default:
          this.log.debug(`${this.name}: TargetDoorState: There's no target door state for stopped`);
      }
    }
  }

  setTargetDoorState(value, callback, context) {
    if (context && context === 'ws') {
      callback(null, value);
      return;
    }
    console.log('newDoorState', value);
    let targetValue;

    if (value === Characteristic.TargetDoorState.OPEN) {
      targetValue = 3;
    } else if (value === Characteristic.TargetDoorState.CLOSED) {
      targetValue = 4;
    }

    this.log.debug(`Setting ${this.name} to ${targetValue}`);
    this.homee.setValue(this.nodeId, this.attributes.upDown.id, targetValue);
    callback(null, value);
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'homee')
      .setCharacteristic(Characteristic.Model, 'GarageDoor')
      .setCharacteristic(Characteristic.SerialNumber, '');

    this.service = new Service.GarageDoorOpener(this.name);

    this.service.getCharacteristic(Characteristic.CurrentDoorState)
      .updateValue(this.updateValue(this.attributes.upDown));

    this.service.getCharacteristic(Characteristic.TargetDoorState)
      .updateValue(this.updateValue(this.attributes.upDown))
      .on('set', this.setTargetDoorState.bind(this));

    return [informationService, this.service];
  }
}

module.exports = (oService, oCharacteristic) => {
  Service = oService;
  Characteristic = oCharacteristic;

  return GarageDoorAccessory;
};
