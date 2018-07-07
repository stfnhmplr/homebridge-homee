'use strict'

let Service, Characteristic;

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

        this.log.debug('Playing ' + this.name);
        this.homee.play(this.homeegram.id);

        callback(null, true);

        setTimeout(() => { //simulate button behaviour
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
        }, 1000);
    }

    getState(callback) {
        callback(null, false)
    }

    getServices() {
        let informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Homee")
            .setCharacteristic(Characteristic.Model, "Homeegram")
            .setCharacteristic(Characteristic.SerialNumber, "");

        this.service = new Service.Switch;

        this.service.getCharacteristic(Characteristic.On)
            .on('get', this.getState.bind(this))
            .on('set', this.playHomeegram.bind(this));

        return [informationService, this.service];
    };
}

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return HomeegramAccessory;
};
