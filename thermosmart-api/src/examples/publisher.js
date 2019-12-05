// THIS IS AN EXAMPLE

var mqtt = require('mqtt');
let myUrl = 'myURL';

// create the connection with mqtt broker
var client = mqtt.connect(myUrl);

// bind event when successfully connect to broker
client.on('connect', function () {
    console.log(`mqtt client connected`);

    setInterval(function () {
        // public a new message in one topic
        client.publish('mytopic', 'Hello mqtt');
        console.log('Message Sent');
    }, 5000);
});