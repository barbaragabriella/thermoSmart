// api-routes.js
// Initialize express router
let router = require('express').Router();

// Set default API response
router.get('/', function (req, res) {
    res.json({
        status: 'API Its Working',
        message: 'Welcome to RESTHub crafted with love!',
    });
});

// Import sensor controller
var sensorController = require('./controllers/sensorController');
// Sensor routes
router.route('/sensors')
    .get(sensorController.index)
    .post(sensorController.new);

router.route('/sensors/:sensor_id')
    .get(sensorController.view)
    .patch(sensorController.update)
    .put(sensorController.update)
    .delete(sensorController.delete);

// Import heaterChangeHistory controller
var measurementController = require('./controllers/measurementController');
// heaterChangeHistory routes
router.route('/sensors/:sensor_id/measurements')
    .get(measurementController.index)
    .post(measurementController.new);
router.route('/sensors/:sensor_id/measurements/:limit')
    .get(measurementController.last);

// Import heater controller
var heaterController = require('./controllers/heaterController');
// heater routes
router.route('/heaters')
    .get(heaterController.index)
    .post(heaterController.new);

router.route('/heaters/:heater_id')
    .get(heaterController.view)
    .patch(heaterController.update)
    .put(heaterController.update)
    .delete(heaterController.delete);

// Import heaterChangeHistory controller
var heaterChangeHistoryController = require('./controllers/heaterChangeHistoryController');
// heaterChangeHistory routes
router.route('/heaters/:heater_id/heaterChangeHistories')
    .get(heaterChangeHistoryController.index)
    .post(heaterChangeHistoryController.new);
router.route('/heaters/:heater_id/heaterChangeHistories/:limit')
    .get(heaterChangeHistoryController.last);

// Export API routes
module.exports = router;
