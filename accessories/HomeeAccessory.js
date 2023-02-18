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
        if (profile == 'Lightbulb') {
            // provisions to cache HSB values for color lightbulbs as only one value is provided at a time by HomeKit
            this.hue = 0;            // will be updated with actual value right after service creation 
            this.saturation = 0;     // will be updated with actuel value right after service creation
            this.brightness = 100;   // brightness value currently fixed to 100% for color conversion as setting ignored by homee anyway (except for "dark" color names)
            // inhibit RGB or color temperature controls for certain lightbulbs
            this.disableRGB = this.platform.disableRGB || this.platform.disableRGBforDevice.indexOf(this.nodeId) >= 0;
            this.disableCT = this.platform.disableCT || this.platform.disableCTforDevice.indexOf(this.nodeId) >= 0;
        }
    }

    setValue(value, callback, context, uuid, attributeId, attributeType) {

        if (context && context == 'ws') {
            callback(null, value);
            return;
        }

        if (value === true) value = 1;
        if (value === false) value = 0;

        // color temperature conversion HomeKit [MK-1] -> homee [K]
        if (attributeType == 42) {
            value = Math.min(Math.round(1000000 / value), 6535);
        }

        // special handling for hue/saturation values (provided only one at a time)
        if (attributeType == 23) {
            if (attributeId >= 100000) {
                this.saturation = value;
            } else {
                this.hue = value;
            }
            value = HSBToColor(this.hue, this.saturation, this.brightness);   // conversion from updated & cachec HSB values to single RGB color value
        }

        // brightness value currently fixed to 100% for color conversion as setting ignored by homee anyway (except for "dark" color names)
        // if (attributeType == 2 || attributeType == 61) this.brightness = value;

        if (attributeId < 100000) {   // do not send data to homee when saturation has been updated by HomeKit (virtual attribute ID only, no direct link), this will be done when hue change is repoirted by HomeKit
            this.log.debug('Setting ' + this.name + ' to ' + value);
            this.homee.setValue(this.nodeId, attributeId, value);
        }

        callback(null, value);
    }

    updateValue(attribute) {
        if (this.service && attribute.id in this.map) {
            let attributeType = attributeTypes.getHAPTypeByAttributeType(attribute.type);
            let newValue = attribute.current_value;
            let oldValue = this.service.getCharacteristic(this.map[attribute.id]).value;
            let targetValue = attribute.target_value;

            // color temperature conversion homee [K] -> HomeKit [MK-1]
            if (attribute.type == 42) {
                newValue = Math.round(1000000 / newValue);
                targetValue = Math.round(1000000 / targetValue);
            }

            // special handling for color lightbulbs as single color value from homee must be split and sent to HomeKit as separate hue/saturation values
            if (attribute.type == 23) {
                let attributeIdHue = attribute.id;
                let attributeIdSaturation = 100000 + attribute.id;   // calculating virtual attribute ID for saturation
                let newHSB = colorToHSB(newValue);   // conversion from single RGB color value to array containing separate HSB values
                let oldHue = oldValue;
                let oldSaturation = this.service.getCharacteristic(this.map[attributeIdSaturation]).value;
                let targetHSB = colorToHSB(targetValue);   // conversion from single RGB color value to array containing separate HSB values
            
                // sending hue value to HomeKit
                if (newHSB[0] !== oldHue && newHSB[0] === targetHSB[0]) {
                    this.service.getCharacteristic(this.map[attributeIdHue]).updateValue(newHSB[0], null, 'ws');
                    this.hue = newHSB[0];
                    this.log.debug(this.name + ': ' + attributeType + ' (Hue): ' + newHSB[0]);
                }

                // sending saturation value to HomeKit
                if (newHSB[1] !== oldSaturation && newHSB[1] === targetHSB[1]) {
                    this.service.getCharacteristic(this.map[attributeIdSaturation]).updateValue(newHSB[1], null, 'ws');
                    this.saturation = newHSB[1];
                    this.log.debug(this.name + ': ' + attributeType + ' (Saturation): ' + newHSB[1]);
                }

            // handling for all other accessory types
            } else {
                if (newValue !== oldValue && newValue === targetValue) {
                    this.service.getCharacteristic(this.map[attribute.id]).updateValue(newValue, null, 'ws');
                    /* brightness value currently fixed to 100% for color conversion as setting ignored by homee anyway (except for "dark" color names)
                    if (attributeType == 'Brightness') {
                        this.brightness = newValue;
                    } */
                    this.log.debug(this.name + ': ' + attributeType + ': ' + newValue);
                }
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

            // skip attribute addition in case the color or color temperature controls are not desired
            if (attributeType == 'Color' && this.disableRGB) continue;
            if (attributeType == 'ColorTemperature' && this.disableCT) continue;

            if (attributeType) {
                this.log.debug(attributeType + ': ' + attribute.current_value);

                // special handling for color lightbulbs as single color value from homee must be split and sent to HomeKit as separate hue/saturation values
                if (attributeType == 'Color') {
                    // prevent subsequent addition of color temperature in case this is not desired for color lightbulbs
                    this.disableCT = this.disableCT || this.platform.disableCTforRGB;

                    // hue section (using real attribute ID)
                    attributeType = 'Hue';
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
                                args.push(attributeId, attribute.type);
                                this.setValue.apply(this, args);
                            }.bind(this)
                        );
                    }

                    // hue section (using virtual attribute ID at hue attribute ID + 100,000)
                    attributeType = 'Saturation';
                    this.map[100000 + attribute.id] = Characteristic[attributeType];

                    if (!this.service.getCharacteristic(Characteristic[attributeType])) {
                        this.service.addCharacteristic(Characteristic[attributeType]);
                    }

                    this.service.getCharacteristic(Characteristic[attributeType]).updateValue(attribute.current_value);

                    if (attribute.editable) {
                        this.service.getCharacteristic(Characteristic[attributeType]).on(
                            'set',
                            function() {
                                var args = Array.prototype.slice.call(arguments);
                                args.push(100000 + attributeId, attribute.type);
                                this.setValue.apply(this, args);
                            }.bind(this)
                        );
                    }

                // handling for all other accessory types
                } else {
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
                                args.push(attributeId, attribute.type);
                                this.setValue.apply(this, args);
                            }.bind(this)
                        );
                    }
                }
            }
        }

        return [informationService, this.service];
    }
}

const colorToHSB = (color) => {
    const r = ((color >> 16) & 0xFF) / 255;
    const g = ((color >> 8) & 0xFF) / 255;
    const b = (color & 0xFF) / 255;
    const v = Math.max(r, g, b),
          n = v - Math.min(r, g, b);
    const h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
    return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
};

const HSBToColor = (h, s, b) => {
    s /= 100;
    b /= 100;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    const color = (Math.round(255 * f(5)) << 16) + (Math.round(255 * f(3)) << 8) + Math.round(255 * f(1));
    return color;
};

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return HomeeAccessory;
};