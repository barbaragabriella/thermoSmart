// sensorModel.js
const mongoose = require('mongoose');
const Measurement = require('./measurementModel').schema;

// Setup schema
var sensorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    measurements: {
        type: [Measurement],
        select: false,
    },
});

// Export Sensor model
var Sensor = module.exports = mongoose.model('sensor', sensorSchema);
module.exports.get = function (callback, limit) {
    Sensor.find(callback).limit(limit);
}
