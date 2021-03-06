module.exports = {
    CAAttributeType: {
        CAAttributeTypeNone: 0,
        CAAttributeTypeOnOff: 1,
        CAAttributeTypeDimmingLevel: 2,
        CAAttributeTypeCurrentEnergyUse: 3,
        CAAttributeTypeAccumulatedEnergyUse: 4,
        CAAttributeTypeTemperature: 5,
        CAAttributeTypeTargetTemperature: 6,
        CAAttributeTypeRelativeHumidity: 7,
        CAAttributeTypeBatteryLevel: 8,
        CAAttributeTypeStatusLED: 9,
        CAAttributeTypeWindowPosition: 10,
        CAAttributeTypeBrightness: 11,
        CAAttributeTypeFloodAlarm: 12,
        CAAttributeTypeSiren: 13,
        CAAttributeTypeOpenClose: 14,
        CAAttributeTypePosition: 15,
        CAAttributeTypeSmokeAlarm: 16,
        CAAttributeTypeBlackoutAlarm: 17,
        CAAttributeTypeCurrentValvePosition: 18,
        CAAttributeTypeBinaryInput: 19,
        CAAttributeTypeCO2Level: 20,
        CAAttributeTypePressure: 21,
        CAAttributeTypeColor: 23,
        CAAttributeTypeSaturation: 24,
        CAAttributeTypeMotionAlarm: 25,
        CAAttributeTypeMotionSensitivity: 26,
        CAAttributeTypeMotionInsensitivity: 27,
        CAAttributeTypeMotionAlarmCancelationDelay: 28,
        CAAttributeTypeWakeUpInterval: 29,
        CAAttributeTypeTamperAlarm: 30,
        CAAttributeTypeLinkQuality: 33,
        CAAttributeTypeInovaAlarmSystemState: 34,
        CAAttributeTypeInovaAlarmGroupState: 35,
        CAAttributeTypeInovaAlarmIntrusionState: 36,
        CAAttributeTypeInovaAlarmErrorState: 37,
        CAAttributeTypeInovaAlarmDoorState: 38,
        CAAttributeTypeInovaAlarmExternalSensor: 39,
        CAAttributeTypeButtonState: 40,
        CAAttributeTypeHue: 41,
        CAAttributeTypeColorTemperature: 42,
        CAAttributeTypeHardwareRevision: 43,
        CAAttributeTypeFirmwareRevision: 44,
        CAAttributeTypeSoftwareRevision: 45,
        CAAttributeTypeLEDState: 46,
        CAAttributeTypeLEDStateWhenOn: 47,
        CAAttributeTypeLEDStateWhenOff: 48,
        CAAttributeTypeHighTemperatureAlarm: 52,
        CAAttributeTypeHighTemperatureAlarmTreshold: 53,
        CAAttributeTypeLowTemperatureAlarm: 54,
        CAAttributeTypeLowTemperatureAlarmTreshold: 55,
        CAAttributeTypeTamperSensitivity: 56,
        CAAttributeTypeTamperAlarmCancelationDelay: 57,
        CAAttributeTypeBrightnessReportInterval: 58,
        CAAttributeTypeTemperatureReportInterval: 59,
        CAAttributeTypeMotionAlarmIndicationMode: 60,
        CAAttributeTypeLEDBrightness: 61,
        CAAttributeTypeTamperAlarmIndicationMode: 62,
        CAAttributeTypeSwitchType: 63,
        CAAttributeTypeTemperatureOffset: 64,
        CAAttributeTypeAccumulatedWaterUse: 65,
        CAAttributeTypeAccumulatedWaterUseLastMonth: 66,
        CAAttributeTypeCurrentDate: 67,
        CAAttributeTypeLeakAlarm: 68,
        CAAttributeTypeBatteryLowAlarm: 69,
        CAAttributeTypeMalfunctionAlarm: 70,
        CAAttributeTypeLinkQualityAlarm: 71,
        CAAttributeTypeMode: 72,
        CAAttributeTypeCalibration: 75,
        CAAttributeTypePresenceAlarm: 76,
        CAAttributeTypeMinimumAlarm: 77,
        CAAttributeTypeMaximumAlarm: 78,
        CAAttributeTypeOilAlarm: 79,
        CAAttributeTypeWaterAlarm: 80,
        CAAttributeTypeInovaAlarmInhibition: 81,
        CAAttributeTypeInovaAlarmEjection: 82,
        CAAttributeTypeInovaAlarmCommercialRef: 83,
        CAAttributeTypeInovaAlarmSerialNumber: 84,
        CAAttributeTypeRadiatorThermostatSummerMode: 85,
        CAAttributeTypeInovaAlarmOperationMode: 86,
        CAAttributeTypeAutomaticMode: 87,
        CAAttributeTypePollingInterval: 88,
        CAAttributeTypeFeedTemperature: 89,
        CAAttributeTypeDisplayOrientation: 90,
        CAAttributeTypeManualOperation: 91,
        CAAttributeTypeDeviceTemperature: 92,
        CAAttributeTypeSonometer: 93,
        CAAttributeTypeAirPressure: 94,
        CAAttributeTypeInovaAlarmAntimask: 99,
        CAAttributeTypeInovaAlarmBackupSupply: 100,
        CAAttributeTypeRainFall: 101,
        CAAttributeTypeInovaAlarmGeneralHomeCommand: 103,
        CAAttributeTypeInovaAlarmAlert: 104,
        CAAttributeTypeInovaAlarmSilentAlert: 105,
        CAAttributeTypeInovaAlarmPreAlarm: 106,
        CAAttributeTypeInovaAlarmDeterrenceAlarm: 107,
        CAAttributeTypeInovaAlarmWarning: 108,
        CAAttributeTypeInovaAlarmFireAlarm: 109,
        CAAttributeTypeUpTime: 110,
        CAAttributeTypeDownTime: 111,
        CAAttributeTypeShutterBlindMode: 112,
        CAAttributeTypeShutterSlatPosition: 113,
        CAAttributeTypeShutterSlatTime: 114,
        CAAttributeTypeRestartDevice: 115,
        CAAttributeTypeSoilMoisture: 116,
        CAAttributeTypeWaterPlantAlarm: 117,
        CAAttributeTypeMistPlantAlarm: 118,
        CAAttributeTypeFertilizePlantAlarm: 119,
        CAAttributeTypeCoolPlantAlarm: 120,
        CAAttributeTypeHeatPlantAlarm: 121,
        CAAttributeTypePutPlantIntoLightAlarm: 122,
        CAAttributeTypePutPlantIntoShadeAlarm: 123,
        CAAttributeTypeColorMode: 124,
        CAAttributeTypeTargetTemperatureLow: 125,
        CAAttributeTypeTargetTemperatureHigh: 126,
        CAAttributeTypeHVACMode: 127,
        CAAttributeTypeAway: 128,
        CAAttributeTypeHVACState: 129,
        CAAttributeTypeHasLeaf: 130,
        CAAttributeTypeSetEnergyConsumption: 131,
        CAAttributeTypeCOAlarm: 132,
        CAAttributeTypeRestoreLastKnownState: 133,
        CAAttributeTypeLastImageReceived: 134,
        CAAttributeTypeUpDown: 135,
        CAAttributeTypeRequestVOD: 136,
        CAAttributeTypeInovaDetectorHistory: 137,
        CAAttributeTypeSurgeAlarm: 138,
        CAAttributeTypeLoadAlarm: 139,
        CAAttributeTypeOverloadAlarm: 140,
        CAAttributeTypeVoltageDropAlarm: 141,
        CAAttributeTypeShutterOrientation: 142,
        CAAttributeTypeOverCurrentAlarm: 143,
        CAAttributeTypeSirenMode: 144,
        CAAttributeTypeAlarmAutoStopTime: 145,
        CAAttributeTypeWindSpeed: 146,
        CAAttributeTypeWindDirection: 147,
        CAAttributeTypeComfortTemperature: 148,
        CAAttributeTypeEcoTemperature: 149,
        CAAttributeTypeReduceTemperature: 150,
        CAAttributeTypeProtectTemperature: 151,
        CAAttributeTypeInovaSystemTime: 152,
        CAAttributeTypeInovaCorrespondentProtocol: 153,
        CAAttributeTypeInovaCorrespondentID: 154,
        CAAttributeTypeInovaCorrespondentListen: 155,
        CAAttributeTypeInovaCorrespondentNumber: 156,
        CAAttributeTypeInovaCallCycleFireProtection: 157,
        CAAttributeTypeInovaCallCycleIntrusion: 158,
        CAAttributeTypeInovaCallCycleTechnicalProtect: 159,
        CAAttributeTypeInovaCallCycleFaults: 160,
        CAAttributeTypeInovaCallCycleDeterrence: 161,
        CAAttributeTypeInovaCallCyclePrealarm: 162,
        CAAttributeTypeInovaPSTNRings: 163,
        CAAttributeTypeInovaDoubleCallRings: 164,
        CAAttributeTypeInovaPIN: 165,
        CAAttributeTypeInovaPUK: 166,
        CAAttributeTypeInovaMainMediaSelection: 167,
        CAAttributeTypeRainFallLastHour: 168,
        CAAttributeTypeRainFallToday: 169,
        CAAttributeTypeIdentificationMode: 170,
        CAAttributeTypeButtonDoubleClick: 171,
        CAAttributeTypeSirenTriggerMode: 172,
        CAAttributeTypeUV: 173,
        CAAttributeTypeSlatSteps: 174,
        CAAttributeTypeEcoModeConfig: 175,
        CAAttributeTypeButtonLongRelease: 176,
        CAAttributeTypeVisualGong: 177,
        CAAttributeTypeAcousticGong: 178,
        CAAttributeTypeSurveillanceOnOff: 179,
        CAAttributeTypeNetatmoCameraURL: 180,
        CAAttributeTypeSdState: 181,
        CAAttributeTypeAdapterState: 182,
        CAAttributeTypeNetatmoHome: 183,
        CAAttributeTypeNetatmoPerson: 184,
        CAAttributeTypeNetatmoLastEventPersonId: 185,
        CAAttributeTypeNetatmoLastEventTime: 186,
        CAAttributeTypeNetatmoLastEventType: 187,
        CAAttributeTypeNetatmoLastEventIsKnownPerson: 188,
        CAAttributeTypeNetatmoLastEventIsArrival: 189,
        CAAttributeTypePresenceTimeout: 190,
        CAAttributeTypeKnownPersonPresence: 191,
        CAAttributeTypeUnknownPersonPresence: 192,
        CAAttributeTypeCurrent: 193,
        CAAttributeTypeFrequency: 194,
        CAAttributeTypeVoltage: 195,
        CAAttributeTypePresenceAlarmCancelationDelay: 196,
        CAAttributeTypePresenceAlarmDetectionDelay: 197,
        CAAttributeTypePresenceAlarmThreshold: 198,
        CAAttributeTypeNetatmoThermostatMode: 199,
        CAAttributeTypeNetatmoRelayBoilerConnected: 200,
        CAAttributeTypeNetatmoRelayMac: 201,
        CAAttributeTypeNetatmoThermostatModeTimeout: 202,
        CAAttributeTypeNetatmoThermostatNextChange: 203,
        CAAttributeTypeNetatmoThermostatPrograms: 204,
        CAAttributeTypeHomeeMode: 205,
        CAAttributeTypeColorWhite: 206,
        CAAttributeTypeMovementAlarm: 207,
        CAAttributeTypeMovementSensitivity: 208,
        CAAttributeTypeVibrationAlarm: 209,
        CAAttributeTypeVibrationSensitivity: 210,
        CAAttributeTypeAverageEnergyUse: 211,
        CAAttributeTypeBinaryInputMode: 212,
        CAAttributeTypeDeviceStatus: 213,
        CAAttributeTypeDeviceRemainingTime: 214,
        CAAttributeTypeDeviceStartTime: 215,
        CAAttributeTypeDeviceProgram: 216,
        CAAttributeTypeButtonPressed3Times: 223,
        CAAttributeTypeButtonPressed4Times: 224,
        CAAttributeTypeButtonPressed5Times: 225,
        CAAttributeTypeRepeaterMode: 226,
        CAAttributeTypeAutoOffTime: 227,
        CAAttributeTypeGustSpeed: 230,
        CAAttributeTypeGustDirection: 231,
        CAAttributeTypeLockState: 232,
    },
    CANodeProfile: {
        CANodeProfileNone: 0,
        CANodeProfileHomee: 1,
        CANodeProfileOnOffPlug: 10,
        CANodeProfileDimmableMeteringSwitch: 11,
        CANodeProfileMeteringSwitch: 12,
        CANodeProfileMeteringPlug: 13,
        CANodeProfileDimmablePlug: 14,
        CANodeProfileDimmableSwitch: 15,
        CANodeProfileOnOffSwitch: 16,
        CANodeProfileDoubleOnOffSwitch: 18,
        CANodeProfileDimmableMeteringPlug: 19,
        CANodeProfileOneButtonRemote: 20,
        CANodeProfileBinaryInput: 21,
        CANodeProfileDimmableColorMeteringPlug: 22,
        CANodeProfileDoubleBinaryInput: 23,
        CANodeProfileTwoButtonRemote: 24,
        CANodeProfileThreeButtonRemote: 25,
        CANodeProfileFourButtonRemote: 26,
        CANodeProfileAlarmSensor: 27,
        CANodeProfileDoubleOnOffPlug: 28,
        CANodeProfileOnOffSwitchWithBinaryInput: 29,
        CANodeProfileWatchDogWithPressureAndTemperatures: 30,
        CANodeProfileFibaroButton: 31,
        CANodeProfileEnergyMeter: 32,
        CANodeProfileDoubleMeteringSwitch: 33,

        CANodeProfileBrightnessSensor: 1000,
        CANodeProfileDimmableColorLight: 1001,
        CANodeProfileDimmableExtendedColorLight: 1002,
        CANodeProfileDimmableColorTemperatureLight: 1003,
        CANodeProfileDimmableLight: 1004,
        CANodeProfileDimmableLightWithBrightnessSensor: 1005,
        CANodeProfileDimmableLightWithBrightnessAndPresenceSensor: 1006,
        CANodeProfileDimmableLightWithPresenceSensor: 1007,
        CANodeProfileDimmableRGBWLight: 1008,

        CANodeProfileOpenCloseSensor: 2000,
        CANodeProfileWindowHandle: 2001,
        CANodeProfileShutterPositionSwitch: 2002,
        CANodeProfileOpenCloseAndTemperatureSensor: 2003,
        CANodeProfileElectricMotorMeteringSwitch: 2004,
        CANodeProfileOpenCloseWithTemperatureAndBrightnessSensor: 2005,
        CANodeProfileElectricMotorMeteringSwitchWithoutSlatPosition: 2006,
        CANodeProfileLock: 2007,

        CANodeProfileTemperatureAndHumiditySensor: 3001,
        CANodeProfileCO2Sensor: 3002,
        CANodeProfileRoomThermostat: 3003,
        CANodeProfileRoomThermostatWithHumiditySensor: 3004,
        CANodeProfileBinaryInputWithTemperatureSensor: 3005,
        CANodeProfileRadiatorThermostat: 3006,
        CANodeProfileTemperatureSensor: 3009,
        CANodeProfileHumiditySensor: 3010,
        CANodeProfileWaterValve: 3011,
        CANodeProfileWaterMeter: 3012,
        CANodeProfileWeatherStation: 3013,
        CANodeProfileNetatmoMainModule: 3014,
        CANodeProfileNetatmoOutdoorModule: 3015,
        CANodeProfileNetatmoIndoorModule: 3016,
        CANodeProfileNetatmoRainModule: 3017,
        CANodeProfileCosiThermChannel: 3018,
        CANodeProfileNestThermostatWithCooling: 3020,
        CANodeProfileNestThermostatWithHeating: 3021,
        CANodeProfileNestThermostatWithHeatingAndCooling: 3022,
        CANodeProfileNetatmoWindModule: 3023,
        CANodeProfileElectricalHeating: 3024,
        CANodeProfileValveDrive: 3025,
        CANodeProfileNetatmoCamera: 3026,
        CANodeProfileNetatmoThermostat: 3027,
        CANodeProfileNetatmoTags: 3028,

        CANodeProfileMotionDetectorWithTemperatureBrightnessAndHumiditySensor: 4010,
        CANodeProfileMotionDetector: 4011,
        CANodeProfileSmokeDetector: 4012,
        CANodeProfileFloodDetector: 4013,
        CANodeProfilePresenceDetector: 4014,
        CANodeProfileMotionDetectorWithTemperatureAndBrightnessSensor: 4015,
        CANodeProfileSmokeDetectorWithTemperatureSensor: 4016,
        CANodeProfileFloodDetectorWithTemperatureSensor: 4017,
        CANodeProfileWatchDogDevice: 4018,
        CANodeProfileLAG: 4019,
        CANodeProfileOWU: 4020,
        CANodeProfileEurovac: 4021,
        CANodeProfileOWWG3: 4022,
        CANodeProfileEuropress: 4023,
        CANodeProfileMinimumDetector: 4024,
        CANodeProfileMaximumDetector: 4025,
        CANodeProfileSmokeDetectorAndCODetector: 4026,
        CANodeProfileSiren: 4027,
        CANodeProfileMotionDetectorWithOpenCloseTemperatureAndBrightnessSensor: 4028,
        CANodeProfileMotionDetectorWithBrightness: 4029,
        CANodeProfileDoorbell: 4030,
        CANodeProfileSmokeDetectorAndSiren: 4031,
        CANodeProfileFloodDetectorWithTemperatureAndHumiditySensor: 4032,
        CANodeProfileMinimumDetectorWithTemperatureSensor: 4033,
        CANodeProfileMaximumDetectorWithTemperatureSensor: 4034,
        CANodeProfilePresenceDetectorWithTemperatureAndBrightnessSensor: 4035,
        CANodeProfileCODetector: 4036,

        CANodeProfileInovaAlarmSystem: 5000,
        CANodeProfileInovaDetector: 5001,
        CANodeProfileInovaSiren: 5002,
        CANodeProfileInovaCommand: 5003,
        CANodeProfileInovaTransmitter: 5004,
        CANodeProfileInovaReciever: 5005,
        CANodeProfileInovaKoala: 5006,
        CANodeProfileInovaInternalTransmitter: 5007,
        CANodeProfileInovaControlPanel: 5008,
        CANodeProfileInovaInputOutputExtension: 5009,
        CANodeProfileInovaMotionDetectorWithVOD: 5010,
        CANodeProfileInovaMotionDetector: 5011,

        CANodeProfileWashingMachine: 6000,
        CANodeProfileTumbleDryer: 6001,
        CANodeProfileDishwasher: 6002,
    },
};
