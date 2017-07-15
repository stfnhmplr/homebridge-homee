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

    let that = this;

    this.platform.homee.listen(message => {
        if (message.attribute || message.node) {
            let attributes = message.node ? message.node.attributes : [message.attribute];

            attributes.forEach(function (attribute) {
                that._updateValue(attribute);
            })
        }
    });
}

HomeeAccessory.prototype.getValue = function (callback) {
    this.platform.homee.send('GET:nodes/' + this.nodeId)
    callback(null);
}

HomeeAccessory.prototype.setValue = function (value, callback, context, uuid, attributeId) {
    if (context && context == 'ws') {
		callback(null, value);
	    return;
	}

    if (value === true) value = 1;
    if (value === false) value = 0;

    this.log('Setting ' + this.name + ' to ' + value);
    this.platform.homee.send(
        'PUT:/nodes/' + this.nodeId + '/attributes/' + attributeId + '?target_value=' + value
    );

    callback(null, value);
}

HomeeAccessory.prototype._updateValue = function (attribute) {
    var that = this;

    if (that.service && attribute.id in that.map) {

        let attributeType = attributeTypes.find(x => x.id === attribute.type).hap_type;
        that.value = attribute.current_value;

        that.service.getCharacteristic(that.map[attribute.id])
        .updateValue(that.value, null, 'ws');

        that.log(that.name + ': ' + attributeType + ': ' + that.value);
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

        let attributeType = attributeTypes.find(x => x.id === this.attributes[i].type).hap_type;
        let attributeId = this.attributes[i].id;

        if (attributeType) {
            this.log(attributeType + ': ' + this.attributes[i].current_value);
            this.map[this.attributes[i].id] = Characteristic[attributeType];

            if (!this.service.getCharacteristic(Characteristic[attributeType])) {
                this.service.addCharacteristic(Characteristic[attributeType])
            }

            this.service.getCharacteristic(Characteristic[attributeType])
            .updateValue(this.attributes[i].current_value)
            .on('get', this.getValue.bind(this));

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
