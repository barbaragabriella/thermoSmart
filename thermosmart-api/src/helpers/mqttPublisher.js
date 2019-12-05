// -----------------------------------------------------------------------------------------------
// mqtt
const mqtt = require('mqtt');
const consts = require('../helpers/consts');

// Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
console.log('attempting to connect to mosca broker');
this.mqttClient = mqtt.connect(process.env.CLOUDMQTT_URL || 'mqtt://localhost:...');
console.log('Successfully connected to mosca broker');

// Mqtt error calback
this.mqttClient.on('error', (err) => {
    console.log(err);
    this.mqttClient.end();
});

// Connection callback
this.mqttClient.on('connect', () => {
    console.log(`mqtt client connected`);
});

// When a message arrives, console.log it
this.mqttClient.on('message', function (topic, message) {
    console.log(message.toString());
});

this.mqttClient.on('close', () => {
    console.log(`mqtt client disconnected`);
});

// mqtt subscriptions
this.mqttClient.subscribe(consts.TOPIC_SENSOR, { qos: 0 });
this.mqttClient.subscribe(consts.TOPIC_MEASUREMENTS, { qos: 0 });
this.mqttClient.subscribe(consts.TOPIC_HEATERS, { qos: 0 });
this.mqttClient.subscribe(consts.TOPIC_HEATERS_CHANGE_HISTORIES, { qos: 0 });

// -----------------------------------------------------------------------------------------------

module.exports.sendMessage = function(topic, message) {
    this.mqttClient.publish(topic, message);
};