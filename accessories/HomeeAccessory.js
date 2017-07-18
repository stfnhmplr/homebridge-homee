const attributeTypes = require("../lib/attribute_types");

function HomeeAccessory(name, uuid, profile, node, platform) {
    this.name = name;
    this.uuid = uuid;
    this.platform = platform
    this.log = platform.log;
    this.nodeId = node.id;
    this.profile = profile;
    this.attributes = node.attributes;
    this.editableAttributes = [];
    this.map = {};
}

HomeeAccessory.prototype.setValue = function (value, callback, context, uuid, attributeId) {
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

HomeeAccessory.prototype.updateValue = function (attribute) {
    var that = this;

    if (that.service && attribute.id in that.map) {

        let attributeType = attributeTypes.getHAPTypeByAttributeType(attribute.type);
        let newValue = attribute.current_value;
        let oldValue = that.service.getCharacteristic(that.map[attribute.id]).value;
        let targetValue = attribute.target_value;

        if(newValue!==oldValue && newValue===targetValue) {
            that.service.getCharacteristic(that.map[attribute.id])
            .updateValue(newValue, null, 'ws');

            if (that.platform.debug) that.log(that.name + ': ' + attributeType + ': ' + newValue);
        }
    }
}

HomeeAccessory.prototype.getServices = function () {
    let informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, "Homee")
        .setCharacteristic(Characteristic.Model, "")
        .setCharacteristic(Characteristic.SerialNumber, "");

    this.service = new Service[this.profile](this.name);

    //addCharacteristics
    for (let i=0; i<this.attributes.length; i++) {
        let that = this;

        let attributeType = attributeTypes.getHAPTypeByAttributeType(this.attributes[i].type);
        let attributeId = this.attributes[i].id;

        if (attributeType) {
            if (this.platform.debug) this.log(attributeType + ': ' + this.attributes[i].current_value);
            this.map[this.attributes[i].id] = Characteristic[attributeType];

            if (!this.service.getCharacteristic(Characteristic[attributeType])) {
                this.service.addCharacteristic(Characteristic[attributeType])
            }

            this.service.getCharacteristic(Characteristic[attributeType])
            .updateValue(this.attributes[i].current_value);

            if (this.attributes[i].editable) {
                this.service.getCharacteristic(Characteristic[attributeType])
                .on('set', function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.push(attributeId);
                    this.setValue.apply(this, args);
                }.bind(this));
            }
        }
    }

    return [informationService, this.service];
};

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return HomeeAccessory;
};
