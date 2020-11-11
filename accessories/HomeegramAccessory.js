let Service;
let Characteristic;

class HomeegramAccessory {
  constructor(name, uuid, homeegram, platform) {
    this.name = name;
    this.uuid = uuid;
    this.platform = platform;
    this.homee = platform.homee;
    this.log = platform.log;
    this.homeegram = homeegram;
  }

  playHomeegram(state, callback) {
    if (!state) {
      callback(null, false);
      return;
    }

    this.log.debug(`Playing ${this.name}`);
    this.homee.play(this.homeegram.id);

    callback(null, true);

    setTimeout(() => { // simulate button behaviour
      this.service.getCharacteristic(Characteristic.On).updateValue(false);
    }, 1000);
  }

  // eslint-disable-next-line class-methods-use-this
  getState(callback) {
    callback(null, false);
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'homee')
      .setCharacteristic(Characteristic.Model, 'Homeegram')
      .setCharacteristic(Characteristic.SerialNumber, '');

    this.service = new Service.Switch();

    this.service.getCharacteristic(Characteristic.On)
      .on('get', this.getState.bind(this))
      .on('set', this.playHomeegram.bind(this));

    return [informationService, this.service];
  }
}

module.exports = (oService, oCharacteristic) => {
  Service = oService;
  Characteristic = oCharacteristic;

  return HomeegramAccessory;
};
