// sensorController.js
// Import sensor model
Sensor = require('../models/sensorModel');
const consts = require('../helpers/consts');
const mqttClient = require('../helpers/mqttPublisher');

// Handle index actions
exports.index = function (req, res) {
    Sensor.get(function (err, sensors) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Sensors retrieved successfully",
            data: sensors
        });
    });
};

// Handle create sensor actions
exports.new = function (req, res) {
    var sensor = new Sensor();
    sensor.name = req.body.name ? req.body.name : sensor.name;
    // save the sensor and check for errors
    sensor.save(function (err) {
        // Check for validation error
        if (err)
            res.json(err);
        else {
            returnObj = {
                message: 'New sensor created!',
                type: consts.NEW,
                data: sensor
            };
            mqttClient.sendMessage(consts.TOPIC_SENSOR, JSON.stringify(returnObj));
            res.json(returnObj);
        }
    });
};

// Handle view sensor info
exports.view = function (req, res) {
    Sensor.findById(req.params.sensor_id, function (err, sensor) {
        if (err)
            res.send(err);
        res.json({
            message: 'Sensor details loading...',
            data: sensor
        });
    });
};

// Handle update sensor info
exports.update = function (req, res) {
    Sensor.findById(req.params.sensor_id, function (err, sensor) {
        if (err)
            res.send(err);
        sensor.name = req.body.name ? req.body.name : sensor.name;
        // save the sensor and check for errors
        sensor.save(function (err) {
            if (err) {
                res.json(err);
            } else {
                returnObj = {
                    message: 'Sensor Info updated!',
                    type: consts.UPDATE,
                    data: sensor
                };
                mqttClient.sendMessage(consts.TOPIC_SENSOR, JSON.stringify(returnObj));
                res.json(returnObj);
            }
        });
    });
};

// Handle delete sensor
exports.delete = function (req, res) {
    Sensor.remove({
        _id: req.params.sensor_id
    }, function (err, sensor) {
        if (err) {
            res.send(err);
        } else {
            returnObj = {
                message: 'Sensor deleted!',
                type: consts.DELETE,
                data: sensor
            };
            mqttClient.sendMessage(consts.TOPIC_SENSOR, JSON.stringify(returnObj));
            res.json(returnObj);
        }
    });
};
