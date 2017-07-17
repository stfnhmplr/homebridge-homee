/**
 * created by stfnhmplr on 11.01.17
 * control your Homee via websocket with node.js
 */
const WebSocket = require("ws");
const hash = require("crypto-toolkit").Hash("hex");
const request = require("request");

const Homee = function(host, user, pass) {
    this.host = host;
    this.user = user;
    this.pass = pass;
    this.ws = null;
    this.connected = false;
};

/**
 * [getAccesToken description]
 * @type {Promise}
 */
Homee.prototype.getAccessToken = function() {
    let options = {
        url: "http://" + this.host + ":7681/access_token",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            device_name: "iPhone",
            device_hardware_id: "rrr",
            device_os: 2,
            device_type: 1,
            device_app: 1,
            device_push_registration_id: 1284
        },
        auth: {
            user: this.user,
            pass: hash.sha512(this.pass)
        }
    };

    return new Promise(function(resolve, reject) {
        request.post(options, function(err, res, body) {
            if (!err) {
                let token = body.split("&")[0].split("=")[1];
                resolve(token);
            } else {
                reject(
                    new Error(
                        "Homee: Error while receiving AccessToken: " + err
                    )
                );
            }
        });
    });
};

/**
 * [connect description]
 * @type {Promise}
 */
Homee.prototype.connect = function() {
    let that = this;

    return new Promise(function(resolve, reject) {
        that
            .getAccessToken()
            .then((token) => {
                that.ws = new WebSocket(
                    "ws://" +
                        that.host +
                        ":7681/connection?access_token=" +
                        token,
                    {
                        protocol: "v2",
                        protocolVersion: 13,
                        origin: "http://" + that.host + ":7681"
                    },
                    function(err) {
                        reject(err);
                    }
                );

                that.ws.on("open", function open() {
                    that.connected = true;
                    that.startHeartbeatHandler();
                    resolve();
                });
            })
            .catch(function(err) {
                reject(err);
            });
    });
};

/**
 * [listen description]
 * @return {[type]} [description]
 */
Homee.prototype.listen = function(callback) {
    this.ws.on('message', function(message) {
        callback(JSON.parse(message));
    });
};

/**
 * sends a message via websocket
 * @param  {String} message the message, i.e. 'GET:nodes'
 */
Homee.prototype.send = function(message) {
    this.ws.send(message);
};


Homee.prototype.startHeartbeatHandler = function () {
    let that = this;

    this.ws.on('pong', function () {
        that.connected = true;
    });

    setInterval(function ping() {
        if (that.ws && that.connected === false) return that.ws.terminate();
        that.connected = false;
        that.ws.ping('', false, true);
    }, 30000);
}

module.exports = Homee;
