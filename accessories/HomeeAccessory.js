const attributeTypes = require('../lib/attribute_types');

let Service, Characteristic;

class HomeeAccessory {
    constructor(name, uuid, profile, node, platform, instance) {
        this.name = name;
        this.uuid = uuid;
        this.platform = platform;
        this.log = platform.log;
        this.homee = platform.homee;
        this.nodeId = node.id;
        this.profile = profile;
        this.instance = instance || 0;
        this.attributes = node.attributes;
        this.map = [];
    }

    setValue(value, callback, context, uuid, attributeId) {
        if (context && context == 'ws') {
            callback(null, value);
            return;
        }

        if (value === true) value = 1;
        if (value === false) value = 0;

        this.log.debug('Setting ' + this.name + ' to ' + value);
        this.homee.setValue(this.nodeId, attributeId, value);

        callback(null, value);
    }

    updateValue(attribute) {
        if (this.service && attribute.id in this.map) {
            let attributeType = attributeTypes.getHAPTypeByAttributeType(attribute.type);
            let newValue = attribute.current_value;
            let oldValue = this.service.getCharacteristic(this.map[attribute.id]).value;
            let targetValue = attribute.target_value;

            if (newValue !== oldValue && newValue === targetValue) {
                this.service.getCharacteristic(this.map[attribute.id]).updateValue(newValue, null, 'ws');
                this.log.debug(this.name + ': ' + attributeType + ': ' + newValue);
            }
        }
    }

    getServices() {
        let informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, 'Homee')
            .setCharacteristic(Characteristic.Model, '')
            .setCharacteristic(Characteristic.SerialNumber, '');

        this.service = new Service[this.profile](this.name);

        // addCharacteristics
        for (let attribute of this.attributes) {
            let attributeType = attributeTypes.getHAPTypeByAttributeType(attribute.type);
            let attributeId = attribute.id;

            // skip characteristic if instance doesn't match
            if (attributeType === 'On' && this.instance !== 0 && attribute.instance !== this.instance) continue;

            // ensure that characteristic 'On' is unique --> Fibaro FGS 213
            if (attributeType === 'On' && this.map.indexOf(Characteristic.On) > -1) continue;

            if (attributeType) {
                this.log.debug(attributeType + ': ' + attribute.current_value);
                this.map[attribute.id] = Characteristic[attributeType];

                if (!this.service.getCharacteristic(Characteristic[attributeType])) {
                    this.service.addCharacteristic(Characteristic[attributeType]);
                }

                this.service.getCharacteristic(Characteristic[attributeType]).updateValue(attribute.current_value);

                if (attribute.editable) {
                    this.service.getCharacteristic(Characteristic[attributeType]).on(
                        'set',
                        function() {
                            var args = Array.prototype.slice.call(arguments);
                            args.push(attributeId);
                            this.setValue.apply(this, args);
                        }.bind(this)
                    );
                }
            }
        }

        return [informationService, this.service];
    }
}

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return HomeeAccessory;
};
