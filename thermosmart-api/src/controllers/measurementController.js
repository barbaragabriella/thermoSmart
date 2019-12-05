// measurementController.js
// Import measurement model
Sensor = require('../models/sensorModel');
Measurement = require('../models/measurementModel');
const consts = require('../helpers/consts');
const mqttClient = require('../helpers/mqttPublisher');

// Handle index actions
exports.index = function (req, res) {
    Measurement
        .find({ sensor: req.params.sensor_id })
        .sort({ dateTime: -1 })
        .exec(function (err, measurements) {
            if (err) {
                res.send(err);
            } else {
                res.json({
                    status: "success",
                    message: "Measurements retrieved successfully",
                    data: measurements
                });
            }
        });
};

// Handle create measurement actions
exports.new = function (req, res) {
    var measurement = new Measurement();

    measurement.dateTime = req.body.dateTime;
    measurement.value = req.body.value;
    measurement.sensor = req.params.sensor_id;

    // save the sensor and check for errors
    measurement.save(function (err) {
        if (err) {
            res.json(err);
        } else {
            returnObj = {
                message: 'New measurement created!',
                type: consts.NEW,
                data: measurement
            };
            mqttClient.sendMessage(consts.TOPIC_MEASUREMENTS, JSON.stringify(returnObj));
            res.json(returnObj);
        }
    });
};

// Handle index actions
exports.last = function (req, res) {
    Measurement
        .find({ sensor: { $in: [req.params.sensor_id] } })
        .sort({ dateTime: -1 })
        .limit(Number(req.params.limit))
        .exec(function (err, measurements) {
            if (err) {
                res.json(err);
            } else {
                res.json({
                    status: "success",
                    message: "Measurements retrieved successfully",
                    data: measurements
                });
            }
        });
};
