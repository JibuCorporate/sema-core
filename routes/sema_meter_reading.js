const express = require('express');
const Sequelize = require('sequelize');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const meter_reading = require('../models').meter_reading;

/* GET Meter Reading in the database. */
router.get('/', function (req, res) {
    semaLog.info('Meter Reading - Enter');
    meter_reading.findAndCountAll().then((meterReading, count) => {
        res.status(200).json({ data: meterReading, total: count });
    });
});

router.post('/', function (req, res, next) {
    semaLog.info(req.body);
    req.check('kiosk_id', 'Parameter kiosk_id is missing').exists();
    req.check('meter_value', 'Parameter meter_value is missing').exists();

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            const errors = result.array().map(elem => {
                return elem.msg;
            });
            semaLog.error(
                'CREATE meter_reading: Validation error: ' + errors.toString()
            );
            res.status(400).send(errors.toString());
        } else {

            meter_reading.create(req.body).then(meterReading => {
                res.status(200).json(meterReading);
            })
                .catch(Sequelize.ForeignKeyConstraintError, function handleError() {
                    res.status(400).json({ message: 'Invalid Assignment Error' });
                })
                .catch(next);
        }
    })


});

module.exports = router;
