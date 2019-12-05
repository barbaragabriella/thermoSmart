// THIS IS AN EXAMPLE

let mqtt = require('mqtt')
let myUrl = 'myUrl';

// create the connection with mqtt broker
var client = mqtt.connect(myUrl);

// bind event when successfully connect to broker
client.on('connect', function () {
    console.log(`mqtt client connected`);

    // subscribe with mqtt broker in one topic
    client.subscribe('measurements');
});

// bind event when a new message is posted
client.on('message', function (topic, message) {
    context = message.toString();
    console.log(topic + '\n' + context);
});