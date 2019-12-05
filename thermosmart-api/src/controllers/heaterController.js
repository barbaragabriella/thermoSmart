// heaterController.js
// Import heater model
Heater = require('../models/heaterModel');
const consts = require('../helpers/consts');
const mqttClient = require('../helpers/mqttPublisher');

// Handle index actions
exports.index = function (req, res) {
    Heater.get(function (err, heaters) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Heaters retrieved successfully",
            data: heaters
        });
    });
};

// Handle create heater actions
exports.new = function (req, res) {
    var heater = new Heater();
    heater.name = req.body.name ? req.body.name : heater.name;
    heater.status = req.body.status ? req.body.status : heater.status;
    heater.desiredTemperature = req.body.desiredTemperature ? req.body.desiredTemperature : heater.desiredTemperature;
    // save the heater and check for errors
    heater.save(function (err) {
        // Check for validation error
        if (err)
            res.json(err);
        else {
            returnObj = {
                message: 'New heater created!',
                type: consts.NEW,
                data: heater
            };
            mqttClient.sendMessage(consts.TOPIC_HEATERS, JSON.stringify(returnObj));
            res.json(returnObj);
        }
    });
};

// Handle view heater info
exports.view = function (req, res) {
    Heater.findById(req.params.heater_id, function (err, heater) {
        if (err)
            res.send(err);
        res.json({
            message: 'Heater details loading...',
            data: heater
        });
    });
};

// Handle update heater info
exports.update = function (req, res) {
    Heater.findById(req.params.heater_id, function (err, heater) {
        if (err)
            res.send(err);
        heater.name = req.body.name ? req.body.name : heater.name;
        heater.status = req.body.status ? req.body.status : heater.status;
        heater.desiredTemperature = req.body.desiredTemperature ? req.body.desiredTemperature : heater.desiredTemperature;
        // save the heater and check for errors
        heater.save(function (err) {
            if (err) {
                res.json(err);
            } else {
                returnObj = {
                    message: 'Heater Info updated!',
                    type: consts.UPDATE,
                    data: heater
                };
                mqttClient.sendMessage(consts.TOPIC_HEATERS, JSON.stringify(returnObj));
                res.json(returnObj);
            }
        });
    });
};

// Handle delete heater
exports.delete = function (req, res) {
    Heater.remove({
        _id: req.params.heater_id
    }, function (err, heater) {
        if (err) {
            res.send(err);
        } else {
            returnObj = {
                message: 'Heater deleted!',
                type: consts.DELETE,
                data: heater
            };
            mqttClient.sendMessage(consts.TOPIC_HEATERS, JSON.stringify(returnObj));
            res.json(returnObj);
        }
    });
};
