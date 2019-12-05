const mqtt = require('mqtt');
// from heroku
let url = require('url');

// Parse

class MqttHandler {
    lsconstructor() {
    }

    connect() {
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
    }

    subscribeToTopic(topic) {
        // mqtt subscriptions
        this.mqttClient.subscribe(topic, { qos: 0 });
    }

    // Sends a mqtt message to topic: mytopic
    sendMessage(message) {
        this.mqttClient.publish(this.topic, message);
    }
}

module.exports = MqttHandler;
