var ENUMS = require('./enums.js');

exports.getAccessoryTypeByNodeProfile = function(nodeProfile) {
  var accessoryType;

  switch (nodeProfile) {
    case ENUMS.CANodeProfile.CANodeProfileOnOffPlug:
    case ENUMS.CANodeProfile.CANodeProfileMeteringSwitch:
    case ENUMS.CANodeProfile.CANodeProfileMeteringPlug:
    case ENUMS.CANodeProfile.CANodeProfileOnOffSwitch:
    case ENUMS.CANodeProfile.CANodeProfileOnOffSwitchWithBinaryInput:
    case ENUMS.CANodeProfile.CANodeProfileWatchDogWithPressureAndTemperatures:
    case ENUMS.CANodeProfile.CANodeProfileSiren:
      accessoryType = 'Switch';
      break;
    case ENUMS.CANodeProfile.CANodeProfileDoubleOnOffSwitch:
    case ENUMS.CANodeProfile.CANodeProfileDoubleOnOffPlug:
    case ENUMS.CANodeProfile.CANodeProfileDoubleMeteringSwitch:
      accessoryType = 'DoubleSwitch';
      break;
    case ENUMS.CANodeProfile.CANodeProfileDimmableColorLight:
    case ENUMS.CANodeProfile.CANodeProfileDimmableColorTemperatureLight:
    case ENUMS.CANodeProfile.CANodeProfileDimmableLight:
    case ENUMS.CANodeProfile.CANodeProfileDimmableLightWithBrightnessAndPresenceSensor:
    case ENUMS.CANodeProfile.CANodeProfileDimmableRGBWLight:
    case ENUMS.CANodeProfile.CANodeProfileDimmableColorMeteringPlug:
    case ENUMS.CANodeProfile.CANodeProfileDimmablePlug:
    case ENUMS.CANodeProfile.CANodeProfileDimmableSwitch:
    case ENUMS.CANodeProfile.CANodeProfileDimmableMeteringSwitch:
      accessoryType = 'Lightbulb';
      break;
    case ENUMS.CANodeProfile.CANodeProfileDimmableExtendedColorLight:
      accessoryType = "RGBLightbulb";
      break;
    case ENUMS.CANodeProfile.CANodeProfileBrightnessSensor:
      accessoryType = 'LightSensor';
      break;
    case ENUMS.CANodeProfile.CANodeProfileOpenCloseSensor:
    case ENUMS.CANodeProfile.CANodeProfileOpenCloseAndTemperatureSensor:
    case ENUMS.CANodeProfile.CANodeProfileOpenCloseWithTemperatureAndBrightnessSensor:
      accessoryType = 'ContactSensor';
      break;
    case ENUMS.CANodeProfile.CANodeProfileWindowHandle:
      accessoryType = 'Window';
      break;
    case ENUMS.CANodeProfile.CANodeProfileShutterPositionSwitch:
    case ENUMS.CANodeProfile.CANodeProfileElectricMotorMeteringSwitch:
    case ENUMS.CANodeProfile.CANodeProfileElectricMotorMeteringSwitchWithoutSlatPosition:
      accessoryType = 'WindowCovering';
      break;
    case ENUMS.CANodeProfile.CANodeProfileTemperatureAndHumiditySensor:
    case ENUMS.CANodeProfile.CANodeProfileTemperatureSensor:
    case ENUMS.CANodeProfile.CANodeProfileNetatmoMainModule:
    case ENUMS.CANodeProfile.CANodeProfileNetatmoOutdoorModule:
    case ENUMS.CANodeProfile.CANodeProfileNetatmoIndoorModule:
      accessoryType = 'TemperatureSensor';
      break;
    case ENUMS.CANodeProfile.CANodeProfileCO2Sensor:
      accessoryType = 'CarbonDioxideSensor';
      break;
    case ENUMS.CANodeProfile.CANodeProfileCODetector:
      accessoryType = 'CarbonMonoxideSensor';
      break;
    case ENUMS.CANodeProfile.CANodeProfileRoomThermostat:
    case ENUMS.CANodeProfile.CANodeProfileRoomThermostatWithHumiditySensor:
    case ENUMS.CANodeProfile.CANodeProfileRadiatorThermostat:
    case ENUMS.CANodeProfile.CANodeProfileCosiThermChannel:
    case ENUMS.CANodeProfile.CANodeProfileNestThermostatWithCooling:
    case ENUMS.CANodeProfile.CANodeProfileNestThermostatWithHeating:
    case ENUMS.CANodeProfile.CANodeProfileNestThermostatWithHeatingAndCooling:
    case ENUMS.CANodeProfile.CANodeProfileNetatmoThermostat:
      accessoryType = 'Thermostat';
      break;
    case ENUMS.CANodeProfile.CANodeProfileMotionDetectorWithTemperatureBrightnessAndHumiditySensor:
    case ENUMS.CANodeProfile.CANodeProfileMotionDetector:
    case ENUMS.CANodeProfile.CANodeProfileMotionDetectorWithTemperatureAndBrightnessSensor:
    case ENUMS.CANodeProfile.CANodeProfileMotionDetectorWithOpenCloseTemperatureAndBrightnessSensor:
    case ENUMS.CANodeProfile.CANodeProfileMotionDetectorWithBrightness:
      accessoryType = 'MotionSensor';
      break;
    case ENUMS.CANodeProfile.CANodeProfilePresenceDetector:
    case ENUMS.CANodeProfile.CANodeProfilePresenceDetectorWithTemperatureAndBrightnessSensor:
      accessoryType = 'OccupancySensor';
      break;
    case ENUMS.CANodeProfile.CANodeProfileSmokeDetector:
    case ENUMS.CANodeProfile.CANodeProfileSmokeDetectorWithTemperatureSensor:
    case ENUMS.CANodeProfile.CANodeProfileSmokeDetectorAndCODetector:
    case ENUMS.CANodeProfile.CANodeProfileSmokeDetectorAndSiren:
      accessoryType = 'SmokeSensor';
      break;
    case ENUMS.CANodeProfile.CANodeProfileFloodDetector:
    case ENUMS.CANodeProfile.CANodeProfileFloodDetectorWithTemperatureSensor:
    case ENUMS.CANodeProfile.CANodeProfileOWU:
    case ENUMS.CANodeProfile.CANodeProfileOWWG3:
    case ENUMS.CANodeProfile.CANodeProfileLAG:
    case ENUMS.CANodeProfile.CANodeProfileEurovac:
    case ENUMS.CANodeProfile.CANodeProfileEuropress:
    case ENUMS.CANodeProfile.CANodeProfileFloodDetectorWithTemperatureAndHumiditySensor:
      accessoryType = 'LeakSensor';
      break;
  }

  return accessoryType;
};
