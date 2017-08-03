const attributeTypes = require("../lib/attribute_types");

function MultiSwitchAccessory(name, uuid, profile, node, platform) {
    this.name = name;
    this.uuid = uuid;
    this.platform = platform
    this.log = platform.log;
    this.nodeId = node.id;
    this.profile = profile;
    this.attributes = [];
    this.services = [];

    for (attribute in node.attributes) {
        if (attributeTypes.getHAPTypeByAttributeType(attribute.type) === "On") {
            this.attributes[attribute.instance] = attribute;
        }
    }
}

MultiSwitchAccessory.prototype.setValue = function (value, callback, context, uuid, attributeId) {
    if (context && context == 'ws') {
        callback(null, value);
        return;
    }

    if (value === true) value = 1;
    if (value === false) value = 0;

    if (this.platform.debug) this.log('Setting ' + this.name + ' to ' + value);
    this.platform.homee.send(
        'PUT:/nodes/' + this.nodeId + '/attributes/' + attributeId + '?target_value=' + value
    );

    callback(null, value);
}

MultiSwitchAccessory.prototype.updateValue = function (attribute) {
    var that = this;

    if (that.services.length && attribute.id in that.map) {

        let attributeType = attributeTypes.getHAPTypeByAttributeType(attribute.type);
        let newValue = attribute.current_value;
        let oldValue = that.services[attribute.instance].getCharacteristic(that.map[attribute.id]).value;
        let targetValue = attribute.target_value;

        if(newValue!==oldValue && newValue===targetValue) {
            that.services[attribute.instance].getCharacteristic(that.map[attribute.id])
            .updateValue(newValue, null, 'ws');

            if (that.platform.debug) that.log(that.name + ': ' + attributeType + ': ' + newValue);
        }
    }
}

MultiSwitchAccessory.prototype.getServices = function () {
    let informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, "Homee")
        .setCharacteristic(Characteristic.Model, "MultiSwitch")
        .setCharacteristic(Characteristic.SerialNumber, "");

    for (let i=0; i<this.attributes.length; i++) {
        let service = new Service.Switch(this.name + '-' + this.attributes[i].instance);
        let attributeId = this.attributes[i].id;

        this.map[attributeId] = Characteristic[attributeType];

        service.getCharacteristic(Characteristic.On)
            .updateValue(this.attributes[i].current_value);

        if (this.attributes[i].editable) {
            service.getCharacteristic(Characteristic.On).on('set', function() {
                var args = Array.prototype.slice.call(arguments);
                args.push(attributeId);
                this.setValue.apply(this, args);
            }.bind(this));
        }

        services[this.attributes[i].instance] = service;
    }
        services.push(informationService);

    return services;
};

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return MultiSwitchAccessory;
};
