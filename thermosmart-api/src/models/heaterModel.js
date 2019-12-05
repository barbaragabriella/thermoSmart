// heaterModel.js
const mongoose = require('mongoose');
const heaterChangeHistory = require('./heaterChangeHistoryModel').schema;

// Setup schema
var heaterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    desiredTemperature: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    heaterChangeHistories: {
        type: [heaterChangeHistory],
        select: false
    },
});

// Export Heater model
var Heater = module.exports = mongoose.model('heater', heaterSchema);
module.exports.get = function (callback, limit) {
    Heater.find(callback).limit(limit);
}
