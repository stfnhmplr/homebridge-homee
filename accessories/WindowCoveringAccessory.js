const ENUMS = require('../lib/enums.js');

function WindowCoveringAccessory(name, uuid, profile, node, platform) {
   this.name = name;
   this.uuid = uuid;
   this.platform = platform
   this.log = platform.log;
   this.nodeId = node.id;
   this.profile = profile;
   this.attributes = {};
   this.positions = [2,2,2,1,0];

   for (let i=0; i<node.attributes.length; i++) {
       switch (node.attributes[i].type) {
           case ENUMS.CAAttributeType.CAAttributeTypePosition:
               this.attributes.position = node.attributes[i];
               break;
           case ENUMS.CAAttributeType.CAAttributeTypeUpDown:
               this.attributes.upDown = node.attributes[i];
               break;
       }
   }
}

WindowCoveringAccessory.prototype.updateValue = function (attribute) {
   switch (attribute.type) {
       case ENUMS.CAAttributeType.CAAttributeTypePosition:

           if(attribute.current_value !== 100-this.service.getCharacteristic(Characteristic.CurrentPosition).value && attribute.current_value === attribute.target_value) {
               this.service.getCharacteristic(Characteristic.CurrentPosition)
                   .updateValue(100-attribute.current_value, null, 'ws');
               this.log.debug(this.name + ': CurrentPosition:' + attribute.current_value);
           }

           if(attribute.target_value !== 100-this.service.getCharacteristic(Characteristic.TargetPosition).value) {
               this.service.getCharacteristic(Characteristic.TargetPosition)
                   .updateValue(100-attribute.target_value, null, 'ws');
               this.log.debug(this.name + ': TargetPosition:' + attribute.target_value);
           }

           break;
       case ENUMS.CAAttributeType.CAAttributeTypeUpDown:
           this.service.getCharacteristic(Characteristic.PositionState)
               .updateValue(this.positions[attribute.current_value], null, 'ws');
           this.log.debug(this.name + ': PositionState:' + attribute.current_value);
           break;
   }
}

WindowCoveringAccessory.prototype.setTargetPosition = function (value, callback, context) {
   if (context && context == 'ws') {
       callback(null, value);
       return;
   }

   let newValue = 100-value;

   this.log.debug('Setting ' + this.name + ' to ' + newValue);
   this.platform.homee.send(
       'PUT:/nodes/' + this.nodeId + '/attributes/' + this.attributes.position.id + '?target_value=' + newValue
   );

   callback(null, value);
}


WindowCoveringAccessory.prototype.getServices = function () {
   let informationService = new Service.AccessoryInformation();

   informationService
       .setCharacteristic(Characteristic.Manufacturer, "Homee")
       .setCharacteristic(Characteristic.Model, "WindowCovering")
       .setCharacteristic(Characteristic.SerialNumber, "");

   this.service = new Service.WindowCovering(this.name);

   this.service.getCharacteristic(Characteristic.CurrentPosition)
       .updateValue(100-this.attributes.position.current_value);

   this.service.getCharacteristic(Characteristic.TargetPosition)
       .updateValue(100-this.attributes.position.target_value)
       .on('set', this.setTargetPosition.bind(this));

   this.service.getCharacteristic(Characteristic.PositionState)
       .updateValue(this.positions[this.attributes.upDown.current_value])

   return [informationService, this.service];
};

module.exports = function(oService, oCharacteristic) {
   Service = oService;
   Characteristic = oCharacteristic;

   return WindowCoveringAccessory;
};
