const Homee = require('homee-api');
const nodeTypes = require('./lib/node_types');

let Characteristic;
let Service;
let Uuid;

let HomeeAccessory;
let WindowCoveringAccessory;
let HomeegramAccessory;
let RgbLightbulbAccessory;

class HomeePlatform {
  constructor(log, config, api) {
    this.log = log;
    this.homee = new Homee(config.host, config.user, config.pass, {
      device: 'homebridge',
      reconnect: true,
      reconnectInterval: 5000,
      maxRetries: Infinity,
    });
    this.nodes = [];
    this.homeegrams = [];
    this.foundAccessories = [];
    this.attempts = 0;
    this.connected = false;
    this.groupName = config.groupName || 'homebridge';

    if (api) this.api = api;

    this.homee.on('message', (message) => this.handleMessage(message));
    this.homee.on('error', (err) => this.log.error(err));
    this.homee.on('disconnect', () => {
      this.log('disconnected from homee');
      this.connected = false;
    });

    this.homee.connect()
      .then(() => {
        this.log('connected to homee');
        this.connected = true;
        this.homee.send('GET:all');
      })
      .catch((err) => this.log.error(err));
  }

  /**
     * create accessories
     * @param callback
     */
  accessories(callback) {
    if (this.attempts > 5) {
      throw new Error("Can't get devices or homeegrams. Please check that homee is online and your config is right");
    }

    this.attempts += 1;

    if (!this.connected) {
      this.log('Not connected to homee. Retrying...');
      setTimeout(() => this.accessories(callback), 2000);
      return;
    }

    if (!this.nodes.length && !this.homeegrams.length) {
      this.log("Didn't receive any devices or homeegrams. Retrying...");
      setTimeout(() => this.accessories(callback), 2000);
      return;
    }

    this.nodes.forEach((node) => {
      if (node.id < 1) return;

      const name = decodeURI(node.name);
      const uuid = Uuid.generate(`homee-${node.id}`);
      let newAccessory;
      const nodeType = nodeTypes.getAccessoryTypeByNodeProfile(node.profile);

      if (nodeType === 'WindowCovering') {
        this.log.debug(`${name}: ${nodeType}`);
        newAccessory = new WindowCoveringAccessory(name, uuid, nodeType, node, this);
      } else if (nodeType === 'DoubleSwitch') {
        this.log.debug(`${name}: ${nodeType}`);
        this.foundAccessories.push(new HomeeAccessory(`${name}-1`, uuid, 'Switch', node, this, 1));
        const uuid2 = Uuid.generate(`homee-${node.id}2`);
        newAccessory = new HomeeAccessory(`${name}-2`, uuid2, 'Switch', node, this, 2);
      } else if (nodeType === 'RGBLightbulb') {
        this.log.debug(`${name}: ${nodeType}`);
        this.foundAccessories.push(new RgbLightbulbAccessory(name, uuid, node, this));
      } else if (nodeType) {
        this.log.debug(`${name}: ${nodeType}`);
        newAccessory = new HomeeAccessory(name, uuid, nodeType, node, this);
      } else {
        this.log.debug(`${name}: unknown Accessory Type`);
      }

      if (newAccessory) this.foundAccessories.push(newAccessory);
    });

    this.homeegrams.forEach((homeegram) => {
      const name = decodeURI(homeegram.name);
      const uuid = Uuid.generate(`homee-hg-${homeegram.id}`);
      let newAccessory = '';

      this.log.debug(`${name}: Homeegram`);
      newAccessory = new HomeegramAccessory(name, uuid, homeegram, this);
      this.foundAccessories.push(newAccessory);
    });

    callback(this.foundAccessories);
  }

  /**
     * filter nodes if group 'homebridge' exists
     * @param all
     * @returns {*[]}
     */
  filterDevices(all) {
    let groupId;
    const nodeIds = [];
    const homeegramIds = [];
    const filtered = { nodes: [], homeegrams: [] };

    all.groups.forEach((group) => {
      if (group.name.match(new RegExp(`^${this.groupName}$`, 'i'))) {
        groupId = group.id;
      }
    });

    if (!groupId) return [all.nodes, all.homeegrams];

    all.relationships.forEach((relationship) => {
      if (relationship.group_id === groupId) {
        nodeIds.push(relationship.node_id);
        homeegramIds.push(relationship.homeegram_id);
      }
    });

    all.nodes.forEach((node) => {
      if (nodeIds.indexOf(node.id) !== -1) {
        filtered.nodes.push(node);
      }
    });

    all.homeegrams.forEach((homeegram) => {
      if (homeegramIds.indexOf(homeegram.id) !== -1) {
        filtered.homeegrams.push(homeegram);
      }
    });

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
      const attributes = message.node ? message.node.attributes : [message.attribute];

      attributes.forEach((attribute) => {
        const accessory = this.foundAccessories.find((a) => a.nodeId === attribute.node_id);
        if (accessory) {
          accessory.updateValue(attribute);
          this.log.info('Updated accessory %s', accessory.name);
        }
      });
    }
  }
}

module.exports = (homebridge) => {
  ({ Characteristic, Service, Uuid } = homebridge.hap);

  // eslint-disable-next-line global-require
  HomeeAccessory = require('./accessories/HomeeAccessory.js')(Service, Characteristic);
  // eslint-disable-next-line global-require
  WindowCoveringAccessory = require('./accessories/WindowCoveringAccessory.js')(Service, Characteristic);
  // eslint-disable-next-line global-require
  HomeegramAccessory = require('./accessories/HomeegramAccessory.js')(Service, Characteristic);
  // eslint-disable-next-line global-require
  RgbLightbulbAccessory = require('./accessories/RgbLightbulbAccessory.js')(Service, Characteristic);

  homebridge.registerPlatform('homebridge-homee', 'homee', HomeePlatform, false);
};
