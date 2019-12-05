// heaterchangehistoryModel.js
var mongoose = require('mongoose');

// Setup schema
var heaterchangehistorySchema = mongoose.Schema({
    status: {
        type: Boolean,
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    heater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'heater',
        required: true
    }
});

// Export HeaterChangeHistory model
var HeaterChangeHistory = module.exports = mongoose.model('heaterchangehistory', heaterchangehistorySchema);
module.exports.get = function (callback, limit) {
    HeaterChangeHistory.find(callback).limit(limit);
}
