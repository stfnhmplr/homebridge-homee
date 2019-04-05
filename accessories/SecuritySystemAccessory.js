let Service, Characteristic;

class SecuritySystemAccessory {
    constructor(name, uuid, alarmGroup, platform) {
        this.name = name;
        this.uuid = uuid;
        this.platform = platform;
        this.log = platform.log;
        this.homee = platform.homee;
        this.attributeTypes = [
            this.homee.enums.CAAttributeType.CAAttributeTypeFloodAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeSiren,
            this.homee.enums.CAAttributeType.CAAttributeTypeSmokeAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeMotionAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeLeakAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypePresenceAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeOilAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeWaterAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeCOAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeMovementAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeVibrationAlarm,
            this.homee.enums.CAAttributeType.CAAttributeTypeCO2Alarm,
        ];

        const attributes = this.homee
            .getNodesByGroup(alarmGroup)
            .map(n => n.attributes)
            .reduce((a, b) => a.concat(b));

        this.tamperAlarmAttributes = attributes.filter(
            a => a.type === this.homee.enums.CAAttributeType.CAAttributeTypeTamperAlarm
        );
        this.alarmAttributes = attributes.filter(a => this.attributeTypes.indexOf(a.type) > -1);
        this.homeeModeAttribute = this.homee.attributes.find(
            a => a.type === this.homee.enums.CAAttributeType.CAAttributeTypeHomeeMode
        );

        this.homee.on('message', message => this.handleMessage(message));
    }

    /**
     * update homee mode
     * @param value
     * @param callback
     * @param context
     */
    setHomeeMode(value, callback, context) {
        if (context && context == 'ws') {
            callback(null, value);
            return;
        }

        this.log.debug(`setting homee Mode to ${this.getHomeeModeByHapSecurityState(value)}`);
        this.homee.setValue(
            this.homeeModeAttribute.node_id,
            this.homeeModeAttribute.id,
            this.getHomeeModeByHapSecurityState(value)
        );

        callback(null, value);
    }

    /**
     * updates the alarm state (triggered / reset)
     * @param attribute
     */
    updateAlarmState(attribute) {
        const attributeIndex = this.alarmAttributes.findIndex(a => a.id === attribute.id);
        this.alarmAttributes[attributeIndex] = attribute;

        const characteristic = this.service.getCharacteristic(
            Characteristic.SecuritySystemCurrentState
        );
        const DISARMED = Characteristic.SecuritySystemCurrentState.DISARMED;
        const ALARM_TRIGGERED = Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED;

        this.currentAlarmState = this.alarmAttributes.map(a => a.current_value).some(v => v > 0);

        // alarm state changed & state is not disarmed
        if (this.currentAlarmState !== this.oldAlarmState && characteristic.value !== DISARMED) {
            this.log.debug(`Alarm is on and state changed to ${this.currentAlarmState}`);
            if (this.currentAlarmState && characteristic.value !== ALARM_TRIGGERED) {
                this.log.info(`Alarm triggered`);
                characteristic.updateValue(ALARM_TRIGGERED, null, 'ws');
            } else if (!this.currentAlarmState && characteristic.value === ALARM_TRIGGERED) {
                this.log.info(`resetting alarm state`);
                characteristic.updateValue(
                    this.getHapSecurityStateByHomeeMode(this.homeeModeAttribute.current_value)
                );
            }
        }

        this.oldAlarmState = this.currentAlarmState;
    }

    /**
     * update the tamper alarm state
     * @param attribute
     */
    updateTamperAlarmState(attribute) {
        const attributeIndex = this.tamperAlarmAttributes.findIndex(a => a.id === attribute.id);
        this.tamperAlarmAttributes[attributeIndex] = attribute;

        const characteristic = this.service.getCharacteristic(Characteristic.StatusTampered);
        this.currentTamperAlarmState = this.tamperAlarmAttributes
            .map(a => a.current_value)
            .some(v => v > 0);

        if (
            this.currentTamperAlarmState !== this.oldTamperAlarmState &&
            characteristic.value !== this.currentTamperAlarmState
        ) {
            characteristic.updateValue(this.currentTamperAlarmState);
        }

        this.oldTamperAlarmState = this.currentTamperAlarmState;
    }

    /**
     * updates the security state based on homee Mode
     * @param attribute
     */
    updateSecurityState(attribute) {
        const characteristic = this.service.getCharacteristic(
            Characteristic.SecuritySystemCurrentState
        );

        if (
            attribute.current_value !== attribute.target_value ||
            (attribute.current_value !== 0 &&
                characteristic.value === characteristic.ALARM_TRIGGERED)
        )
            return;

        characteristic.updateValue(this.getHapSecurityStateByHomeeMode(attribute.current_value));
    }

    /**
     * translate HAP State to homee Mode
     * @param state
     * @returns {*}
     */
    getHapSecurityStateByHomeeMode(state) {
        const states = {
            0: Characteristic.SecuritySystemCurrentState.DISARMED,
            1: Characteristic.SecuritySystemCurrentState.NIGHT_ARM,
            2: Characteristic.SecuritySystemCurrentState.AWAY_ARM,
            3: Characteristic.SecuritySystemCurrentState.AWAY_ARM,
        };

        return states[state];
    }

    /**
     * translate homee Mode to HAP State
     * @param state
     * @returns {*}
     */
    getHomeeModeByHapSecurityState(state) {
        const states = {};
        states[Characteristic.SecuritySystemCurrentState.STAY_ARM] = 2;
        states[Characteristic.SecuritySystemCurrentState.AWAY_ARM] = 2;
        states[Characteristic.SecuritySystemCurrentState.NIGHT_ARM] = 1;
        states[Characteristic.SecuritySystemCurrentState.DISARMED] = 0;

        return states[state];
    }

    /**
     * return array of services
     * @returns {*[]}
     */
    getServices() {
        let informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, 'Homee')
            .setCharacteristic(Characteristic.Model, '')
            .setCharacteristic(Characteristic.SerialNumber, '');

        this.service = new Service.SecuritySystem(this.name);

        this.service
            .getCharacteristic(Characteristic.SecuritySystemCurrentState)
            .updateValue(
                this.getHapSecurityStateByHomeeMode(this.homeeModeAttribute.current_value)
            );

        this.service
            .getCharacteristic(Characteristic.SecuritySystemTargetState)
            .updateValue(this.getHapSecurityStateByHomeeMode(this.homeeModeAttribute.current_value))
            .on('set', this.setHomeeMode.bind(this));

        this.service.getCharacteristic(Characteristic.StatusTampered).updateValue(0);

        return [informationService, this.service];
    }

    /**
     * handle attribute changes
     * @param message
     */
    handleMessage(message) {
        if (!message.attribute && !message.node) return;
        const attributes = message.node ? message.node.attributes : [message.attribute];

        for (let attribute of attributes) {
            if (this.alarmAttributes.find(a => a.id === attribute.id)) {
                this.updateAlarmState(attribute);
            } else if (this.tamperAlarmAttributes.find(a => a.id === attribute.id)) {
                this.updateTamperAlarmState(attribute);
            } else if (attribute.id === this.homeeModeAttribute.id) {
                this.updateSecurityState(attribute);
            }
        }
    }
}

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return SecuritySystemAccessory;
};
