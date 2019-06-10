'use strict';

let Accessory, Service, Characteristic, UUIDGen;
const Homee = require("homee-api");
const nodeTypes = require("./lib/node_types");
let HomeeAccessory, WindowCoveringAccessory, HomeegramAccessory;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
    Accessory = homebridge.platformAccessory;

    HomeeAccessory = require("./accessories/HomeeAccessory.js")(Service, Characteristic);
    WindowCoveringAccessory = require("./accessories/WindowCoveringAccessory.js")(Service, Characteristic);
    HomeegramAccessory = require("./accessories/HomeegramAccessory.js")(Service, Characteristic);

    homebridge.registerPlatform("homebridge-homee", "homee", HomeePlatform, false);
};

class HomeePlatform {

    /**
     * create a new instance
     * @param log
     * @param config
     * @param api
     */
    constructor(log, config, api) {
        this.log = log;
        this.homee = new Homee(config.host, config.user, config.pass);
        this.nodes = [];
        this.homeegrams = [];
        this.foundAccessories = [];
        this.attempts = 0;
        this.connected = false;
        this.groupName = config.groupName || 'homebridge';

        if (api) this.api = api;

        this.homee.on('message', message => this.handleMessage(message));
        this.homee.on('error', err => this.log.error(err));
        this.homee.on('disconnect', () => {
            this.log('disconnected from homee');
            this.connected = false;
        });

        this.homee.connect()
            .then(() => {
                this.log("connected to homee");
                this.connected = true;
                this.homee.send('GET:all');
            })
            .catch(err => this.log.error(err));
    }

    /**
     * create accessories
     * @param callback
     */
    accessories (callback) {
        if (this.attempts > 10) {
            throw new Error("Can't get devices or homeegrams. Please check that homee is online and your config is ok");
        }

        this.attempts++;

        if (!this.connected) {
            this.log("Not connected to homee. Retrying...");
            setTimeout(() => this.accessories(callback), 2000);
            return;
        }

        if (!this.nodes.length && !this.homeegrams.length) {
            this.log("Didn't receive any devices or homeegrams. Retrying...");
            setTimeout(() => this.accessories(callback), 2000);
            return;
        }

        for (let node of this.nodes) {
            if (node.id < 1) continue;

            let name = decodeURI(node.name);
            let uuid = UUIDGen.generate('homee-' + node.id);
            let newAccessory;
            let nodeType = nodeTypes.getAccessoryTypeByNodeProfile(node.profile);

            if (nodeType === 'WindowCovering') {
                this.log.debug(name + ': ' + nodeType);
                newAccessory = new WindowCoveringAccessory(name, uuid, nodeType, node, this);
            } else if (nodeType === 'DoubleSwitch') {
                this.log.debug(name + ': ' + nodeType);
                this.foundAccessories.push(new HomeeAccessory(name + '-1', uuid, 'Switch', node, this, 1))
                let uuid2 = UUIDGen.generate('homee-' + node.id + '2');
                newAccessory = new HomeeAccessory(name + '-2', uuid2, 'Switch', node, this, 2);
            } else if (nodeType) {
                this.log.debug(name + ': ' + nodeType);
                newAccessory = new HomeeAccessory(name, uuid, nodeType, node, this);
            } else {
                this.log.debug(name + ': unknown Accessory Type');
            }

            if (newAccessory) this.foundAccessories.push(newAccessory);

        }

        for (let homeegram of this.homeegrams) {
            let name = decodeURI(homeegram.name);
            let uuid = UUIDGen.generate('homee-hg-' + homeegram.id);
            let newAccessory = '';

            this.log.debug(name + ': Homeegram');
            newAccessory = new HomeegramAccessory(name, uuid, homeegram, this);
            this.foundAccessories.push(newAccessory);
        }

        callback(this.foundAccessories);
    }

    /**
     * filter nodes if group 'homebridge' exists
     * @param all
     * @returns {*[]}
     */
    filterDevices (all) {
        let groupId;
        let nodeIds = [];
        let homeegramIds = [];
        let filtered = {nodes: [], homeegrams: []};

        for (let group of all.groups) {
            if (group.name.match(new RegExp('^' + this.groupName + '$', 'i'))) {
                groupId = group.id;
            }
        }

        if (!groupId) {
            if (this.groupName !== "homebridge") {
                throw new Error("Specified group not found. Aborting Homebridge startup to prevent lost of accessories");
            } else {
                return [all.nodes, all.homeegrams];
            }
        }

        for (let relationship of all.relationships) {
            if (relationship.group_id === groupId) {
                nodeIds.push(relationship.node_id);
                homeegramIds.push(relationship.homeegram_id);
            }
        }

        for (let node of all.nodes) {
            if (nodeIds.indexOf(node.id) !== -1) {
                filtered.nodes.push(node);
            }
        }

        for (let homeegram of all.homeegrams) {
            if (homeegramIds.indexOf(homeegram.id) !== -1) {
                filtered.homeegrams.push(homeegram);
            }
        }

        return [filtered.nodes, filtered.homeegrams];
    }

    /**
     * handle incoming messages
     * @param message
     */
    handleMessage(message) {
        if (message.all && !this.foundAccessories.length) {
            [this.nodes, this.homeegrams] = this.filterDevices(message.all);
        } else if (message.attribute || message.node) {
            let attributes = message.node ? message.node.attributes : [message.attribute];

            for (let attribute of attributes) {
                let accessory = this.foundAccessories.find(a => a.nodeId === attribute.node_id);
                if (accessory) {
                    accessory.updateValue(attribute);
                    this.log.info('Updated accessory %s', accessory.name)
                }
            }
        }
    }
}
