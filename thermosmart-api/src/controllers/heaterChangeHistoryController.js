// heaterChangeHistoryController.js
// Import heaterChangeHistory model
Heater = require('../models/heaterModel');
HeaterChangeHistory = require('../models/heaterChangeHistoryModel');
const consts = require('../helpers/consts');
const mqttClient = require('../helpers/mqttPublisher');

// Handle index actions
exports.index = function (req, res) {
    HeaterChangeHistory
        .find({ heater: req.params.heater_id })
        .sort({ dateTime: -1 })
        .exec(function (err, heaterChangeHistories) {
            if (err) {
                res.send(err);
            } else {
                res.json({
                    status: "success",
                    message: "Heater change history retrieved successfully",
                    data: heaterChangeHistories
                });
            }
        });
};

// Handle create heaterChangeHistory actions
exports.new = function (req, res) {
    var heaterChangeHistory = new HeaterChangeHistory();

    heaterChangeHistory.status = req.body.status;
    heaterChangeHistory.dateTime = req.body.dateTime;
    heaterChangeHistory.heater = req.params.heater_id;

    // save the heater and check for errors
    heaterChangeHistory.save(function (err) {
        if (err) {
            res.json(err);
        } else {
            returnObj = {
                message: 'New change in heater created!',
                type: consts.NEW,
                data: heaterChangeHistory
            };
            mqttClient.sendMessage(consts.TOPIC_HEATERS_CHANGE_HISTORIES, JSON.stringify(returnObj));
            res.json(returnObj);
        }
    });
};

// Handle index actions
exports.last = function (req, res) {
    HeaterChangeHistory
        .find({ heater: { $in: [req.params.heater_id] } })
        .sort({ dateTime: -1 })
        .limit(Number(req.params.limit))
        .exec(function (err, heaterChangeHistory) {
            if (err) {
                res.json(err);
            } else {
                res.json({
                    status: "success",
                    message: "Heater change history retrieved successfully",
                    data: heaterChangeHistory
                });
            }
        });
};
