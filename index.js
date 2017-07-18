'use strict';

let Accessory, Service, Characteristic, UUIDGen;
const Homee = require("./lib/homee");
const nodeTypes = require("./lib/node_types");
let HomeeAccessory;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
    Accessory = homebridge.platformAccessory;

    HomeeAccessory = require("./accessories/HomeeAccessory.js")(Service, Characteristic);

    homebridge.registerPlatform("homebridge-homee", "Homee", HomeePlatform, false);
};

function HomeePlatform(log, config, api) {
    this.log = log;
    this.homee = new Homee(config.host, config.user, config.pass);
    this.nodes = [];
    this.foundAccessories = [];

    const that = this;

    that.homee
        .connect()
        .then(() => {
            that.log("connected to homee");
        })
        .catch(err => {
            that.log(err);
        });

    if (api) {
        this.api = api;
    }
}

HomeePlatform.prototype.accessories = function(callback) {
    let that = this;

    if (!that.homee.connected) {
        that.log("Failed getting devices. Retrying...");
        setTimeout(() => {
            that.accessories(callback);
        }, 2000);
        return;
    }

    that.homee.send("GET:nodes");

    that.homee.listen(message => {

        if (Object.keys(message)[0] === "nodes" && !that.foundAccessories.length) {
            for (let i = 0; i < message.nodes.length; i++) {
                if (message.nodes[i].id < 1) continue;

                let name = decodeURI(message.nodes[i].name);
                let uuid = UUIDGen.generate(name + '-' + message.nodes[i].id);
                let newAccessory = '';
                let nodeType = nodeTypes.getAccessoryTypeByNodeProfile(message.nodes[i].profile);

                if (nodeType) {
                    that.log(name + ': ' + nodeType);
                    newAccessory = new HomeeAccessory(name, uuid, nodeType, message.nodes[i], that);
                } else {
                    that.log(name + ': unknown Accessory Type');
                }

                if (newAccessory) {
                    that.foundAccessories.push(newAccessory);
                }
            }

            callback(that.foundAccessories);
        }
    });
};
