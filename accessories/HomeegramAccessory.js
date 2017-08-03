function HomeegramAccessory(name, uuid, homeegram, platform) {
    this.name = name;
    this.uuid = uuid;
    this.platform = platform
    this.log = platform.log;
    this.homeegram = homeegram;
}

HomeegramAccessory.prototype.runHomeegram = function (state, callback) {
    if (!state) {
        callback(null, false);
        return;
    }

    if (this.platform.debug) this.log('Running ' + this.name);
    this.platform.homee.send('PUT:homeegrams/' + this.homeegram.id + '?play=1');

    callback(null, true);

    setTimeout(() => { //simulate button behaviour
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
    }, 1000);
}

HomeegramAccessory.prototype.getState = function (callback) {
    callback(null, false);
}

HomeegramAccessory.prototype.getServices = function () {
    let informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, "Homee")
        .setCharacteristic(Characteristic.Model, "Homeegram")
        .setCharacteristic(Characteristic.SerialNumber, "");

    this.service = new Service.Switch;

    this.service.getCharacteristic(Characteristic.On)
    .on('get', this.getState.bind(this))
    .on('set', this.runHomeegram.bind(this));

    return [informationService, this.service];
};

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return HomeegramAccessory;
};
