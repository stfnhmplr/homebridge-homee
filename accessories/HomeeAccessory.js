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
            // Provisions to cache attributeIds for hue, saturation & color temperature (will be updated with actual values during service creation) - required for update after color mode change
            // Note: this may cause issues if the lightbulb accessory features more than one separate color or color temperature attributes within homee (not aware of such devices at this time)
            this.attributeIdHue = 0;
            this.attributeIdSaturation = 0;
            this.attributeIdColorTemperature = 0;
            // Provisions to cache HSB & color temperature values for color lightbulbs (will be updated with actual value during service creation)
            this.colorTemperature = 2000;
            this.hue = 0;
            this.saturation = 0;
            this.brightness = 100;   // Brightness value currently fixed to 100% for color conversion as setting ignored by homee anyway (except for "dark" color names)
            // Only transmit color value to homee when all color components have been received from HomeKit (prevents unwanted feedback of parameter not yet transmitted to homee)
            this.hueUpdated = false;
            this.saturationUpdated = false;
            // Current color mode of homee [1 = RGB, 2 = color temperature] (will be updated with actual value during service creation)
            this.colorMode = 1;
            // Disable RGB or color temperature controls if desired for this accessory
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

        // Brightness value currently fixed to 100% for color conversion as setting ignored by homee and HomeKit anyway (except for "dark" color names)
        // if (attributeType == 2 || attributeType == 61) this.brightness = value;

        // Special pre-processing for color temperature values
        if (attributeType == 42) {
            // Switch plugin to color temperature mode
            this.colorMode = 2;
            // Color temperature conversion HomeKit [MK-1] -> homee [K]
            value = Math.min(Math.round(1000000 / value), 6535);
            this.colorTemperature = value;
            // Workaround for Home app's color picker (does not adjust to color temperature by itself but requires extrenal setting to corresponding color)
            this.emulateColorTemperature(this.colorTemperature, this.attributeIdHue, this.attributeIdSaturation);
        }

        // Special handling for hue/saturation values (provided only one at a time)
        if (attributeType == 23) {
            if (attributeId < 100000) {
                this.hue = value;
                this.hueUpdated = true;
            } else {
                this.saturation = value;
                this.saturationUpdated = true;
            }
            if (this.hueUpdated && this.saturationUpdated) {
                // Switch plugin to rgb color mode
                this.colorMode = 1;
                // Conversion from updated & cached HSB values to single RGB color value
                value = HSBToColor(this.hue, this.saturation, this.brightness);
                this.log.debug('Setting ' + this.name + ' to ' + value);
                if (attributeId < 100000) {
                    this.homee.setValue(this.nodeId, attributeId, value);
                } else {
                    this.homee.setValue(this.nodeId, attributeId - 100000, value);
                }
                this.hueUpdated = false;
                this.saturationUpdated = false;
            }

        // Regular handling for all other attributes
        } else {
            this.log.debug('Setting ' + this.name + ' to ' + value);
            this.homee.setValue(this.nodeId, attributeId, value);
        }

        callback(null, value);
    }



    updateValue(attribute) {
        if (this.service && attribute.id in this.map) {
            let attributeType = attributeTypes.getHAPTypeByAttributeType(attribute.type);
            let newValue = attribute.current_value;
            if (attributeType == 'ColorMode') {
                var oldValue = this.colorMode;
            } else {
                var oldValue = this.service.getCharacteristic(this.map[attribute.id]).value;
            }
            let targetValue = attribute.target_value;

            // Special handling for color temperature lightbulbs
            if (attributeType == 'ColorTemperature') {
                // Color temperature conversion homee [K] -> HomeKit [MK-1]
                newValue = Math.round(1000000 / newValue);
                targetValue = Math.round(1000000 / targetValue);
                this.colorTemperature = newValue;
                // Only set color temperature in HomeKit if plugin is in color temperature mode
                if (this.colorMode == 2) {
                    if (newValue !== oldValue && newValue === targetValue) {
                        // Workaround for HomeKit color picker (does not adjust to color temperature by itself but requires extrenal setting to corresponding color)
                        this.emulateColorTemperature(newValue, this.attributeIdHue, this.attributeIdSaturation);
                        // Send color temperature to HomeKit
                        this.service.getCharacteristic(this.map[attribute.id]).updateValue(newValue, null, 'ws');
                        this.log.debug(this.name + ': ' + attributeType + ': ' + newValue);
                    }
                } else {
                    this.log.debug('Not forwarding color temperature to HomeKit due to rgb color mode');
                }

            // Special handling for RGB color lightbulbs as single color value from homee must be split and sent to HomeKit as separate hue/saturation values
            } else if (attributeType == 'Color') {
                // Calculating virtual attribute ID for saturation
                let attributeIdHue = attribute.id;
                let attributeIdSaturation = 100000 + attribute.id;
                // Conversion from single RGB color value to array containing separate HSB values
                let newHSB = colorToHSB(newValue);
                let targetHSB = colorToHSB(targetValue);
                let oldHue = oldValue;
                let oldSaturation = this.service.getCharacteristic(this.map[attributeIdSaturation]).value;
                

                this.hue = newHSB[0];
                this.saturation = newHSB[1];

                if (this.colorMode == 1) {
                    // Sending hue value to HomeKit
                    if (newHSB[0] !== oldHue && newHSB[0] === targetHSB[0]) {
                        this.service.getCharacteristic(this.map[attributeIdHue]).updateValue(this.hue, null, 'ws');
                        this.log.debug(this.name + ': ' + attributeType + ' (Hue): ' + this.hue);
                    }
                    // Sending saturation value to HomeKit
                    if (newHSB[1] !== oldSaturation && newHSB[1] === targetHSB[1]) {
                        this.service.getCharacteristic(this.map[attributeIdSaturation]).updateValue(this.saturation, null, 'ws');
                        this.log.debug(this.name + ': ' + attributeType + ' (Saturation): ' + this.saturation);
                    }
                } else {
                    this.log.debug('Not forwarding hue & saturation to HomeKit due to color temperature mode');
                }

            // Handling for homee color mode change
            } else if (attributeType == 'ColorMode') {
                this.colorMode = newValue;
                this.log.debug(this.name + ': ' + attributeType + ': ' + newValue + ' (not relayed to HomeKit)');

                // If changed to color mode, send cached color to HomeKit as color mode is usually sent *after* color value by homee
                if (!this.disableRGB && newValue != oldValue && newValue == 1) {
                    this.service.getCharacteristic(this.map[this.attributeIdHue]).updateValue(this.hue, null, 'ws');
                    this.log.debug(this.name + ': ' + attributeType + ' (Hue): ' + this.hue);
                    this.service.getCharacteristic(this.map[this.attributeIdSaturation]).updateValue(this.saturation, null, 'ws');
                    this.log.debug(this.name + ': ' + attributeType + ' (Saturation): ' + this.saturation);                }

                // If changed to color temperature mode, send cached color temperature to HomeKit as color mode is usually sent *after* color temperature value by homee
                if (!this.disableCT && newValue != oldValue && newValue == 2) {
                    // Workaround for HomeKit color picker (does not adjust to color temperature by itself but requires extrenal setting to corresponding color)
                    this.emulateColorTemperature(this.colorTemperature, this.attributeIdHue, this.attributeIdSaturation);
                    // Send color temperature to HomeKit
                    this.service.getCharacteristic(this.map[this.attributeIdColorTemperature]).updateValue(this.colorTemperature, null, 'ws');
                    this.log.debug(this.name + ': ColorTemperature: ' + this.colorTemperature);
                }

            // Regular handling for all other attributes
            } else {
                if (newValue !== oldValue && newValue === targetValue) {
                    this.service.getCharacteristic(this.map[attribute.id]).updateValue(newValue, null, 'ws');
                    /* Brightness value currently fixed to 100% for color conversion as setting ignored by homee anyway (except for "dark" color names)
                    if (attributeType == 'Brightness') {
                        this.brightness = newValue;
                    } */
                    this.log.debug(this.name + ': ' + attributeType + ': ' + newValue);
                }
            }
        }
    }



    // Workaround for HomeKit color picker (does not adjust to color temperature by itself but requires extrenal setting to corresponding color)
    emulateColorTemperature(value, attributeIdHue, attributeIdSaturation) {
        let rgb = [];
        let colorTemperature = value;
        if (colorTemperature < 1000) colorTemperature = 1000000 / colorTemperature;
        colorTemperature = colorTemperature / 100;

        // Conversion valid for color temperatures below 6,600 K (homee seems to be limited to 6,535 K)
        rgb[0] = 255;
        rgb[1] = Math.max(0, Math.min(255, (99.4708025861 * Math.log(colorTemperature)) - 161.1195681661));
        rgb[2] = Math.max(0, Math.min(255, (138.5177312231 * Math.log(colorTemperature - 10)) - 305.0447927307));
        let hsb = RGBToHSB(rgb);

        this.hue = hsb[0];
        this.saturation = hsb[1];
        this.service.getCharacteristic(this.map[attributeIdHue]).updateValue(this.hue, null, 'ws');
        this.service.getCharacteristic(this.map[attributeIdSaturation]).updateValue(this.saturation, null, 'ws');
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

            // Skip attribute addition in case the color or color temperature controls are not desired
            if (attributeType == 'Color' && this.disableRGB) continue;
            if (attributeType == 'ColorTemperature' && this.disableCT) continue;

            if (attributeType) {
                this.log.debug(attributeType + ': ' + attribute.current_value);

                // Special handling for color lightbulbs as single color value from homee must be split and sent to HomeKit as separate hue/saturation values
                if (attributeType == 'Color') {
                    // Prevent potential addition of color temperature in case this is not desired for color lightbulbs
                    this.disableCT = this.disableCT || this.platform.disableCTforRGB;
                    // Calculation of current HSB values for device initialization
                    let currentHSB = colorToHSB(attribute.current_value);
                    this.hue = currentHSB[0];
                    this.saturation = currentHSB[1];    

                    // *** Hue section (using real attribute ID)
                    attributeType = 'Hue';
                    // Cache attributeId for hue
                    this.attributeIdHue = attributeId;
                    this.map[this.attributeIdHue] = Characteristic[attributeType];

                    if (!this.service.getCharacteristic(Characteristic[attributeType])) {
                        this.service.addCharacteristic(Characteristic[attributeType]);
                    }

                    // Only initialize hue value if accessory is in RGB mode
                    if (this.colorMode == 1) {
                        this.service.getCharacteristic(Characteristic[attributeType]).updateValue(this.hue);
                        this.log.debug(' -> ' + attributeType + ': ' + this.hue);
                    }

                    if (attribute.editable) {
                        this.service.getCharacteristic(Characteristic[attributeType]).on(
                            'set',
                            function() {
                                var args = Array.prototype.slice.call(arguments);
                                args.push(this.attributeIdHue, attribute.type);
                                this.setValue.apply(this, args);
                            }.bind(this)
                        );
                    }

                    // *** Saturation section (using virtual attribute ID at hue attribute ID + 100,000)
                    attributeType = 'Saturation';
                    // Cache attributeId for saturation
                    this.attributeIdSaturation = 100000 + attributeId;
                    this.map[this.attributeIdSaturation] = Characteristic[attributeType];

                    if (!this.service.getCharacteristic(Characteristic[attributeType])) {
                        this.service.addCharacteristic(Characteristic[attributeType]);
                    }

                    // Only initialize saturation value if accessory is in RGB mode
                    if (this.colorMode == 1) {
                        this.service.getCharacteristic(Characteristic[attributeType]).updateValue(this.saturation);
                        this.log.debug(' -> ' + attributeType + ': ' + this.saturation);
                    }

                    if (attribute.editable) {
                        this.service.getCharacteristic(Characteristic[attributeType]).on(
                            'set',
                            function() {
                                var args = Array.prototype.slice.call(arguments);
                                args.push(this.attributeIdSaturation, attribute.type);
                                this.setValue.apply(this, args);
                            }.bind(this)
                        );
                    }

                // Handling for color mode (no characteristic created, only internal status is updated according to homee color mode)
                } else if (attributeType == 'ColorMode') {
                    this.map[attribute.id] = Characteristic[attributeType];
                    this.colorMode = attribute.current_value;

                // Handling for all other accessory types
                } else {
                    this.map[attribute.id] = Characteristic[attributeType];
                    // Cache attributeId for color temperature
                    if (attributeType == 'ColorTemperature') this.attributeIdColorTemperature = attribute.id;

                    if (!this.service.getCharacteristic(Characteristic[attributeType])) {
                        this.service.addCharacteristic(Characteristic[attributeType]);
                    }

                    // Only initialize color temperature value if accessory is in color temperature mode
                    if (attributeType != 'ColorTemperature' || this.colorMode == 2) {
                        this.service.getCharacteristic(Characteristic[attributeType]).updateValue(attribute.current_value);
                    }

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



const RGBToHSB = (rgb) => {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const v = Math.max(r, g, b),
          n = v - Math.min(r, g, b);
    const h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
    return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
};

const colorToHSB = (color) => {
    const r = ((color >> 16) & 0xFF) / 255;
    const g = ((color >> 8) & 0xFF) / 255;
    const b = (color & 0xFF) / 255;
    return RGBToHSB([r, g, b]);
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