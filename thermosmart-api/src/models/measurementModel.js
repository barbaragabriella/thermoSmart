// measurementModel.js
var mongoose = require('mongoose');
const Sensor = require('./sensorModel').schema;

// Setup schema
var measurementSchema = mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    sensor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sensor',
        required: true
    }
});

// Export Measurement model
var Measurement = module.exports = mongoose.model('measurement', measurementSchema);
module.exports.get = function (callback, limit) {
    Measurement.find(callback).limit(limit);
}
