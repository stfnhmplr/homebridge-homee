const ENUMS = require('./enums.js');

exports.getHAPTypeByAttributeType = function(attributeType) {
    let HAPType;

    switch (attributeType) {
        case ENUMS.CAAttributeType.CAAttributeTypeOnOff:
        case ENUMS.CAAttributeType.CAAttributeTypeSiren:
            HAPType = 'On';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeDimmingLevel:
        case ENUMS.CAAttributeType.CAAttributeTypeLEDBrightness:
            HAPType = 'Brightness';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeHue:
            HAPType = 'Hue';
            break;
	    case ENUMS.CAAttributeType.CAAttributeTypeColor:
            HAPType = 'Color';   // Non-existing HAP type, used only internally for color lightbulbs (split into hue & saturation)
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeColorMode:
            HAPType = 'ColorMode';   // Non-existing HAP type used, only internally to filter color and color temperature values sent to HomeKit according to current color mode of accessory
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeSaturation:
            HAPType = 'Saturation';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeColorTemperature:
            HAPType = 'ColorTemperature';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeTemperature:
            HAPType = 'CurrentTemperature';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeTargetTemperature:
            HAPType = 'TargetTemperature';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeRelativeHumidity:
            HAPType = 'CurrentRelativeHumidity';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeBatteryLevel:
            HAPType = 'BatteryLevel';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeWindowPosition:
        case ENUMS.CAAttributeType.CAAttributeTypeOpenClose:
            HAPType = 'ContactSensorState';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeBrightness:
            HAPType = 'CurrentAmbientLightLevel';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeFloodAlarm:
        case ENUMS.CAAttributeType.CAAttributeTypeLeakAlarm:
        case ENUMS.CAAttributeType.CAAttributeTypeOilAlarm:
        case ENUMS.CAAttributeType.CAAttributeTypeWaterAlarm:
            HAPType = 'LeakDetected';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypePosition:
            HAPType = 'CurrentPosition';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeSmokeAlarm:
            HAPType = 'SmokeDetected';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeCO2Level:
            HAPType = 'CarbonDioxideLevel';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeMotionAlarm:
            HAPType = 'MotionDetected';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypePresenceAlarm:
            HAPType = 'OccupancyDetected';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeTamperAlarm:
            HAPType = 'StatusTampered';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeBatteryLowAlarm:
            HAPType = 'StatusLowBattery';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeCOAlarm:
            HAPType = 'CarbonMonoxideDetected';
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeMalfunctionAlarm:
            HAPType = 'StatusFault';
            break;
    }

    return HAPType;
};
